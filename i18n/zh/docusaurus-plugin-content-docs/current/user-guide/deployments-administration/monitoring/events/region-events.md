---
keywords: [GreptimeDB 事件, Region 事件, 重分区, Region 迁移]
description: 查看 GreptimeDB 记录的 Region 事件。
---

# Region 事件

在带 Metasrv 的分布式部署中，调整表的分区布局或迁移 Region 时会记录 Region 事件。

## 重分区

`repartition` Procedure 会提交一个或多个 `repartition_group` 子 Procedure。先找到父
Procedure 的 `Submitted` 行：

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'repartition'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

根据返回的 ID 查询父 Procedure 的所有事件记录：

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_get_string(procedure_trigger, 'procedure_id') AS child_procedure_id
FROM greptime_private.events
WHERE procedure_id = '<repartition_procedure_id>'
ORDER BY timestamp;
```

```sql
+-------------------------------+-------------+--------------------------------------+-----------------+----------------+--------------------------------------+
| timestamp                     | type        | procedure_id                         | procedure_state | trigger_type   | child_procedure_id                   |
+-------------------------------+-------------+--------------------------------------+-----------------+----------------+--------------------------------------+
| 2026-08-10 11:48:29.492950260 | repartition | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | Running         | Submitted      | NULL                                 |
| 2026-08-10 11:48:29.598868367 | repartition | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | Running         | ChildSubmitted | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe |
| 2026-08-10 11:48:29.917708631 | repartition | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | Done            | Succeeded      | NULL                                 |
+-------------------------------+-------------+--------------------------------------+-----------------+----------------+--------------------------------------+
```

表定位列和重分区意图列只在 `Submitted` 行中填充。父 Procedure 后续的生命周期行中，这些列为
SQL `NULL`，因此应按 `procedure_id` 而不是表定位列查询。

## 重分区组

`repartition_group` Procedure 的 `Submitted` 行描述从源 Region 到目标 Region 的映射。
使用父 Procedure ID 查找这些行：

```sql
SELECT timestamp, procedure_id, parent_procedure_id, repartition_group_id,
       source_region_id, target_region_id, target_partition_expr
FROM greptime_private.events
WHERE type = 'repartition_group'
  AND timestamp >= now() - INTERVAL '1' hour
  AND parent_procedure_id = '<repartition_procedure_id>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp, target_region_id;
```

```sql
+-------------------------------+--------------------------------------+--------------------------------------+--------------------------------------+------------------+------------------+-----------------------+
| timestamp                     | procedure_id                         | parent_procedure_id                  | repartition_group_id                 | source_region_id | target_region_id | target_partition_expr |
+-------------------------------+--------------------------------------+--------------------------------------+--------------------------------------+------------------+------------------+-----------------------+
| 2026-08-10 11:48:29.598852207 | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | d8fdedbf-7e5c-496e-9620-afba27081cfa |    6240587481088 |    6240587481088 | host < 10             |
| 2026-08-10 11:48:29.598852207 | 9ee0ac83-a4bb-45f8-b5bc-d3b1aad4edfe | 4d7a1f1d-d290-4849-a5da-5a7bf8d1e3a2 | d8fdedbf-7e5c-496e-9620-afba27081cfa |    6240587481088 |    6240587481089 | host >= 10            |
+-------------------------------+--------------------------------------+--------------------------------------+--------------------------------------+------------------+------------------+-----------------------+
```

只有 `repartition_group` Procedure 的 `Submitted` 行包含父 Procedure、组和拓扑字段。
要查看子 Procedure 的完整生命周期，请使用它的 `procedure_id` 参阅[查询 Procedure 事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。

## Region 迁移

Region 迁移可以手动发起，也可以由自动均衡或故障转移触发。按以下方式查询最近一次迁移：

```sql
SELECT timestamp, type, region_id, region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id,
       procedure_state
FROM greptime_private.events
WHERE type = 'region_migration'
  AND timestamp >= now() - INTERVAL '1' hour
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

`region_migration_trigger_reason` 记录迁移的触发原因。本示例省略 peer 地址。
