---
keywords: [GreptimeDB 事件, 维护事件, GC 事件, Remote WAL 裁剪]
description: 查看 GreptimeDB 记录的 GC 和 Remote WAL 裁剪事件。
---

# 维护事件

在分布式部署中，Metasrv 会记录 GC 和 Remote WAL 裁剪事件。

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
