---
keywords: [GreptimeDB 事件, 维护事件, GC 事件, Remote WAL 裁剪, 表元数据修复事件]
description: 查看 GreptimeDB 记录的 GC、Remote WAL 裁剪和表元数据修复事件。
---

# 维护事件

在分布式部署中，Metasrv 会记录 GC 和 Remote WAL 裁剪事件。Standalone 和 Metasrv 都会记录表元数据修复事件。

## GC 事件

带有非 `NULL` `gc_report` 的记录显示一个 Region 的 GC 结果：

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

`deleted_files` 列出已删除的 SST/Parquet 文件 ID；`deleted_indexes` 列出已删除索引文件的 ID 及其 `index_version`；`need_retry` 为 `true` 时，该 Region 需要在下一轮 GC 中重试。

例如：

```json
{
  "deleted_files": ["580653aa-252b-415b-aaf9-ce65e9d78249"],
  "deleted_indexes": [
    {"file_id":"580653aa-252b-415b-aaf9-ce65e9d78249","index_version":0}
  ],
  "need_retry": false
}
```

定时 GC 不记录 `Submitted` 行；手动执行时，`Submitted` 行记录配置。没有 Region 需要清理或重试时，不会记录 `Done` 行。报告行的 `payload` 为 JSON `null`。

## Remote WAL 裁剪

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

`prunable_entry_id` 是 `topic_name` 的裁剪边界。它取使用该 topic 的各个 Region 报告值中的最小值，因此这些 Region 都不再使用该值之前的条目。非 `Succeeded` 行中的值只是本次尝试的边界。

`latest_offset` 不为 `NULL` 时，表示本次尝试读取到的 Kafka latest offset。它是排他的上界，即最后一条记录之后的 offset，而不是最后一条记录的 offset。

记录器不记录 `Submitted` 和 `Recovered` 行。成功执行时记录 `Done`；`Retrying` 不是终态，也可能记录 `Failed` 或 `Poisoned`。

## 表元数据修复

[表元数据修复](/user-guide/deployments-administration/maintenance/table-reconciliation.md)按修复范围记录不同的事件类型：

| 事件类型 | 记录对象 | 有值的定位列 |
| --- | --- | --- |
| `reconcile_catalog` | `ADMIN reconcile_catalog()` | `catalog_name` |
| `reconcile_database` | 一个数据库 | `catalog_name`、`schema_name` |
| `reconcile_table` | 一张物理表 | `catalog_name`、`schema_name`、`table_name`、`table_id` |
| `reconcile_logical_tables` | 一张物理表下的逻辑表，每张逻辑表一行 | `catalog_name`、`schema_name`、`table_name`、`table_id`、`physical_table_id` |

修复 catalog 时会为每个数据库启动子 Procedure，数据库再为其中的表启动子 Procedure。每个子 Procedure 各自记录事件。

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

`Submitted` 行记录请求，终态行记录结果，其他行的 `payload` 为 JSON `null`。两种 payload 都包含 `version`。

| 事件类型 | `Submitted` payload | 终态 payload |
| --- | --- | --- |
| `reconcile_catalog` | `resolve_strategy`、`fail_fast`、`parallelism` | `complete`、`processed_database_count`、`succeeded_database_count`、`failed_database_count` |
| `reconcile_database` | `resolve_strategy`、`fail_fast`、`parallelism`、`is_subprocedure` | `complete`、`processed_table_count`、`succeeded_table_count`、`failed_table_count`、`succeeded_subprocedure_count`、`failed_subprocedure_count` |
| `reconcile_table` | `resolve_strategy`、`is_subprocedure` | `complete`、`metadata_state`、`resolution_strategy_applied`、`resolved_column_count`、`scanned_region_count`、`updated_region_count`、`table_info_updated`、`last_completed_phase` |
| `reconcile_logical_tables` | `logical_table_count`、`is_subprocedure` | `complete`、`processed_table_count`、`metadata_consistent_table_count`、`metadata_inconsistent_table_count`、`create_table_count`、`update_table_info_count` |

- `resolve_strategy` 取值为 `use_latest`、`use_metasrv` 或 `abort_on_conflict`。
- 由上层修复任务启动的 Procedure，`is_subprocedure` 为 `true`。
- 只有 Procedure 成功时 `complete` 才为 `true`。
- `metadata_state` 取值为 `consistent` 或 `inconsistent`。
- `last_completed_phase` 取值为 `start`、`resolve_column_metadata`、`reconcile_regions` 或 `update_table_info`，可用来判断失败的表修复执行到了哪一步。
- `reconcile_logical_tables` 的 `processed_table_count` 是请求中逻辑表的数量，包含未完成修复的表；`create_table_count` 是判定需要创建的表的数量。

这些计数只是尽力而为的统计：它们保存在内存中，Procedure 在重启后恢复时会重置。判断任务是否成功请以 `procedure_state` 为准。
