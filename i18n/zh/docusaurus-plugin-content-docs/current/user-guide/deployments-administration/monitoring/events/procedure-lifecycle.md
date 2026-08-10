---
keywords: [GreptimeDB 事件, Procedure 生命周期]
description: 查看 GreptimeDB 中的 Procedure 生命周期事件。
---

# Procedure 生命周期

Procedure 事件共享 `procedure_id`。有关事件表及其公共列的概览，请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 获取 Procedure ID

对于创建表的 Procedure，可以根据 catalog、数据库、表和 `Submitted` 触发器定位提交行：

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
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

在后续查询中使用返回的 ID 查看该 Procedure 的生命周期记录。定位条件可以避免
选中名称相似但属于其他对象的 Procedure。

## 查询 Procedure 生命周期

需要探索所有可用列时，使用完整记录查询：

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp ASC;
```

日常排查时，使用只选择所需列的投影：

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp;
```

以下是一次 MySQL 操作的示例输出：

```sql
+-------------------------------+--------------+-----------------+----------------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | procedure_trigger    | procedure_error | payload                                                    |
+-------------------------------+--------------+-----------------+----------------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table | Running         | {"type":"Submitted"} |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table | Done            | {"type":"Succeeded"} |                 | null                                                       |
+-------------------------------+--------------+-----------------+----------------------+-----------------+------------------------------------------------------------+
```

`Submitted` 通常表示 `Running`；成功终态是 `Done` 和 `Succeeded`。Runner 会将
`Done` 映射为 `Succeeded`，并再次调用存活 Procedure 的 `event()` hook。因此终态事件
是重新生成的，不是提交事件的副本；记录仍然是异步、尽力而为的。

本例 `create_table` 的终态 `payload` 为 JSON `null`；DDL/repartition 生命周期事件也可能
有这种情况，但这不是所有事件族的统一规则。

## 生命周期触发器

运行时只会记录适用的触发器，因此不一定会出现每一种触发器，也不保证固定顺序：

| 触发器 | 含义和有用字段 |
| --- | --- |
| `Recovered` | 根 Procedure 从持久化状态恢复。 |
| `ChildSubmitted` | 尝试提交子 Procedure。触发器包含子 Procedure 的 `procedure_id` 和提交 `outcome`（`Accepted`、`AlreadyAccepted`、`ManagerStopped` 或 `SpawnFailed`）。 |
| `Retrying` | 正在重试 Procedure 的执行或回滚。触发器包含重试 `phase`（`Execute` 或 `Rollback`）和 `attempt`。 |
| `RollingBack` | 开始回滚 Procedure。 |
| `Failed` | Procedure 到达失败终态。请检查 `procedure_error` 中的失败详情。 |
| `Poisoned` | Procedure 无法继续。请检查 `procedure_error` 中的失败详情。 |

## 事件族的终态字段

`procedure_id`、`procedure_state`、`procedure_trigger` 和 `procedure_error` 是公共封装
字段。终态事件族字段由类型决定，可能被 hook 重新计算或省略。

| 事件族 | 常见终态字段 |
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
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error
FROM greptime_private.events
WHERE procedure_state IN ('Failed', 'Poisoned')
ORDER BY timestamp DESC
LIMIT 20;
```

查看最近事件的查询方式，请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。
