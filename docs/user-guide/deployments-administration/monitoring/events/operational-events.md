---
keywords: [GreptimeDB events, operational events]
description: Inspect operational events recorded by GreptimeDB.
---

# Operational events

All five families below are emitted by Metasrv in distributed deployments:
`repartition`, `repartition_group`, `region_migration`, `batch_gc`, and
`wal_prune`. The queries and outputs below are read-only. Do not trigger
cluster-wide Region, GC, or WAL work merely to inspect these events.

## Repartition

The parent procedure submits a `repartition_group` child procedure. Query the
parent lifecycle as follows:

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_get_string(procedure_trigger, 'procedure_id') AS child_procedure_id,
       table_name, table_id
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND type = 'repartition'
ORDER BY timestamp;
```

```sql
+-------------------------------+-------------+--------------------------------------+-----------------+----------------+--------------------------------------+-----------------+----------+
| timestamp                     | type        | procedure_id                         | procedure_state | trigger_type   | child_procedure_id                  | table_name      | table_id |
+-------------------------------+-------------+--------------------------------------+-----------------+----------------+--------------------------------------+-----------------+----------+
| 2026-08-10 11:48:29.492950260 | repartition | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | Running         | Submitted      | NULL                                | ops_repartition |     1453 |
| 2026-08-10 11:48:29.598868367 | repartition | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | Running         | ChildSubmitted | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe | ops_repartition |     1453 |
| 2026-08-10 11:48:29.917708631 | repartition | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | Done            | Succeeded      | NULL                                | ops_repartition |     1453 |
+-------------------------------+-------------+--------------------------------------+-----------------+----------------+--------------------------------------+-----------------+----------+
```

The `Submitted` payload contains the partition intent and may be queried
separately. Non-`Submitted` lifecycle rows use JSON `null` for the payload.

## Repartition group

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       parent_procedure_id, repartition_group_id,
       source_region_id, target_region_id, target_partition_expr
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND type = 'repartition_group'
ORDER BY timestamp, target_region_id;
```

```sql
+-------------------------------+-------------------+--------------------------------------+-----------------+--------------+--------------------------------------+--------------------------------------+------------------+------------------+-----------------------+
| timestamp                     | type              | procedure_id                         | procedure_state | trigger_type | parent_procedure_id                  | repartition_group_id                 | source_region_id | target_region_id | target_partition_expr |
+-------------------------------+-------------------+--------------------------------------+-----------------+--------------+--------------------------------------+--------------------------------------+------------------+------------------+-----------------------+
| 2026-08-10 11:48:29.598852207 | repartition_group | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe | Running         | Submitted    | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | d8fdedbf-7e5c-496e-9620-afba27081cfa |    6240587481088 |    6240587481088 | host < 10            |
| 2026-08-10 11:48:29.598852207 | repartition_group | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe | Running         | Submitted    | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | d8fdedbf-7e5c-496e-9620-afba27081cfa |    6240587481088 |    6240587481089 | host >= 10           |
| 2026-08-10 11:48:29.892868600 | repartition_group | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe | Done            | Succeeded    | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | d8fdedbf-7e5c-496e-9620-afba27081cfa |             NULL |             NULL | NULL                 |
+-------------------------------+-------------------+--------------------------------------+-----------------+--------------+--------------------------------------+--------------------------------------+------------------+------------------+-----------------------+
```

The `Done` row retains the procedure, parent, and group IDs. Its source and
target fields are SQL `NULL` because the per-target topology is omitted.

## Region migration

```sql
SELECT timestamp, type, region_id, region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id,
       procedure_state
FROM greptime_private.events
WHERE type = 'region_migration'
ORDER BY timestamp DESC
LIMIT 1;
```

```sql
+-------------------------------+------------------+---------------+---------------------------------+------------------------------+------------------------------+-----------------+
| timestamp                     | type             | region_id     | region_migration_trigger_reason | region_migration_src_node_id | region_migration_dst_node_id | procedure_state |
+-------------------------------+------------------+---------------+---------------------------------+------------------------------+------------------------------+-----------------+
| 2026-08-10 02:52:50.078350103 | region_migration | 5162550689808 | AutoRebalance                   |                            1 |                            2 | Done            |
+-------------------------------+------------------+---------------+---------------------------------+------------------------------+------------------------------+-----------------+
```

The public example omits peer addresses. Non-`Submitted` rows retain the Region,
node, and timeout payload information.

## Batch GC

```sql
SELECT timestamp, type, region_id, region_number,
       json_path_match(gc_report, '$.need_retry == false') AS completed_without_retry,
       procedure_state
FROM greptime_private.events
WHERE type = 'batch_gc'
ORDER BY timestamp DESC
LIMIT 3;
```

```sql
+-------------------------------+----------+---------------+---------------+-------------------------+-----------------+
| timestamp                     | type     | region_id     | region_number | completed_without_retry | procedure_state |
+-------------------------------+----------+---------------+---------------+-------------------------+-----------------+
| 2026-08-10 10:03:28.491703601 | batch_gc | 5162550689807 |            15 |                       1 | Done            |
| 2026-08-10 09:58:28.932408689 | batch_gc | 5162550689809 |            17 |                       1 | Done            |
| 2026-08-10 09:58:28.932408689 | batch_gc | 5162550689810 |            18 |                       1 | Done            |
+-------------------------------+----------+---------------+---------------+-------------------------+-----------------+
```

Scheduled `Submitted` rows are omitted. A manual `Submitted` row records the
configuration. An empty `GcReport` produces no `Done` event. A nonempty `Done`
event has the affected Region dimensions and `gc_report`; its `payload` is JSON
`null`.

## WAL prune

```sql
SELECT timestamp, type, topic_name, prunable_entry_id, latest_offset,
       procedure_state, json_to_string(procedure_trigger) AS procedure_trigger,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type = 'wal_prune'
ORDER BY timestamp DESC
LIMIT 3;
```

```sql
+-------------------------------+-----------+-------------------------+-------------------+---------------+-----------------+----------------------+--------------------------------------+
| timestamp                     | type      | topic_name              | prunable_entry_id | latest_offset | procedure_state | procedure_trigger    | payload                              |
+-------------------------------+-----------+-------------------------+-------------------+---------------+-----------------+----------------------+--------------------------------------+
| 2026-08-10 11:23:28.495676149 | wal_prune | greptimedb_wal_topic_20 |            248376 |        248381 | Done            | {"type":"Succeeded"} | {"logical_delete":false,"version":1} |
| 2026-08-10 10:53:28.478381545 | wal_prune | greptimedb_wal_topic_20 |            248375 |        248376 | Done            | {"type":"Succeeded"} | {"logical_delete":false,"version":1} |
| 2026-08-10 10:23:28.486761751 | wal_prune | greptimedb_wal_topic_20 |            248371 |        248375 | Done            | {"type":"Succeeded"} | {"logical_delete":false,"version":1} |
+-------------------------------+-----------+-------------------------+-------------------+---------------+-----------------+----------------------+--------------------------------------+
```

`Submitted` and `Recovered` events are intentionally omitted. A valid successful
outcome records `Done`; `Retrying` is a non-terminal event, not a terminal state,
while `Failed` and `Poisoned` events may also be recorded. WAL prune events retain
the topic, prunable entry, latest offset, and payload.
