# 管理 Flows

每一个 `flow` 是 GreptimeDB 中的一个连续聚合查询。
它根据传入的数据持续更新并聚合数据。
本文档描述了如何创建、更新和删除一个 flow。

一个 `flow` 有以下属性：
- `name`: flow 的名称。在目录级别中是唯一的标识符。
- `source tables`: 为 flow 提供数据的表。每个 flow 可以有多个 source 表。
- `sink table`: 存储聚合数据的结果表。
<!-- - `expire after`: 从 source 表中过期数据的时间间隔。过期时间之后的数据将不会在 flow 中使用。 -->
- `comment`: flow 的描述。
- `SQL`: 定义 flow 的连续聚合查询。有关可用表达式，请参阅 [表达式](./expression.md)。

## 创建或更新 flow

创建 flow 的语法是：

<!-- ```sql
CREATE [ OR REPLACE ] FLOW [ IF NOT EXISTS ] <name>
OUTPUT TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
``` -->

```sql
CREATE FLOW [ IF NOT EXISTS ] <name>
OUTPUT TO <sink-table-name>
[ EXPIRE AFTER <expr> ]
[ COMMENT = "<string>" ]
AS 
<SQL>;
```

<!-- 当指定 `OR REPLACE` 时，如果同名的 flow 已经存在，它将被更新为新的 flow。请注意，这只影响 flow 任务本身，源表和目标表不会被更改。 -->

`sink-table-name` 是存储聚合数据的表名。
它可以是一个现有表或一个新表，`flow` 会在目标表不存在时创建它。
但如果表已经存在，表的 schema 必须与查询结果的模式匹配。

<!-- `expire after` 是一个可选的时间间隔，用于从源表中过期数据。过期时间是相对于当前时间的时间（“当前时间”是指数据到达 Flow 引擎的物理时间）。例如，`INTERVAL '1 hour'` 表示数据 **早于** 1 小时的数据将被过期。过期数据将直接被删除。 -->

`SQL` 部分定义了连续聚合查询。
有关详细信息，请参阅 [编写查询](./query.md) 部分。
一般来说，`SQL` 部分就像一个普通的 `SELECT` 子句，只是有一些不同。

一个创建 flow 的简单示例：

<!-- ```sql
CREATE FLOW IF NOT EXISTS my_flow
OUTPUT TO my_sink_table
EXPIRE AFTER INTERVAL '1 hour'
COMMENT = "My first flow in GreptimeDB"
AS
SELECT count(item) from my_source_table GROUP BY tumble(time_index, INTERVAL '5 minutes');
``` -->

```sql
CREATE FLOW IF NOT EXISTS my_flow
OUTPUT TO my_sink_table
COMMENT = "My first flow in GreptimeDB"
AS
SELECT count(item) from my_source_table GROUP BY tumble(time_index, INTERVAL '5 minutes', '2024-05-20 00:00:00');
```

该 Flow 将每 5 分钟计算 `count(item)` 并将结果存储在 `my_sink_table` 中。
有关 `tumble()` 函数，请参考[定义时间窗口](./define-time-window.md) 部分。

<!-- 创建的 flow 将每 5 分钟计算 `count(item)` 并将结果存储在 `my_sink_table` 中。所有在 1 小时内的数据将在 flow 中使用。有关 `tumble()` 函数，请参考[定义时间窗口](./define-time-window.md) 部分。 -->

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
