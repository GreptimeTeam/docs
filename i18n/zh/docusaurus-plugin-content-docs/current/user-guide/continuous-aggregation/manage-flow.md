---
description: 介绍如何在 GreptimeDB 中创建和删除 flow，包括创建 sink 表、flow 的 SQL 语法和示例。
---

# 管理 Flows

每一个 `flow` 是 GreptimeDB 中的一个持续聚合查询。
它根据传入的数据持续更新并聚合数据。
本文档描述了如何创建和删除一个 flow。

## 创建 sink 表

在创建 flow 之前，你需要有一个 sink 表来存储 flow 生成的聚合数据。
虽然它与常规的时间序列表相同，但有一些重要的注意事项：

- **列的顺序和类型**：确保 sink 表中列的顺序和类型与 flow 查询结果匹配。
- **时间索引**：为 sink 表指定 `TIME INDEX`，通常使用时间窗口函数生成的时间列。
- **将 `update_at` 指定为 schema 的最后一列**：flow 会自动将数据的更新时间写入 `update_at` 列。请确保此列是 sink 表模式中的最后一列。
- **Tag**：使用 `PRIMARY KEY` 指定 Tag，与 time index 一起作为行数据的唯一标识，并优化查询性能。

例如：

```sql
/* 创建 sink 表 */
CREATE TABLE temp_alerts (
  sensor_id INT,
  loc STRING,
  max_temp DOUBLE,
  time_window TIMESTAMP TIME INDEX,
  update_at TIMESTAMP,
  PRIMARY KEY(sensor_id, loc)
);

CREATE FLOW temp_monitoring
SINK TO temp_alerts
AS
SELECT
  sensor_id,
  loc,
  max(temperature) AS max_temp,
  date_bin(INTERVAL '10 seconds', ts) AS time_window
FROM temp_sensor_data
GROUP BY
  sensor_id,
  loc,
  time_window
HAVING max_temp > 100;
```

sink 表包含列 `sensor_id`、`loc`、`max_temp`、`time_window` 和 `update_at`。

- 前四列分别对应 flow 的查询结果列 `sensor_id`、`loc`、`max(temperature)` 和 `date_bin(INTERVAL '10 seconds', ts)`。
- `time_window` 列被指定为 sink 表的 `TIME INDEX`。
- `update_at` 列是 schema 中的最后一列，用于存储数据的更新时间。
- 最后的 `PRIMARY KEY` 指定 `sensor_id` 和 `loc` 作为 Tag 列。
  这意味着 flow 将根据 Tag `sensor_id` 和 `loc` 以及时间索引 `time_window` 插入或更新数据。

## 创建 flow

创建 flow 的语法是：

```sql
CREATE [ OR REPLACE ] FLOW [ IF NOT EXISTS ] <flow-name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT '<string>' ]
AS 
<SQL>;
```

当指定 `OR REPLACE` 时，如果已经存在同名的 flow，它将被更新为新 flow。请注意，这仅影响 flow 任务本身，source 表和 sink 表将不会被更改。当指定 `IF NOT EXISTS` 时，如果 flow 已经存在，它将不执行任何操作，而不是报告错误。还需要注意的是，`OR REPLACE` 不能与 `IF NOT EXISTS` 一起使用。

- `flow-name` 是目录级别的唯一标识符。
- `sink-table-name` 是存储聚合数据的表名。
  它可以是一个现有的表或一个新表。如果目标表不存在，`flow` 将创建目标表。
  <!-- 如果表已经存在，其 schema 必须与查询结果的 schema 匹配。 -->
