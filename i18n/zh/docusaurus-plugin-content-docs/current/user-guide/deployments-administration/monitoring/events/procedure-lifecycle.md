---
keywords: [GreptimeDB 事件, Procedure 生命周期]
description: 查看 GreptimeDB 中的 Procedure 生命周期事件。
---

# Procedure 生命周期

Procedure 事件通过 `procedure_id` 关联。使用该 ID 可以跟踪单个 Procedure，
而不必依赖对象名称或事件发生时间。事件列和 JSON 字段说明请参阅
[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 获取 procedure ID

先查询目标操作的 `Submitted` 行。例如：

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_life_20260810'
  AND table_name = 'lifecycle_probe'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

```text
+--------------------------------------+
| procedure_id                         |
+--------------------------------------+
| a5788f51-5726-4db7-a85e-e9afc36da557 |
+--------------------------------------+
```

请按实际排查对象替换数据库名、对象名和事件类型。查询返回的 UUID 就是后续
查询使用的 `procedure_id`。

## 查询单个 Procedure

需要查看所有稀疏定位列或运维列时，使用以下可复用的完整查询：

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp ASC;
```

日常监控更适合使用聚焦投影：

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp;
```

实际捕获的输出如下：

```text
+-------------------------------+--------------+----------------------+----------------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state      | procedure_trigger    | procedure_error | payload                                                    |
+-------------------------------+--------------+----------------------+----------------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table  | Running              | {"type":"Submitted"} |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table  | Done                 | {"type":"Succeeded"} |                 | null                                                       |
+-------------------------------+--------------+----------------------+----------------------+-----------------+------------------------------------------------------------+
```

`Submitted` 是初始生命周期触发器，对应的 Procedure 状态为 `Running`。
成功的终止事件对应 `procedure_state = 'Done'` 和 `Succeeded` 触发器。初始行
通常包含操作 payload 和上下文；终止行的 payload 是 JSON `null`，不是 SQL
`NULL`。

## 解释其他生命周期触发器

运行时会根据实际情况记录以下触发器：

| 触发器 | 含义 |
| --- | --- |
| `Recovered` | 从持久化状态恢复了根 Procedure。 |
| `ChildSubmitted` | 尝试提交子 Procedure；JSON 中包含子 ID 和提交结果。 |
| `Retrying` | 正在重试执行或回滚；JSON 中包含阶段和尝试次数。 |
| `RollingBack` | 失败后开始回滚。 |
| `Failed` | Procedure 进入失败终止状态；检查 `procedure_error`。 |
| `Poisoned` | Procedure 因中毒而无法继续；检查 `procedure_error`。 |

这些是框架支持的生命周期情况，并不是每个 Procedure 都必须经历的固定顺序。
某个 Procedure 不一定会发出所有触发器或所有中间状态。`Retrying` 和
`RollingBack` 可能在 `procedure_error` 中携带错误信息。

## 不创建失败的情况下检查失败状态

下面的只读查询用于查找某个数据库中的失败或中毒 Procedure：

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_life_20260810'
  AND procedure_state IN ('Failed', 'Poisoned')
ORDER BY timestamp;
```

本例使用的专用运行时数据库没有失败行，因此不展示伪造的失败或中毒输出。该
查询已根据源码验证；不要从成功示例推断失败输出，也不要为了测试而人为制造
失败。

通用事件过滤和轮询方法请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。
