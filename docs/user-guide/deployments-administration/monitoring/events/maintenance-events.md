---
keywords: [GreptimeDB events, maintenance events, batch GC, WAL pruning]
description: Inspect maintenance events recorded by GreptimeDB.
---

# Maintenance events

In distributed deployments, Metasrv records maintenance events when GreptimeDB
reclaims obsolete data or prunes WAL entries.

## Batch GC

```sql
SELECT timestamp, type, region_id, region_number,
       json_path_match(gc_report, '$.need_retry == false') AS completed_without_retry,
       procedure_state
FROM greptime_private.events
WHERE type = 'batch_gc'
  AND timestamp >= now() - INTERVAL '1' hour
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

The recorder omits scheduled `Submitted` rows. A manual `Submitted` row records
the configuration. If no Region needs cleanup or retry, it does not record a
`Done` row. A `Done` row includes the affected Region dimensions and
`gc_report`; its `payload` is JSON `null`.

## WAL pruning

```sql
SELECT timestamp, type, topic_name, prunable_entry_id, latest_offset,
       procedure_state, json_to_string(procedure_trigger) AS procedure_trigger,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type = 'wal_prune'
  AND timestamp >= now() - INTERVAL '1' hour
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

The recorder omits `Submitted` and `Recovered` rows. A successful run records
`Done`; `Retrying` is not terminal, and it may also record `Failed` and
`Poisoned` rows. WAL pruning events retain the topic, prunable entry, latest
offset, and payload.
