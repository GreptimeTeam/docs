# 管理 Flows

每一个 `flow` 是 GreptimeDB 中的一个连续聚合查询。
它根据传入的数据持续更新并聚合数据。
本文档描述了如何创建、更新和删除一个 flow。

## 创建或更新 flow

创建 flow 的语法是：

<!-- ```sql
CREATE [ OR REPLACE ] FLOW [ IF NOT EXISTS ] <name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
``` -->

```sql
CREATE FLOW [ IF NOT EXISTS ] <flow-name>
SINK TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
```

<!-- 当指定 `OR REPLACE` 时，如果同名的 flow 已经存在，它将被更新为新的 flow。请注意，这只影响 flow 任务本身，源表和目标表不会被更改。 -->

- `flow-name` 是目录级别的唯一标识符。
- `sink-table-name` 是存储聚合数据的表名。
  它可以是一个现有的表或一个新表。如果目标表不存在，`flow` 将创建目标表。
  <!-- 如果表已经存在，其 schema 必须与查询结果的 schema 匹配。 -->
- `EXPIRE AFTER` 是一个可选的时间间隔，用于从 Flow 引擎中过期数据。
  有关更多详细信息，请参考 [`EXPIRE AFTER`](#expire-after-语句) 部分。
- `COMMENT` 是 flow 的描述。
- `SQL` 部分定义了用于连续聚合的查询。
  它定义了为 flow 提供数据的源表。
  每个 flow 可以有多个源表。
  有关详细信息，请参考[编写查询](./query.md) 部分。

一个创建 flow 的简单示例：

<!-- ```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
EXPIRE AFTER INTERVAL '1 hour'
COMMENT = "My first flow in GreptimeDB"
AS
SELECT count(item) from my_source_table GROUP BY tumble(time_index, INTERVAL '5 minutes');
``` -->

```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
COMMENT = "My first flow in GreptimeDB"
AS
SELECT count(item) from my_source_table GROUP BY tumble(time_index, INTERVAL '5 minutes', '2024-05-20 00:00:00');
```

创建的 flow 将每 5 分钟计算 `count(item)` 并将结果存储在 `my_sink_table` 中。所有在 1 小时内的数据将在 flow 中使用。有关 `tumble()` 函数，请参考[定义时间窗口](./define-time-window.md) 部分。

### `EXPIRE AFTER` 语句

Flow 引擎使用两个时间概念：数据时间戳和处理时间。

数据时间戳是 source 表中 time index 列中存储的时间，
处理时间是 Flow 引擎执行聚合操作的时刻。

`EXPIRE AFTER` 子句指定数据过期的时间间隔。
任何时间戳早于处理时间减去时间间隔的数据将被过期。
也就是说 Flow 引擎只聚合在此时间间隔内的数据。

例如，如果 Flow 引擎在 10:00:00 执行聚合操作，并设置了 `INTERVAL '1 hour'`，
则在处理时间之前 1 小时的数据（09:00:00 之前的数据）将被过期。
只有在 09:00:00 到 10:00:00 之间的数据将用于聚合。

`EXPIRE` 操作仅从 Flow 引擎中过期数据，不会影响源表中的数据。

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
