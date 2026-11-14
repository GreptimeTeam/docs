---
keywords: [GreptimeDB events, maintenance events, GC events, Remote WAL pruning, table reconciliation events]
description: Inspect GC, Remote WAL pruning, and table reconciliation events recorded by GreptimeDB.
---

# Maintenance events

Metasrv records GC and Remote WAL pruning events in distributed deployments. Standalone and Metasrv both record table reconciliation events.

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

## Table reconciliation

[Table reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md) records one event type for each scope:

| Event type | Recorded for | Populated locator columns |
| --- | --- | --- |
| `reconcile_catalog` | `ADMIN reconcile_catalog()` | `catalog_name` |
| `reconcile_database` | A database | `catalog_name`, `schema_name` |
| `reconcile_table` | A physical table | `catalog_name`, `schema_name`, `table_name`, `table_id` |
| `reconcile_logical_tables` | The logical tables of one physical table, one row per logical table | `catalog_name`, `schema_name`, `table_name`, `table_id`, `physical_table_id` |

Reconciling a catalog starts a child procedure for each database, which in turn starts child procedures for its tables. Each child procedure records its own events.

```sql
SELECT timestamp, type, schema_name, table_name, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type IN ('reconcile_catalog', 'reconcile_database',
               'reconcile_table', 'reconcile_logical_tables')
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp;
```

The `Submitted` row records the request, and the terminal row records the result. `payload` is JSON `null` on other rows. Both payloads contain `version`.

| Event type | `Submitted` payload | Terminal payload |
| --- | --- | --- |
| `reconcile_catalog` | `resolve_strategy`, `fail_fast`, `parallelism` | `complete`, `processed_database_count`, `succeeded_database_count`, `failed_database_count` |
| `reconcile_database` | `resolve_strategy`, `fail_fast`, `parallelism`, `is_subprocedure` | `complete`, `processed_table_count`, `succeeded_table_count`, `failed_table_count`, `succeeded_subprocedure_count`, `failed_subprocedure_count` |
| `reconcile_table` | `resolve_strategy`, `is_subprocedure` | `complete`, `metadata_state`, `resolution_strategy_applied`, `resolved_column_count`, `scanned_region_count`, `updated_region_count`, `table_info_updated`, `last_completed_phase` |
| `reconcile_logical_tables` | `logical_table_count`, `is_subprocedure` | `complete`, `processed_table_count`, `metadata_consistent_table_count`, `metadata_inconsistent_table_count`, `create_table_count`, `update_table_info_count` |

- `resolve_strategy` is `use_latest`, `use_metasrv`, or `abort_on_conflict`.
- `is_subprocedure` is `true` when a parent reconciliation started the procedure.
- `complete` is `true` only when the procedure succeeded.
- `metadata_state` is `consistent` or `inconsistent`.
- `last_completed_phase` is `start`, `resolve_column_metadata`, `reconcile_regions`, or `update_table_info`. Use it to see how far a failed table reconciliation went.
- For `reconcile_logical_tables`, `processed_table_count` is the number of logical tables in the request, including tables whose reconciliation did not finish. `create_table_count` is the number of tables identified for creation.

The counts are best-effort. They are collected in memory and reset when a procedure recovers after a restart, so use `procedure_state` to decide whether a task succeeded.
