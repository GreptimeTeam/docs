---
keywords: [创建 flow, 删除 flow, source 表, sink 表, SQL 语法, 时间窗口, 刷新 flow]
description: 介绍如何在 GreptimeDB 中创建和删除 flow，包括创建 sink 表、flow 的 SQL 语法和示例。
---

# 管理 Flow

每一个 `flow` 是 GreptimeDB 中的一个持续聚合查询。
它根据传入的数据持续更新并聚合数据。
本文档描述了如何创建和删除一个 flow。

:::note
Flow 对聚合和 TQL workload 使用 batching mode。简单的非聚合 Flow 查询当前会使用已废弃的 streaming mode，不推荐新 workload 使用。
:::

<AnchorAlias id="创建输入表" />
## 创建 source 表

在创建 `flow` 之前，你需要先创建一张 source 表来存储原始数据，比如：
```sql
CREATE TABLE temp_sensor_data (
  sensor_id INT,
  loc STRING,
  temperature DOUBLE,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY(sensor_id, loc)
);
```
对于新的 workload，请避免在 Flow source 表上使用 `WITH ('ttl' = 'instant')`。这是旧的使用方式，不推荐用于新的聚合或 TQL workload。请为 source 数据设置合适的保留策略。

## 创建 sink 表

flow 把聚合结果写入 sink 表。如果 sink 表不存在，`CREATE FLOW` 会在能够从查询结果推断 schema 时自动创建它。
如果需要控制 schema 或布局，或者查询较复杂难以推断，请预先创建 sink 表。已有 sink 表会根据 flow 查询结果进行校验。
source 表和 sink 表不能是同一张表。

sink 表必须与 flow 查询结果兼容，即：

- **列的顺序和类型**：对于预先创建的 SQL sink，列的顺序和类型应与查询输出匹配。
- **时间索引**：为 sink 表指定 `TIME INDEX`，通常使用时间窗口函数生成的时间列。
- **更新时间**：自动创建的 batching SQL sink 会添加 `update_at` 列来记录更新时间。TQL sink 遵循查询输出，不会自动添加 `update_at`。预先创建的 SQL sink 可以与查询输出列数一致，也可以在末尾额外包含一个用于更新时间的时间戳列。
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
[ EVAL INTERVAL <interval> ]
[ COMMENT '<string>' ]
[ WITH (<flow-option> = <value> [, ...]) ]
AS
<SQL>;
```

子句必须按上述顺序出现：`EXPIRE AFTER` 在 `EVAL INTERVAL` 之前。
`EVAL INTERVAL` 会按计划重复执行完整查询。只要 SQL 查询引擎能够生成有效计划，带调度的 SQL Flow
就支持 join、子查询和 SQL CTE。TQL Flow 必须使用 `EVAL INTERVAL`；批处理时间窗口聚合 Flow 可以不使用它。

当指定 `OR REPLACE` 时，如果已经存在同名的 flow，它将被更新为新 flow。请注意，这仅影响 flow 任务本身，source 表和 sink 表将不会被更改。当指定 `IF NOT EXISTS` 时，如果 flow 已经存在，它将不执行任何操作，而不是报告错误。还需要注意的是，`OR REPLACE` 不能与 `IF NOT EXISTS` 一起使用。

- `flow-name` 是目录级别的唯一标识符。
- `sink-table-name` 是存储聚合数据的表名。
  它可以是一个现有的表或一个新表；有关创建和校验行为，请参阅[创建 sink 表](#创建-sink-表)。
- `EXPIRE AFTER` 是一个可选的时间间隔，用于使 Flow 引擎中的数据过期。有关详细信息，请参考 [`EXPIRE AFTER`](#expire-after) 部分。
- `EVAL INTERVAL` 是用于按计划执行完整查询的可选时间间隔。TQL Flow 必须使用它。
- `COMMENT` 是 flow 的描述。
- `WITH` 指定 flow 选项。
  本文档介绍的用户 Flow 选项为 `defer_on_missing_source` 和实验性的 `experimental_enable_incremental_read`。
- `SQL` 部分定义了用于持续聚合的查询。
  它定义了为 flow 提供数据的源表。
  每个 flow 可以有多个源表。
  有关详细信息，请参考[编写 SQL 查询](#编写-sql-查询)部分。

一个创建 flow 的简单示例：

```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
EXPIRE AFTER '1 hour'::INTERVAL
COMMENT 'My first flow in GreptimeDB'
AS
SELECT
    max(temperature) as max_temp,
    date_bin('10 seconds'::INTERVAL, ts) as time_window
