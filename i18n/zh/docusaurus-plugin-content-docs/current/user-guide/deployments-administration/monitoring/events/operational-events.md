---
keywords: [GreptimeDB 事件, 运维事件]
description: 查看 GreptimeDB 记录的运维事件。
---

# 运维事件

运维事件记录集群中执行的后台变更和维护操作。可以从
`greptime_private.events` 查询这些事件。通用列和生命周期状态请参阅[查询事件](/user-guide/deployments-administration/monitoring/events/query-events.md)、
[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
和 [Procedure 生命周期](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)。

## 事件类型

| 类型 | 重点查看的字段 |
| --- | --- |
| `region_migration` | `region_migration_trigger_reason`，以及源和目标节点 ID、节点地址。 |
| `repartition` | 父 Procedure，以及 `payload` 中提交的目标分区表达式。 |
| `repartition_group` | `parent_procedure_id`、`repartition_group_id`、源 Region 字段，以及目标 Region/分区字段。 |
| `batch_gc` | `region_id`、`region_number`，以及 `gc_report` 中的重试结果。 |
| `wal_prune` | `topic_name`、`prunable_entry_id`、`latest_offset`，以及描述清理操作的触发器和 payload。 |

## Repartition：父子事件

`repartition` 事件对应父 Procedure。它的 `ChildSubmitted` 触发器包含子
Procedure ID；这个 ID 也是关联的 `repartition_group` 事件的
`procedure_id`。Group 事件保留父 ID 和 Group ID，因此可以跨行关联同一
次操作。

一次 `repartition_group` 的 `Submitted` 事件可能展开为每个目标分区一行。
终态行记录 Procedure 结果和关联 ID，但不再保留每个目标分区的字段。

下面的父 Procedure 查询按数据库和表限定结果，不依赖易变化的 Procedure ID
或 Region ID：

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       schema_name, table_name, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE schema_name = 'docs_ev2723_ops_20260810'
  AND table_name = 'ops_repartition'
  AND type = 'repartition'
ORDER BY timestamp;
```

对于 `repartition`，从 `payload` 查看源类型、目标分区列、目标表达式、
超时时间和 payload 版本。需要查看子行的源、目标定位字段时，单独查询：

```sql
SELECT timestamp, procedure_state, source_region_number,
       source_partition_expr, target_region_number, target_partition_expr,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE schema_name = 'docs_ev2723_ops_20260810'
  AND table_name = 'ops_repartition'
  AND type = 'repartition_group'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp, target_region_number;
```

捕获到的结果如下：

| procedure_state | source_region_number | source_partition_expr | target_region_number | target_partition_expr | procedure_trigger |
| --- | ---: | --- | ---: | --- | --- |
| Running | 0 | NULL | 0 | `host < 10` | `{"type":"Submitted"}` |
| Running | 0 | NULL | 1 | `host >= 10` | `{"type":"Submitted"}` |

因此，一条 `Submitted` 事件会按目标分区展开为一行。这个谓词不包含终态
行；终态行保留关联信息，但不再保留每个目标分区的字段。

## 紧凑的运维查询

下面的谓词只提取运维排查所需的字段：

```sql
-- Region 迁移
SELECT timestamp, region_id, region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_src_peer_addr,
       region_migration_dst_node_id, region_migration_dst_peer_addr,
       procedure_state
FROM greptime_private.events
WHERE type = 'region_migration'
ORDER BY timestamp DESC
LIMIT 1;

-- Batch GC：只报告是否需要重试
SELECT timestamp, region_id, region_number,
       json_path_match(gc_report, '$.need_retry == false') AS completed_without_retry,
       procedure_state
FROM greptime_private.events
WHERE type = 'batch_gc'
ORDER BY timestamp DESC
LIMIT 3;

-- WAL 清理边界
SELECT timestamp, topic_name, prunable_entry_id, latest_offset,
       procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type = 'wal_prune'
ORDER BY timestamp DESC
LIMIT 3;
```

以下是捕获到的结果，不是可复用的筛选谓词。

**Region 迁移**

| timestamp | region_id | region_migration_trigger_reason | region_migration_src_node_id | region_migration_src_peer_addr | region_migration_dst_node_id | region_migration_dst_peer_addr | procedure_state |
| --- | ---: | --- | ---: | --- | ---: | --- | --- |
| 2026-08-10 02:52:50.078350103 | 5162550689808 | AutoRebalance | 1 | 172.16.62.49:4001 | 2 | 172.16.232.158:4001 | Done |

**Batch GC**

| timestamp | region_id | region_number | completed_without_retry | procedure_state |
| --- | ---: | ---: | ---: | --- |
| 2026-08-10 10:03:28.491703601 | 5162550689807 | 15 | 1 | Done |
| 2026-08-10 09:58:28.932408689 | 5162550689809 | 17 | 1 | Done |
| 2026-08-10 09:58:28.932408689 | 5162550689810 | 18 | 1 | Done |

**WAL prune**

| timestamp | topic_name | prunable_entry_id | latest_offset | procedure_state | procedure_trigger | payload |
| --- | --- | ---: | ---: | --- | --- | --- |
| 2026-08-10 11:23:28.495676149 | greptimedb_wal_topic_20 | 248376 | 248381 | Done | `{"type":"Succeeded"}` | `{"logical_delete":false,"version":1}` |
| 2026-08-10 10:53:28.478381545 | greptimedb_wal_topic_20 | 248375 | 248376 | Done | `{"type":"Succeeded"}` | `{"logical_delete":false,"version":1}` |
| 2026-08-10 10:23:28.486761751 | greptimedb_wal_topic_20 | 248371 | 248375 | Done | `{"type":"Succeeded"}` | `{"logical_delete":false,"version":1}` |

上面的迁移、Batch GC 和 WAL 示例都是只读查询现有全局事件行的结果。本指南
不要求用户仅为了生成事件而触发这些操作。
