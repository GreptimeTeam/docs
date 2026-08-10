---
keywords: [GreptimeDB 事件, DDL 事件]
description: 查看 GreptimeDB 记录的 DDL 事件。
---

# DDL 事件

DDL 事件记录已提交的数据库对象变更的生命周期，包括提交行和完成行。本页
用于检查已记录的事件，不要求运维人员按某种流程专门生成事件。公共字段和
Procedure 状态请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)，通用查询方式请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。

## 数据库事件

数据库事件使用 `catalog_name` 和 `schema_name` 定位；其中
`schema_name` 是数据库名。`Running` 行的 payload 描述请求的选项或操作，
而在观测到的运行时中，终态 `Done` 行的 payload 通常为 JSON `null`。

支持的类型如下：

- `create_database`：创建选项，例如 `create_if_not_exists` 和数据库选项。
- `alter_database`：选项操作及其值，例如 `set` 和 `ttl`。
- `drop_database`：是否允许数据库不存在。

观测到的行示例：

```text
create_database  Running  docs_ev2723_ddl_db_20260810  {"create_if_not_exists":true,"options":[{"key":"ttl","value":"1h"}],"version":1}
alter_database   Running  docs_ev2723_ddl_db_20260810  {"action":"set","options":[{"key":"ttl","value":"2h"}],"version":1}
drop_database    Running  docs_ev2723_ddl_db_20260810  {"drop_if_exists":true,"version":1}
```

## 表事件

使用 `catalog_name`、`schema_name` 和 `table_name` 定位表。要跟踪一张表的
完整生命周期，可使用 `table_id`：创建操作的提交行可能没有 ID，而完成行
可能包含新分配的 ID。payload 表示表操作或选项；本次运行时观测到的完成行
使用 JSON `null`。

表事件源代码支持以下类型：

| 类型 | payload 意图 |
| --- | --- |
| `create_table` | 创建选项，包括引擎和 `create_if_not_exists`。 |
| `create_logical_tables` | 创建逻辑表的意图。源代码支持；运行时证据中未观测到。 |
| `alter_table` | 表结构变更，例如 `add_columns`。 |
| `alter_logical_tables` | 修改逻辑表的意图。源代码支持；运行时证据中未观测到。 |
| `drop_table` | 是否允许表不存在。 |
| `truncate_table` | 截断的时间范围；观测到的 payload 使用 `time_range_count` 表示。 |
| `undrop_table` | 仅企业版支持：恢复已删除的表。源代码支持；未采集线上证据。 |
| `purge_dropped_table` | 仅企业版支持：永久清理已删除的表。源代码支持；未采集线上证据。 |

观测到的查询和结果：

```sql
SELECT timestamp, type, procedure_state, table_name, table_id,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_ddl_20260810'
  AND type IN ('create_table', 'alter_table', 'truncate_table', 'drop_table')
ORDER BY timestamp;
```

```text
create_table    Running  ddl_source      NULL  {"create_if_not_exists":false,"engine":"mito","version":1}
create_table    Done     ddl_source      1449  null
alter_table     Running  ddl_source      1449  {"kind":"add_columns","version":1}
truncate_table  Running  ddl_drop_probe  1451  {"time_range_count":0,"version":1}
drop_table      Running  ddl_drop_probe  1451  {"drop_if_exists":false,"version":1}
```

上表中的逻辑表类型和企业版类型是源代码支持的名称，不代表观测到了对应
的事件行。

## Flow 事件

Flow 事件使用 `catalog_name`、`flow_name` 和 `flow_id` 定位。在本次运行时
证据中，Flow 行的 `schema_name` 是 SQL `NULL`，因此不要用它定位 Flow。
payload 记录创建或删除意图，例如执行间隔、替换、过期时间和对象不存在时
的处理方式。

```sql
SELECT timestamp, type, procedure_state, catalog_name, schema_name,
       flow_name, flow_id, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime' AND flow_name = 'ddl_flow'
ORDER BY timestamp;
```

观测到的行包括：

```text
create_flow  Running  greptime  NULL  ddl_flow  NULL  {"create_if_not_exists":false,"eval_interval_secs":10,"expire_after":null,"or_replace":false,"version":1}
create_flow  Done     greptime  NULL  ddl_flow  1025  null
drop_flow    Running  greptime  NULL  ddl_flow  1025   {"drop_if_exists":false,"version":1}
```

源代码支持的 Flow 类型为 `create_flow` 和 `drop_flow`。

## View 事件

View 事件使用 `catalog_name`、`schema_name`、`view_name` 和 `view_id` 定位。
创建 payload 记录替换行为以及定义的简要信息，例如引用表数和列数；删除
payload 记录对象不存在时的处理方式。

```text
create_view  Running  ddl_view  NULL  {"column_count":0,"create_if_not_exists":false,"or_replace":false,"referenced_table_count":1,"version":1}
create_view  Done     ddl_view  1452  null
drop_view    Running  ddl_view  1452  {"drop_if_exists":false,"version":1}
```

源代码支持的 View 类型为 `create_view` 和 `drop_view`。关于提交、完成和失
败状态的解释，请参阅[Procedure 生命周期](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)。
