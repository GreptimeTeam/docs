---
keywords: [GreptimeDB events, maintenance events, GC events, Remote WAL pruning]
description: Inspect GC and Remote WAL pruning events recorded by GreptimeDB.
---

# Maintenance events

Metasrv records GC and Remote WAL pruning events in distributed deployments.

## GC events

Each row with a non-`NULL` `gc_report` records the files processed for one Region:

```sql
SELECT timestamp, procedure_id, procedure_state,
       region_id, table_id, region_number,
       json_to_string(gc_report) AS gc_report
FROM greptime_private.events
WHERE type = 'batch_gc'
  AND gc_report IS NOT NULL
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 3;
```

`deleted_files` lists deleted SST/Parquet file IDs. `deleted_indexes` lists deleted index file IDs and their `index_version`. `need_retry` is `true` when the Region needs another GC run.

For example:

```json
{
  "deleted_files": ["580653aa-252b-415b-aaf9-ce65e9d78249"],
  "deleted_indexes": [
    {"file_id":"580653aa-252b-415b-aaf9-ce65e9d78249","index_version":0}
  ],
  "need_retry": false
}
```

Scheduled GC does not emit a `Submitted` row. A manual `Submitted` row contains the configuration. If no Region needs cleanup or retry, no `Done` row is written. `payload` is JSON `null` on a report row.

## Remote WAL pruning

```sql
SELECT timestamp, type, topic_name, prunable_entry_id, latest_offset,
       procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type = 'wal_prune'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 3;
```

```sql
+-------------------------------+-----------+-------------------------+-------------------+---------------+-----------------+--------------+--------------------------------------+
| timestamp                     | type      | topic_name              | prunable_entry_id | latest_offset | procedure_state | trigger_type | payload                              |
+-------------------------------+-----------+-------------------------+-------------------+---------------+-----------------+--------------+--------------------------------------+
| 2026-08-10 11:23:28.495676149 | wal_prune | greptimedb_wal_topic_20 |            248376 |        248381 | Done            | Succeeded    | {"logical_delete":false,"version":1} |
| 2026-08-10 10:53:28.478381545 | wal_prune | greptimedb_wal_topic_20 |            248375 |        248376 | Done            | Succeeded    | {"logical_delete":false,"version":1} |
| 2026-08-10 10:23:28.486761751 | wal_prune | greptimedb_wal_topic_20 |            248371 |        248375 | Done            | Succeeded    | {"logical_delete":false,"version":1} |
+-------------------------------+-----------+-------------------------+-------------------+---------------+-----------------+--------------+--------------------------------------+
```

`prunable_entry_id` is the pruning boundary for `topic_name`. It is the smallest boundary reported by Regions that use the topic, so none of those Regions needs entries before it. On a non-`Succeeded` row, it is only the attempted boundary.

When present, `latest_offset` is the Kafka latest offset observed during this attempt. It is an exclusive upper bound: the offset after the last record, not the offset of the last record.

The recorder omits `Submitted` and `Recovered` rows. A successful run writes `Done`; `Retrying` is not terminal, and a run can also write `Failed` or `Poisoned`.
