---
keywords: [GreptimeDB 事件, 事件数据模型]
description: 了解 GreptimeDB events 表的数据模型。
---

# 事件数据模型

`greptime_private.events` 使用公共封装。事件族专用列是稀疏列；事件族不填充时为
SQL `NULL`。

| 列 | 含义 |
| --- | --- |
| `type` | 事件类型，例如 `create_table` 或 `region_migration`。 |
| `timestamp` | 记录该行的时间。 |
| `procedure_id` | 同一 Procedure 的事件行共享的 ID。 |
| `procedure_state` | Procedure 状态，例如 `Running` 或 `Done`。 |
| `procedure_trigger` | JSON 触发器，例如 `Submitted`、`ChildSubmitted`、`Succeeded` 或 `Failed`。 |
| `procedure_error` | Procedure 失败时的错误文本。 |
| `payload` | 类型相关的 JSON；提交行通常包含操作意图。 |
| `event_context` | 有上下文时，用于描述事件触发原因的 JSON。 |

Runner 通过存活 Procedure 的 `event()` hook 重新生成终态事件。终态事件族字段由类型
决定，不保证是提交字段的副本。记录是异步、尽力而为的。

存在 `event_context` 时，其中的稳定 `reason` 值可以是
`manual`、`auto_create`、`auto_alter`、`auto_repartition`、`auto_rebalance`、
`region_failover`、`scheduled_gc` 或 `unknown`。例如，通过 MySQL 提交的事件可能包含
`{"protocol":"mysql","reason":"manual"}`。

如需查看针对性的示例，请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)、
[Procedure 生命周期](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)和
[DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。

## 查询 JSON 字段

详细信息请参阅 [JSON 函数](/reference/sql/functions/json.md)。在事件查询中，
`json_to_string` 将 JSON 值转换为可读文本，`json_get_string` 按路径提取值，
`json_path_match` 计算 JSON 谓词，`json_is_null` 检查值是否为 JSON `null`。如需检查
SQL `NULL`，应单独使用 `IS NULL`。

例如，以下查询从包含 event context 的 `create_table` 行中提取相关字段：

```sql
SELECT procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_path_match(procedure_trigger, '$.type == "Submitted"') AS is_submitted,
       json_get_string(event_context, 'reason') AS reason
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND event_context IS NOT NULL
ORDER BY timestamp;
```

```sql
+-----------------+--------------+--------------+--------+
| procedure_state | trigger_type | is_submitted | reason |
+-----------------+--------------+--------------+--------+
| Running         | Submitted    |            1 | manual |
+-----------------+--------------+--------------+--------+
```

## JSON `null` 和 SQL `NULL`

在 `create_table` 示例以及 DDL/repartition 生命周期事件中，终态 `payload` 可能是
JSON `null`，而不是 SQL `NULL`：

```sql
SELECT procedure_state, json_to_string(payload) AS payload,
       payload IS NULL AS payload_is_sql_null,
       json_is_null(payload) AS payload_is_json_null,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp;
```

```sql
+-----------------+------------------------------------------------------------+---------------------+----------------------+----------------------+
| procedure_state | payload                                                    | payload_is_sql_null | payload_is_json_null | procedure_trigger    |
+-----------------+------------------------------------------------------------+---------------------+----------------------+----------------------+
| Running         | {"create_if_not_exists":false,"engine":"mito","version":1} | 0                   | 0                    | {"type":"Submitted"} |
| Done            | null                                                       | 0                   | 1                    | {"type":"Succeeded"} |
+-----------------+------------------------------------------------------------+---------------------+----------------------+----------------------+
```

常见事件族字段包括数据库/表定位和 ID、Flow/View 定位和 ID、Region/节点字段、
repartition 源/目标字段、`parent_procedure_id`、`gc_report` 和 WAL offset。稀疏值缺失
本身不表示错误；具体约定请参阅对应事件族页面。
