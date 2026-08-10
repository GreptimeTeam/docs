---
keywords: [GreptimeDB 事件, 运维事件]
description: 查看 GreptimeDB 记录的运维事件。
---

# 运维事件

以下五类事件均由分布式部署中的 Metasrv 发出：`repartition`、
`repartition_group`、`region_migration`、`batch_gc` 和 `wal_prune`。以下查询和输出
均为只读操作。不要仅为查看这些事件而触发集群级 Region、GC 或 WAL 操作。

## Repartition

父 Procedure 会提交 `repartition_group` 子 Procedure。可以按如下方式查询父
Procedure 的生命周期：

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

`Submitted` 行的 payload 包含分区意图，可以单独查询。非 `Submitted` 生命周期行
的 payload 使用 JSON `null`。

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

`Done` 行保留 Procedure、父 Procedure 和 Group ID。源/目标字段为 SQL `NULL`，因为
每个目标的拓扑信息被省略。

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

公开示例省略 peer 地址。非 `Submitted` 行保留 Region、节点和超时 payload 信息。

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

定时任务的 `Submitted` 行会被省略；手动 `Submitted` 行记录配置信息。空的
`GcReport` 不会产生 `Done` 事件。非空 `Done` 事件包含受影响的 Region 维度和
`gc_report`；其 `payload` 为 JSON `null`。

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

`Submitted` 和 `Recovered` 事件会有意省略。有效的成功结果会记录 `Done`；
`Retrying` 是非终态事件，而不是终态；`Failed` 和 `Poisoned` 事件也可能被记录。
WAL prune 事件保留 topic、prunable entry、latest offset 和 payload。
