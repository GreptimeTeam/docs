---
keywords: [创建 flow, 删除 flow, 输入表, sink 表, SQL 语法, 时间窗口, 刷新 flow]
description: 介绍如何在 GreptimeDB 中创建和删除 flow，包括创建 sink 表、flow 的 SQL 语法和示例。
---

# 管理 Flow

每一个 `flow` 是 GreptimeDB 中的一个持续聚合查询。
它根据传入的数据持续更新并聚合数据。
本文档描述了如何创建和删除一个 flow。

## 创建输入表

在创建 `flow` 之前，你需要先创建一张输入表来存储原始的输入数据，比如：
```sql
CREATE TABLE temp_sensor_data (
  sensor_id INT,
  loc STRING,
  temperature DOUBLE,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY(sensor_id, loc)
);
```
但是如果你不想存储输入数据，可以在创建输入表时设置表选项 `WITH ('ttl' = 'instant')` 如下：
```sql
CREATE TABLE temp_sensor_data (
  sensor_id INT,
  loc STRING,
  temperature DOUBLE,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY(sensor_id, loc)
) WITH ('ttl' = 'instant');
```

将 `ttl` 设置为 `'instant'` 会使得输入表成为一张临时的表，也就是说它会自动丢弃一切插入的数据，而表本身一直会是空的，插入数据只会被送到 `flow` 任务处用作计算用途。

## 创建 sink 表

在创建 flow 之前，你需要有一个 sink 表来存储 flow 生成的聚合数据。
虽然它与常规的时间序列表相同，但有一些重要的注意事项：

- **列的顺序和类型**：确保 sink 表中列的顺序和类型与 flow 查询结果匹配。
- **时间索引**：为 sink 表指定 `TIME INDEX`，通常使用时间窗口函数生成的时间列。
- **更新时间**：Flow 引擎会自动将更新时间附加到每个计算结果行的末尾。此更新时间存储在 `updated_at` 列中。请确保在 sink 表的 schema 中包含此列。
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
  date_bin('10 seconds'::INTERVAL, ts) AS time_window
FROM temp_sensor_data
GROUP BY
  sensor_id,
  loc,
  time_window
HAVING max_temp > 100;
```

sink 表包含列 `sensor_id`、`loc`、`max_temp`、`time_window` 和 `update_at`。

- 前四列分别对应 flow 的查询结果列 `sensor_id`、`loc`、`max(temperature)` 和 `date_bin('10 seconds'::INTERVAL, ts)`。
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
  有关更多详细信息，请参考 [`EXPIRE AFTER`](#expire-after) 部分。
- `COMMENT` 是 flow 的描述。
- `SQL` 部分定义了用于持续聚合的查询。
  它定义了为 flow 提供数据的源表。
  每个 flow 可以有多个源表。
  有关详细信息，请参考[编写查询](#编写-sql-查询) 部分。

一个创建 flow 的简单示例：

```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
EXPIRE AFTER '1 hour'::INTERVAL
COMMENT 'My first flow in GreptimeDB'
AS
SELECT
    max(temperature) as max_temp,
    date_bin('10 seconds'::INTERVAL, ts) as time_window,
FROM temp_sensor_data
GROUP BY time_window;
```

创建的 flow 将每 10 秒计算一次 `max(temperature)` 并将结果存储在 `my_sink_table` 中。
所有在 1 小时内的数据都将用于 flow 计算。

### EXPIRE AFTER

`EXPIRE AFTER` 子句指定数据将在 flow 引擎中过期的时间间隔。

source 表中超出指定过期时间的数据将不再被包含在 flow 的计算范围内。  
同理，sink 表中超过过期时间的历史数据也不会被更新。  
这意味着 flow 引擎在聚合计算时会自动忽略早于该时间间隔的数据。这一机制有助于管理有状态查询（例如涉及 `GROUP BY` 的查询）的状态存储规模。

需特别注意的是：  
- `EXPIRE AFTER` 子句**不会删除** source 表或 sink 表中的数据，它仅控制 flow 引擎对数据的处理范围  
- 若需删除表数据，请在创建表时通过 [`TTL` 策略](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)实现  

为 `EXPIRE AFTER` 设置合理的时间间隔，可有效限制 flow 的状态存储规模并避免内存溢出。该机制与流处理中的 ["水位线"](https://docs.risingwave.com/processing/watermarks) 概念有相似之处——两者均通过时间边界定义计算的有效数据范围，过期数据将不再参与流式计算过程。

例如，如果 flow 引擎在 10:00:00 处理聚合，并且设置了 `'1 hour'::INTERVAL`，
当前时刻若输入数据的 Time Index 超过 1 小时（即早于 09:00:00），则会被判定为过期数据并被忽略。
仅时间戳为 09:00:00 及之后的数据会参与聚合计算，并更新到目标表。

### 编写 SQL 查询

flow 的 `SQL` 部分类似于标准的 `SELECT` 子句，但有一些不同之处。查询的语法如下：

```sql
SELECT AGGR_FUNCTION(column1, column2,..) [, TIME_WINDOW_FUNCTION() as time_window] FROM <source_table> GROUP BY {time_window | column1, column2,.. };
```

在 `SELECT` 关键字之后只允许以下类型的表达式：
- 聚合函数：有关详细信息，请参阅[表达式](./expressions.md)文档。
- 时间窗口函数：有关详细信息，请参阅[定义时间窗口](#define-time-window)部分。
- 标量函数：例如 `col`、`to_lowercase(col)`、`col + 1` 等。这部分与 GreptimeDB 中的标准 `SELECT` 子句相同。

查询语法中的其他部分需要注意以下几点：
- 必须包含一个 `FROM` 子句以指定 source 表。由于目前不支持 join 子句，因此只能聚合来自单个表的列。
- 支持 `WHERE` 和 `HAVING` 子句。`WHERE` 子句在聚合之前过滤数据，而 `HAVING` 子句在聚合之后过滤数据。
- `DISTINCT` 目前仅适用于 `SELECT DISTINCT column1 ..` 语法。它用于从结果集中删除重复行。`SELECT count(DISTINCT column1) ...` 尚不可用，但将来会添加。
- `GROUP BY` 子句的工作方式与标准查询相同，即按指定列对数据进行分组，在其中指定时间窗口列对于持续聚合场景至关重要。
  `GROUP BY` 中的其他表达式可以是 literal、列名或 scalar 表达式。
- 不支持`ORDER BY`、`LIMIT` 和 `OFFSET`。

有关如何在实时分析、监控和仪表板中使用持续聚合的更多示例，请参阅[持续聚合](./continuous-aggregation.md)。

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
    date_bin('10 seconds'::INTERVAL, ts) as time_window
FROM temp_sensor_data
GROUP BY time_window;
```

在此示例中，`date_bin('10 seconds'::INTERVAL, ts)` 函数创建从 UTC 00:00:00 开始的 10 秒时间窗口。
`max(temperature)` 函数计算每个时间窗口内的最大温度值。

有关该函数行为的更多详细信息，
请参阅 [`date_bin`](/reference/sql/functions/df-functions.md#date_bin)。

:::tip 提示
目前，flow 依赖时间窗口表达式来确定如何增量更新结果。因此，建议尽可能使用相对较小的时间窗口。
:::

## 刷新 flow

当 source 表中有新数据到达时，flow 引擎会在短时间内（比如数秒）自动处理聚合操作。
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
