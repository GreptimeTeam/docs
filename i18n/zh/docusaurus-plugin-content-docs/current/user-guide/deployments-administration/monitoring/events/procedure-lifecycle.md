---
keywords: [GreptimeDB 事件, Procedure 事件]
description: 查看 GreptimeDB 中记录的 Procedure 事件。
---

# Procedure 事件

Procedure 事件共享 `procedure_id`。有关事件表及其公共列的概览，请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 获取 Procedure ID

对于创建表的 Procedure，可以根据 catalog、数据库、表和 `Submitted` 触发器定位提交行：

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

示例结果：

```sql
+--------------------------------------+
| procedure_id                         |
+--------------------------------------+
| a5788f51-5726-4db7-a85e-e9afc36da557 |
+--------------------------------------+
```

在后续查询中使用返回的 ID 查看该 Procedure 的事件记录。定位条件可以避免
选中名称相似但属于其他对象的 Procedure。

## 查询 Procedure 事件

需要探索所有可用列时，使用完整记录查询：

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp ASC;
```

日常排查时，使用只选择所需列的投影：

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp;
```

以下是一次 MySQL 操作的示例输出：

```sql
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | trigger_type | procedure_error | payload                                                    |
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table | Running         | Submitted    |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table | Done            | Succeeded    |                 | null                                                       |
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
```

`Submitted` 通常表示 `Running`；成功终态是 `Done` 和 `Succeeded`。Runner 会将
`Done` 映射为 `Succeeded`，并再次调用存活 Procedure 的 `event()` hook。因此终态事件
是重新生成的，不是提交事件的副本；记录仍然是异步、尽力而为的。

本例 `create_table` 的终态 `payload` 为 JSON `null`；DDL/repartition Procedure 完成后产生的事件也可能
有这种情况，但并非所有事件类型都如此。

## Procedure 事件触发信息

运行时只记录适用的触发信息，因此查询结果不一定包含每一种 `type`，顺序也不固定：

| `type` | 含义和字段 |
| --- | --- |
| `Recovered` | 根 Procedure 从持久化状态恢复。 |
| `ChildSubmitted` | 尝试提交子 Procedure。触发器包含子 Procedure 的 `procedure_id` 和提交 `outcome`（`Accepted`、`AlreadyAccepted`、`ManagerStopped` 或 `SpawnFailed`）。 |
| `Retrying` | 正在重试 Procedure 的执行或回滚。触发器包含重试 `phase`（`Execute` 或 `Rollback`）和 `attempt`。 |
| `RollingBack` | 开始回滚 Procedure。 |
| `Failed` | Procedure 到达失败终态。请检查 `procedure_error` 中的失败详情。 |
| `Poisoned` | Procedure 无法继续。请检查 `procedure_error` 中的失败详情。 |

## 不同事件类型的完成记录字段

`procedure_id`、`procedure_state`、`procedure_trigger` 和 `procedure_error` 是公共封装
字段。完成记录中的其他字段取决于事件类型，可能由 hook 重新计算或省略。

| 事件类型 | 完成记录中的常见字段 |
| --- | --- |
| DDL | 对象定位列；Done 输出携带 ID 时才会新增 ID。 |
| `repartition` | 父 Procedure 的表定位和关联信息；payload 可能是 JSON `null`。 |
| `repartition_group` | 父/Group ID；每个目标的 Region 字段可能是 SQL `NULL`。 |
| `region_migration` | Region、节点和超时字段。 |
| `batch_gc` | 受影响的 Region 维度和 `gc_report`；`payload` 为 JSON `null`。空报告不会产生 `Done` 事件。 |
| `wal_prune` | Topic、清理/最新 offset，以及清理 payload。 |

只读查看失败事件：

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error
FROM greptime_private.events
WHERE procedure_state IN ('Failed', 'Poisoned')
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

查看最近事件的查询方式，请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。
