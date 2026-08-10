---
keywords: [GreptimeDB events, operational events]
description: Inspect operational events recorded by GreptimeDB.
---

# Operational events

Operational events record background work that changes or maintains the
cluster. Query them from `greptime_private.events`; see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md),
[Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md),
and [Procedure lifecycle](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
for the common columns and lifecycle states.

## Event types

| Type | What to inspect |
| --- | --- |
| `region_migration` | `region_migration_trigger_reason`, plus the source and destination node IDs and peer addresses. |
| `repartition` | The parent procedure and its submitted target partition expressions in `payload`. |
| `repartition_group` | `parent_procedure_id`, `repartition_group_id`, source region fields, and target region/partition fields. |
| `batch_gc` | `region_id`, `region_number`, and the retry result in `gc_report`. |
| `wal_prune` | `topic_name`, `prunable_entry_id`, `latest_offset`, and the trigger/payload that describe the prune. |

## Repartition: parent and child events

A `repartition` event is the parent procedure. Its `ChildSubmitted` trigger
contains the child procedure ID; that ID is the `procedure_id` of the related
`repartition_group` event. The group keeps the parent and group IDs so the
operation can be correlated across rows.

One `repartition_group` `Submitted` event can expand into one row for each
target partition. The terminal row records the procedure result and linkage,
but does not retain the per-target fields.

This parent query scopes the result to a database and table without relying on
volatile procedure or region IDs:

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

For `repartition`, use `payload` to read the source type, target partition
columns, target expressions, timeout, and payload version. Query the child
rows separately when you need their source and target locators:

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

Captured output:

| procedure_state | source_region_number | source_partition_expr | target_region_number | target_partition_expr | procedure_trigger |
| --- | ---: | --- | ---: | --- | --- |
| Running | 0 | NULL | 0 | `host < 10` | `{"type":"Submitted"}` |
| Running | 0 | NULL | 1 | `host >= 10` | `{"type":"Submitted"}` |

One `Submitted` event therefore expands into one row per target partition.
The terminal row is not included by this predicate; it keeps the linkage but
does not retain the per-target fields.

## Compact operational queries

The following predicates select the fields needed for operational inspection:

```sql
-- Region migration
SELECT timestamp, region_id, region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_src_peer_addr,
       region_migration_dst_node_id, region_migration_dst_peer_addr,
       procedure_state
FROM greptime_private.events
WHERE type = 'region_migration'
ORDER BY timestamp DESC
LIMIT 1;

-- Batch GC: report only whether retry is needed
SELECT timestamp, region_id, region_number,
       json_path_match(gc_report, '$.need_retry == false') AS completed_without_retry,
       procedure_state
FROM greptime_private.events
WHERE type = 'batch_gc'
ORDER BY timestamp DESC
LIMIT 3;

-- WAL prune boundaries
SELECT timestamp, topic_name, prunable_entry_id, latest_offset,
       procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type = 'wal_prune'
ORDER BY timestamp DESC
LIMIT 3;
```

The following are captured results, not reusable predicates.

**Region migration**

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

The migration, batch GC, and WAL examples above are read-only views of
existing global rows. This guide does not instruct you to trigger these
operations merely to create events.
