---
keywords: [GreptimeDB 事件, 事件数据模型]
description: 了解 GreptimeDB events 表的数据模型。
---

# 事件数据模型

`greptime_private.events` 中的每一行都使用相同的基础封装。具体事件族
只写入自己需要的列，因此大多数事件族专用列都是稀疏列（对无关事件为
`NULL`）。

如何定位事件行，请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。
各事件族的含义请参阅 [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
和[运维事件](/user-guide/deployments-administration/monitoring/events/operational-events.md)。

## 通用列

每一行都包含以下基础列：

| 列 | 含义 |
| --- | --- |
| `type` | 小写下划线格式的事件类型，例如 `create_table` 或 `region_migration`。 |
| `payload` | 事件的 JSON 载荷。`Submitted` 行通常包含操作意图。 |
| `timestamp` | 记录事件行的时间。 |

Procedure 封装用于标识操作及其生命周期：

| 列 | 含义 |
| --- | --- |
| `procedure_id` | 同一个 Procedure 产生的事件行共享的标识符。 |
| `procedure_state` | Procedure 状态，例如 `Running` 或 `Done`。 |
| `procedure_trigger` | Procedure 的 JSON 触发器，包括 `Submitted`、`Recovered`、`ChildSubmitted`、`Retrying`、`RollingBack`、`Succeeded`、`Failed` 和 `Poisoned`。 |
| `procedure_error` | Procedure 失败时记录的错误文本（如果有）。 |

在已捕获的成功运行中，`procedure_state = 'Done'` 对应 `Succeeded` 触发器。
`Failed` 和 `Poisoned` 是终态失败触发器；应结合触发器和错误信息判断，
不要根据某个稀疏事件族列单独推断失败。参阅 [Procedure 生命周期](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)。

## 上下文和载荷语义

`event_context` 是可选的 JSON，用于说明事件的触发原因。稳定的 `reason`
值包括 `manual`、`auto_create`、`auto_alter`、`auto_repartition`、
`auto_rebalance`、`region_failover`、`scheduled_gc` 和 `unknown`。例如，
手动通过 MySQL 执行的 DDL 事件可以包含
`{"protocol":"mysql","reason":"manual"}`。

不要混淆 SQL `NULL` 和 JSON `null`：

- 提交行可以携带对象载荷。
- 后续生命周期行可以携带 JSON `null`。此时
  `payload IS NULL = 0`，而 `json_is_null(payload) = 1`。
- 相比之下，终态行中的 `event_context` 可以是 SQL `NULL`。

下面的投影同时展示这两种情况，并且不依赖动态生成的 ID：

```sql
SELECT procedure_state,
       json_to_string(payload) AS payload,
       payload IS NULL AS payload_is_sql_null,
       json_is_null(payload) AS payload_is_json_null,
       json_to_string(event_context) AS event_context,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_model_20260810'
  AND table_name = 'model_probe'
ORDER BY timestamp;
```

GreptimeDB 1.3.0 的精简输出：

```text
| procedure_state | payload                                                    | payload_is_sql_null | payload_is_json_null | event_context                          | procedure_trigger    |
| Running         | {"create_if_not_exists":false,"engine":"mito","version":1} | 0                   | 0                    | {"protocol":"mysql","reason":"manual"} | {"type":"Submitted"} |
| Done            | null                                                       | 0                   | 1                    | NULL                                    | {"type":"Succeeded"} |
```

## 稀疏的事件族专用列

先使用通用定位列，再按事件族增加专用投影：

- 数据库和表事件使用 `catalog_name`、`schema_name`、`table_name`、
  `table_id`，有时还使用 `physical_table_id`。
- Flow 和 View 事件使用 `flow_name`、`flow_id`、`view_name` 和 `view_id`。
- Region 和迁移事件使用 `region_id`、`region_number`、源和目标节点或
  peer 列，以及迁移触发原因。
- Repartition 事件使用 `repartition_group_id`、源/目标 region 和编号列，
  以及源/目标分区表达式。
- WAL 和 GC 事件使用 `topic_name`、`prunable_entry_id`、`latest_offset`
  或 `gc_report`。
- 子 Procedure 可能包含 `parent_procedure_id`。

这些列不会在每个生命周期行中统一填充。例如，已捕获的 `create_table`
提交行的 `table_id = NULL`，而终态行已有 table ID；两行的 `region_id` 都
保持 SQL `NULL`。有关各事件族的具体约定，请参阅对应页面，不要把缺少
稀疏值直接视为错误。

## 查询 JSON 列

使用 `json_to_string` 显示 JSON，使用 `json_get_string` 提取标量，使用
`json_path_match` 判断谓词，使用 `json_is_null` 检查 JSON `null`：

```sql
SELECT procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_path_match(procedure_trigger, '$.type == "Succeeded"') AS is_succeeded,
       json_get_string(event_context, 'reason') AS reason
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_model_20260810'
  AND table_name = 'model_probe'
ORDER BY timestamp;
```

```text
| procedure_state | trigger_type | is_succeeded | reason |
| Running         | Submitted    | 0            | manual |
| Done            | Succeeded    | 1            | NULL   |
```

终态行的 `event_context` 是 SQL `NULL`，所以这里的 `json_get_string` 返回
`NULL`。更多 JSON 函数说明请参阅 [JSON 函数](/reference/sql/functions/json.md)。