FROM temp_sensor_data
GROUP BY time_window;
```

创建的 flow 会将 `max(temperature)` 按 10 秒时间窗口分组，并将结果存储在 `my_sink_table` 中。
最近 1 小时内的数据会用于 flow 计算。

### EXPIRE AFTER

`EXPIRE AFTER` 子句指定数据将在 flow 引擎中过期的时间间隔。

对于包含可用时间窗口表达式的 Flow，source 表中早于指定间隔的数据会被排除在计算之外，sink 表中较早的行也不会被更新。这会限制时间窗口 Flow 的状态和重新计算范围，包括涉及 `GROUP BY` 的有状态查询。

调度的完整 SQL Flow 和 TQL Flow 会执行未过滤的快照，除非查询本身包含时间谓词；`EXPIRE AFTER` 不会额外添加时间过滤。它不会删除 source 表或 sink 表中的数据。若需删除表数据，请在创建表时通过 [`TTL` 策略](/user-guide/manage-data/overview.md#使用-ttl-策略保留数据)实现。

为 `EXPIRE AFTER` 设置合理的时间间隔，有助于限制 batching 引擎需要向前重新计算结果的时间范围，并避免过度占用资源。它与流处理系统中限制迟到数据范围的机制有相似目的，但新的 Flow workload 应使用 batching mode。

例如，如果 flow 引擎在 10:00:00 处理聚合，并且设置了 `'1 hour'::INTERVAL`，
当前时刻若输入数据的 Time Index 超过 1 小时（即早于 09:00:00），则会被判定为过期数据并被忽略。
仅时间戳为 09:00:00 及之后的数据会参与聚合计算，并更新到目标表。

### 缺少 source 时延迟创建

默认情况下，如果任一 source 表不存在，创建 Flow 会失败。将 `defer_on_missing_source` 设置为 `true`，
可以在不失败的情况下持久化一个 pending Flow；当 source 仍未解析时，该 Flow 不会被调度。

```sql
CREATE FLOW pending_flow
SINK TO pending_sink
WITH (defer_on_missing_source = 'true')
AS
SELECT * FROM source_created_later;
```

### 实验性的增量 source 读取

:::warning 实验性功能
`experimental_enable_incremental_read` 选项是实验性的。
它的行为和限制可能会在未来版本中变化。
:::

对于 source 表为 append-only 表的 batching SQL flow，可以启用增量 source 读取：

```sql
CREATE TABLE temp_sensor_data (
  sensor_id INT,
  loc STRING,
  temperature DOUBLE,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY(sensor_id, loc)
) WITH ('append_mode' = 'true');

CREATE FLOW temp_monitoring
SINK TO temp_alerts
WITH (experimental_enable_incremental_read = 'true')
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
  time_window;
```

启用该选项后，Flow 会在初始全量快照之后尝试只读取新追加的 source 行。
这是一个执行优化，不会改变查询结果，也不构成持久化保证：首次运行、重启后的运行，或无法安全增量读取时，可能会使用全量快照。

当前限制如下：

- 所有 source 表都必须是使用 `append_mode = 'true'` 创建的 append-only 表。
  如果任意 source 表不是 append-only 表，创建 Flow 会失败。
- 该优化只适用于符合条件的 batching SQL flow。TQL flow 和不支持增量读取的计划会使用正常的全量快照行为。

### 编写 SQL 查询

`AS` 后的 SQL 会作为标准 SQL 查询进行规划。典型的 batching 时间窗口聚合可以使用以下形式：

```sql
SELECT AGGR_FUNCTION(column1, column2,..) [, TIME_WINDOW_FUNCTION() as time_window]
FROM <source_table>
GROUP BY {time_window | column1, column2,.. };
```

具体支持哪些 SQL 表达式和子句取决于 SQL 查询引擎和 Flow 计划。带调度的完整 SQL Flow 支持查询规划器能够生成有效计划的
join、子查询和 SQL CTE；不受支持的计划会在创建 Flow 时失败。对于 batching 时间窗口聚合，`GROUP BY` 通常包含时间窗口表达式。
有关 Flow 查询中常用的函数，请参阅[表达式](./expressions.md)；有关固定时间窗口，请参阅[定义时间窗口](#define-time-window)。

有关如何在实时分析、监控和仪表板中使用持续聚合的更多示例，请参阅[持续聚合](./continuous-aggregation.md)。

<AnchorAlias id="define-time-window" />
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
时间窗口表达式可帮助 Flow 确定如何增量更新结果。合适的窗口大小取决于 workload 和查询语义。
:::

## 检查 Flow

可以使用以下语句和系统表检查 Flow 的定义及运行时信息：

```sql
SHOW FLOWS;
SHOW CREATE FLOW my_flow;
SHOW FLOW STATUS LIKE 'my%';
SELECT * FROM information_schema.flows;
SELECT * FROM information_schema.flow_statistics;
```

`SHOW FLOWS` 列出 Flow，`SHOW CREATE FLOW` 返回 Flow 定义，`SHOW FLOW STATUS` 返回运行时统计信息。
`information_schema` 中的两张表分别提供定义和统计信息。在分布式部署中，运行时字段初始可能为 `NULL`，
其值也可能落后于最新状态。

## 刷新 flow

当 source 表中有新数据到达时，flow 引擎会在短时间内（比如数秒）自动处理聚合操作。
但你依然可以使用 `ADMIN FLUSH_FLOW` 命令手动触发 flow 引擎立即执行聚合操作。

```sql
ADMIN FLUSH_FLOW('<flow-name>')
```

## 删除 flow

请使用以下 `DROP FLOW` 子句删除 flow：

```sql
DROP FLOW [IF EXISTS] <name>
```

例如：

```sql
DROP FLOW IF EXISTS my_flow;
```
