---
keywords: [GreptimeDB 事件, 维护事件, 批量 GC, WAL 清理]
description: 查看 GreptimeDB 记录的维护事件。
---

# 维护事件

在带 Metasrv 的分布式部署中，GreptimeDB 回收不再使用的数据或清理 WAL 时会记录维护事件。

## 批量 GC

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

定时任务的 `Submitted` 行会被省略；手动 `Submitted` 行记录配置信息。没有 Region 需要清理或
重试时，不会记录 `Done` 行。`Done` 行包含受影响的 Region 维度和 `gc_report`，其 `payload`
为 JSON `null`。

## WAL 清理

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

`Submitted` 和 `Recovered` 行会有意省略。成功执行后会记录 `Done`；`Retrying` 不是终态，
也可能记录 `Failed` 和 `Poisoned` 行。WAL 清理事件保留 topic、可清理 entry、latest offset
和 payload。
