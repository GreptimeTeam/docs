---
keywords: [GreptimeDB 事件, 事件数据模型]
description: 了解 GreptimeDB events 表的数据模型。
---

# 事件数据模型

`greptime_private.events` 有以下公共列。

| 列              | 含义                                                  |
| --------------- | ----------------------------------------------------- |
| `type`          | 事件类型，例如 `create_table` 或 `region_migration`。 |
| `timestamp`     | 记录该行的时间。                                      |
| `payload`       | 与事件类型相关的 JSON 数据。                          |
| `event_context` | 有上下文时，用于描述事件触发原因的 JSON。             |

## Procedure 事件列

Procedure 事件还有以下列：

| 列                  | 含义                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `procedure_id`      | Procedure 的唯一 ID。                                                                                                                                            |
| `procedure_state`   | 记录事件时的 Procedure 状态。取值为 `Running`、`Done`、`Retrying`、`PrepareRollback`、`RollingBack`、`Failed` 和 `Poisoned`。                                    |
| `procedure_trigger` | Procedure 事件触发信息，采用 JSON 格式。`type` 可为 `Submitted`、`Recovered`、`ChildSubmitted`、`Retrying`、`RollingBack`、`Succeeded`、`Failed` 或 `Poisoned`。 |
| `procedure_error`   | Procedure 出错时的 Debug 格式错误信息；其他情况为空字符串。                                                                                                      |

`Submitted` 事件的状态通常为 `Running`。Procedure 成功完成后，完成记录的状态为
`Done`，触发类型为 `Succeeded`。完成记录根据 Procedure 完成时的状态生成，因此字段可能
与提交时的记录不同。事件会异步写入，写入失败不会影响 Procedure 的执行结果。

`event_context` 只写入 `Submitted` 记录。存在该字段时，其中稳定的 `reason` 值可以是
`manual`、`auto_create`、`auto_alter`、`auto_repartition`、`auto_rebalance`、
`region_failover`、`scheduled_gc` 或 `unknown`。例如，通过 MySQL 提交的事件可能包含
`{"protocol":"mysql","reason":"manual"}`。

除 `Submitted` 和 `Succeeded` 外，Procedure 还可能在适用时产生以下触发类型。
并非每个 Procedure 都会产生所有触发类型，记录顺序也不保证与下表一致：

| `type`           | 含义和字段                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Recovered`      | 根 Procedure 从持久化状态恢复。                                                                                                                                     |
| `ChildSubmitted` | 尝试提交子 Procedure。`procedure_trigger` 包含子 Procedure 的 `procedure_id` 和提交 `outcome`（`Accepted`、`AlreadyAccepted`、`ManagerStopped` 或 `SpawnFailed`）。 |
| `Retrying`       | 正在重试 Procedure 的执行或回滚。`procedure_trigger` 包含重试 `phase`（`Execute` 或 `Rollback`）和 `attempt`。                                                      |
| `RollingBack`    | 开始回滚 Procedure。                                                                                                                                                |
| `Failed`         | Procedure 到达失败终态。请检查 `procedure_error` 中的失败详情。                                                                                                     |
| `Poisoned`       | Procedure 无法继续。请检查 `procedure_error` 中的失败详情。                                                                                                         |

## 查询 JSON 字段

详细信息请参阅 [JSON 函数](/reference/sql/functions/json.md)。在事件查询中，
`json_to_string` 将 JSON 值转换为可读文本，`json_get_string` 按路径提取值，
`json_path_match` 计算 JSON 谓词，`json_is_null` 检查值是否为 JSON `null`。如需检查
SQL `NULL`，应单独使用 `IS NULL`。

例如，以下查询从包含 `event_context` 的 `create_table` 行中提取相关字段：

```sql
SELECT procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_path_match(procedure_trigger, '$.type == "Submitted"') AS is_submitted,
       json_get_string(event_context, 'reason') AS reason
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
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

## Procedure 事件的专用列

以下列只会在对应事件类型中填充；不适用时为 SQL `NULL`。

- **数据库、表、Flow 和视图事件：** `catalog_name`、`schema_name`、`table_name`、
  `table_id`、`flow_name`、`flow_id`、`view_name` 和 `view_id` 用于标识对象。
  `physical_table_id` 仅适用于 `create_logical_tables` 和 `alter_logical_tables`。
  详见 [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。
- **Region 迁移：** `region_id`、`region_number` 标识 Region；
  `region_migration_trigger_reason`、`region_migration_src_node_id`、
  `region_migration_src_peer_addr`、`region_migration_dst_node_id` 和
  `region_migration_dst_peer_addr` 记录迁移原因、源端和目标端。
- **Repartition：** `catalog_name`、`schema_name`、`table_name` 和 `table_id` 标识受影响的表。
  `parent_procedure_id` 关联父 Procedure，`repartition_group_id` 标识分组操作。
  `source_region_id`、`source_region_number`、`source_partition_expr`、
  `target_region_id`、`target_region_number` 和 `target_partition_expr` 描述源和目标
  Region 及其分区表达式。
- **批量 GC：** `region_id`、`region_number` 和 `gc_report` 记录处理的 Region 及 GC 结果。
- **WAL 清理：** `topic_name`、`prunable_entry_id` 和 `latest_offset` 分别表示 topic、
  请求的清理边界和排他的最新 offset。