- `EXPIRE AFTER` 是一个可选的时间间隔，用于从 Flow 引擎中过期数据。
  有关更多详细信息，请参考 [`EXPIRE AFTER`](#expire-after-语句) 部分。
- `COMMENT` 是 flow 的描述。
- `SQL` 部分定义了用于持续聚合的查询。
  它定义了为 flow 提供数据的源表。
  每个 flow 可以有多个源表。
  有关详细信息，请参考[编写查询](#编写-sql-查询) 部分。

一个创建 flow 的简单示例：

```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
EXPIRE AFTER INTERVAL '1 hour'
COMMENT 'My first flow in GreptimeDB'
AS
SELECT
    max(temperature) as max_temp,
    date_bin(INTERVAL '10 seconds', ts) as time_window,
FROM temp_sensor_data
GROUP BY time_window;
```

创建的 flow 将每 10 秒计算一次 `max(temperature)` 并将结果存储在 `my_sink_table` 中。
所有在 1 小时内的数据都将用于 flow 计算。

### `EXPIRE AFTER` 子句

`EXPIRE AFTER` 子句指定数据将在 flow 引擎中过期的时间间隔。
此过期仅影响 flow 引擎中的数据，不影响 source 表中的数据。

当 flow 引擎处理聚合操作（`update_at` 时间）时，
时间索引早于指定间隔的数据将过期。

例如，如果 flow 引擎在 10:00:00 处理聚合，并且设置了 `INTERVAL '1 hour'`，
则早于 09:00:00 的数据将过期。
只有从 09:00:00 开始的数据将用于聚合。

### 编写 SQL 查询

flow 的 `SQL` 部分类似于标准的 `SELECT` 子句，但有一些不同之处。查询的语法如下：

```sql
SELECT AGGR_FUNCTION(column1, column2,..), TIME_WINDOW_FUNCTION() as time_window FROM <source_table> GROUP BY time_window;
```

在 `SELECT` 关键字之后只允许以下类型的表达式：
- 聚合函数：有关详细信息，请参阅[表达式](./expression.md)文档。
- 时间窗口函数：有关详细信息，请参阅[定义时间窗口](#define-time-window)部分。
- 标量函数：例如 `col`、`to_lowercase(col)`、`col + 1` 等。这部分与 GreptimeDB 中的标准 `SELECT` 子句相同。

查询语法中的其他部分需要注意以下几点：
- 必须包含一个 `FROM` 子句以指定 source 表。由于目前不支持 join 子句，因此只能聚合来自单个表的列。
- 支持 `WHERE` 和 `HAVING` 子句。`WHERE` 子句在聚合之前过滤数据，而 `HAVING` 子句在聚合之后过滤数据。
- `DISTINCT` 目前仅适用于 `SELECT DISTINCT column1 ..` 语法。它用于从结果集中删除重复行。`SELECT count(DISTINCT column1) ...` 尚不可用，但将来会添加。
- `GROUP BY` 子句的工作方式与标准查询相同，即按指定列对数据进行分组，在其中指定时间窗口列对于持续聚合场景至关重要。
  `GROUP BY` 中的其他表达式可以是 literal、列名或 scalar 表达式。
- 不支持`ORDER BY`、`LIMIT` 和 `OFFSET`。

有关如何在实时分析、监控和仪表板中使用持续聚合的更多示例，请参阅[用例示例](./usecase-example.md)。

### 定义时间窗口

时间窗口是持续聚合查询的重要属性。
它定义了数据在流中的聚合方式。
这些窗口是左闭右开的区间。

时间窗口对应于时间范围。
source 表中的数据将根据时间索引列映射到相应的窗口。
时间窗口也是聚合表达式计算的范围，因此每个时间窗口将在结果表中生成一行。

你可以在 `SELECT` 关键字之后使用 `date_bin()` 来定义固定的时间窗口。
例如：

```sql
SELECT
    max(temperature) as max_temp,
    date_bin(INTERVAL '10 seconds', ts) as time_window
FROM temp_sensor_data
GROUP BY time_window;
```

在此示例中，`date_bin(INTERVAL '10 seconds', ts)` 函数创建从 UTC 00:00:00 开始的 10 秒时间窗口。
`max(temperature)` 函数计算每个时间窗口内的最大温度值。

有关该函数行为的更多详细信息，
请参阅 [`date_bin`](/reference/sql/functions/df-functions.md#date_bin)。

:::tip 提示
目前，flow 的内部状态（例如记录当前计数的 `count(col)` 的累加值）没有持久存储。
为了在内部状态故障时尽量减少数据丢失，建议使用较小的时间窗口。

这种内部状态丢失不会影响 sink 表中的现有数据。
:::

## 刷新 flow

当 source 表中有新数据到达时，flow 引擎会在 1 秒内自动处理聚合操作。
但你依然可以使用 `ADMIN FLUSH_FLOW` 命令手动触发 flow 引擎立即执行聚合操作。

```sql
ADMIN FLUSH_FLOW('<flow-name>')
```

## 删除 flow

请使用以下 `DROP FLOW` 子句删除 flow：

To delete a flow, use the following `DROP FLOW` clause:

```sql
DROP FLOW [IF EXISTS] <name>
```

例如：

```sql
DROP FLOW IF EXISTS my_flow;
```
