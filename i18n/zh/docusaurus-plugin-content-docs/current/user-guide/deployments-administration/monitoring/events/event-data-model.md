---
keywords: [GreptimeDB 事件, 事件数据模型]
description: 了解 GreptimeDB events 表的数据模型。
---

# 事件数据模型

`greptime_private.events` 有一组公共列。不同事件类型使用的专用列是稀疏列；未使用时为
SQL `NULL`。

| 列                  | 含义                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`              | 事件类型，例如 `create_table` 或 `region_migration`。                                                                                                            |
| `timestamp`         | 记录该行的时间。                                                                                                                                                 |
| `procedure_id`      | Procedure 的唯一 ID。                                                                                                                                            |
| `procedure_state`   | 记录事件时的 Procedure 状态。取值为 `Running`、`Done`、`Retrying`、`PrepareRollback`、`RollingBack`、`Failed` 和 `Poisoned`。                                    |
| `procedure_trigger` | Procedure 事件触发信息，采用 JSON 格式。`type` 可为 `Submitted`、`Recovered`、`ChildSubmitted`、`Retrying`、`RollingBack`、`Succeeded`、`Failed` 或 `Poisoned`。 |
| `procedure_error`   | Procedure 出错时的错误信息。                                                                                                                                     |
| `payload`           | 与事件类型相关的 JSON 数据。                                                                                                                                     |
| `event_context`     | 有上下文时，用于描述事件触发原因的 JSON。                                                                                                                        |

Runner 会调用正在运行的 Procedure 的 `event()` hook，生成完成后的事件。事件类型决定
这条记录使用哪些字段；这些字段不保证与提交记录相同。记录会异步写入，不保证每次都成功。

存在 `event_context` 时，其中的稳定 `reason` 值可以是
`manual`、`auto_create`、`auto_alter`、`auto_repartition`、`auto_rebalance`、
`region_failover`、`scheduled_gc` 或 `unknown`。例如，通过 MySQL 提交的事件可能包含
`{"protocol":"mysql","reason":"manual"}`。

如需查看针对性的示例，请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)、
[Procedure 事件](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)和
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
  AND timestamp >= now() - INTERVAL '1' hour
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

在 `create_table` 示例以及 DDL/repartition Procedure 完成后产生的事件中，终态 `payload` 可能是
JSON `null`，而不是 SQL `NULL`：

```sql
SELECT procedure_state, json_to_string(payload) AS payload,
       payload IS NULL AS payload_is_sql_null,
       json_is_null(payload) AS payload_is_json_null,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp;
```

```sql
+-----------------+------------------------------------------------------------+---------------------+----------------------+--------------+
| procedure_state | payload                                                    | payload_is_sql_null | payload_is_json_null | trigger_type |
+-----------------+------------------------------------------------------------+---------------------+----------------------+--------------+
| Running         | {"create_if_not_exists":false,"engine":"mito","version":1} | 0                   | 0                    | Submitted    |
| Done            | null                                                       | 0                   | 1                    | Succeeded    |
+-----------------+------------------------------------------------------------+---------------------+----------------------+--------------+
```

不同事件类型会使用数据库/表定位和 ID、Flow/View 定位和 ID、Region/节点字段、
repartition 源/目标字段、`parent_procedure_id`、`gc_report` 和 WAL offset。专用列为空
不一定表示错误；具体约定请参阅对应事件类型页面。
