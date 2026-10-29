---
keywords: [GreptimeDB 事件, Region 事件, 重分区, Region 迁移]
description: 查看 GreptimeDB 记录的 Region 事件。
---

# Region 事件

在分布式部署中，Metasrv 会记录重分区和 Region 迁移事件。

`region_id` 由高 32 位的 `table_id` 和低 32 位的 `region_number` 组成。下面的查询将这三个字段一起显示。

## 重分区

每次重分区包含一个根 `repartition` Procedure 和一个或多个 `repartition_group` 子 Procedure。根 Procedure 的 `Submitted` 行记录表和请求的分区规则，子 Procedure 的 `Submitted` 行记录每个源 Region 如何拆分或合并。

先查询根 Procedure：

```sql
SELECT timestamp, procedure_id, procedure_state,
       catalog_name, schema_name, table_name, table_id,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE type = 'repartition'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

```sql
+-------------------------------+--------------------------------------+-----------------+--------------+-------------------+-------------------------+----------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| timestamp                     | procedure_id                         | procedure_state | catalog_name | schema_name       | table_name              | table_id | payload                                                                                                                                                                                                                                          |
+-------------------------------+--------------------------------------+-----------------+--------------+-------------------+-------------------------+----------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 2026-08-09 08:29:30.771436255 | 95bb4e53-e73e-40b1-b878-208b0ae2b812 | Running         | greptime     | repartitiondebug1 | greptime_physical_table |     1332 | {"source_partition_exprs":["namespace >= app-2"],"source_type":"partitioned","target_partition_exprs":["namespace >= app-2 AND namespace < app-26","namespace >= app-26 AND namespace < app-5","namespace >= app-5"],"timeout":"2m","version":2} |
+-------------------------------+--------------------------------------+-----------------+--------------+-------------------+-------------------------+----------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

`payload` 包含 `source_type` 和 `target_partition_exprs`。源表已分区时，它还包含 `source_partition_exprs`。使用返回的 `procedure_id` 查询 Region 映射：

```sql
SELECT timestamp,
       parent_procedure_id AS repartition_procedure_id,
       procedure_id AS repartition_group_procedure_id,
       source_region_id, table_id AS source_table_id, source_region_number, source_partition_expr,
       target_region_id, table_id AS target_table_id, target_region_number, target_partition_expr
FROM greptime_private.events
WHERE type = 'repartition_group'
  AND parent_procedure_id = '<repartition_procedure_id>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY source_region_id, target_region_id;
```

```sql
+-------------------------------+--------------------------------------+--------------------------------------+------------------+-----------------+----------------------+-----------------------+------------------+-----------------+----------------------+-------------------------------------------+
| timestamp                     | repartition_procedure_id             | repartition_group_procedure_id       | source_region_id | source_table_id | source_region_number | source_partition_expr | target_region_id | target_table_id | target_region_number | target_partition_expr                     |
+-------------------------------+--------------------------------------+--------------------------------------+------------------+-----------------+----------------------+-----------------------+------------------+-----------------+----------------------+-------------------------------------------+
| 2026-08-09 08:29:30.968778963 | 95bb4e53-e73e-40b1-b878-208b0ae2b812 | 4f132d57-c402-4c9f-b707-3b9d53b32cfa |    5720896438274 |            1332 |                    2 | namespace >= app-2    |    5720896438274 |            1332 |                    2 | namespace >= app-2 AND namespace < app-26 |
| 2026-08-09 08:29:30.968778963 | 95bb4e53-e73e-40b1-b878-208b0ae2b812 | 4f132d57-c402-4c9f-b707-3b9d53b32cfa |    5720896438274 |            1332 |                    2 | namespace >= app-2    |    5720896438275 |            1332 |                    3 | namespace >= app-26 AND namespace < app-5 |
| 2026-08-09 08:29:30.968778963 | 95bb4e53-e73e-40b1-b878-208b0ae2b812 | 4f132d57-c402-4c9f-b707-3b9d53b32cfa |    5720896438274 |            1332 |                    2 | namespace >= app-2    |    5720896438276 |            1332 |                    4 | namespace >= app-5                        |
+-------------------------------+--------------------------------------+--------------------------------------+------------------+-----------------+----------------------+-----------------------+------------------+-----------------+----------------------+-------------------------------------------+
```

未分区表的 `source_partition_expr` 为 SQL `NULL`。源和目标的 table ID 相同，因为每条映射都属于同一张表。要查看子 Procedure 的生命周期，请用其 `procedure_id` 查询[Procedure 事件](/user-guide/deployments-administration/monitoring/events/query-events.md)。

## Region 迁移

Region 迁移可以手动发起，也可以由 Region Balancer 或 Region Failover 触发。下面的查询返回最近一次迁移事件的所有 Region 记录：

```sql
WITH latest_migration AS (
  SELECT procedure_id, timestamp
  FROM greptime_private.events
  WHERE type = 'region_migration'
    AND timestamp >= now() - INTERVAL '1' hour
  ORDER BY timestamp DESC
  LIMIT 1
)
SELECT e.timestamp, e.procedure_id, e.procedure_state,
       e.region_id, e.table_id, e.region_number,
       e.region_migration_trigger_reason,
       e.region_migration_src_node_id AS source_datanode_id,
       e.region_migration_src_peer_addr AS source_datanode_addr,
       e.region_migration_dst_node_id AS target_datanode_id,
       e.region_migration_dst_peer_addr AS target_datanode_addr
FROM greptime_private.events AS e
JOIN latest_migration AS latest
  ON e.procedure_id = latest.procedure_id
 AND e.timestamp = latest.timestamp
WHERE e.type = 'region_migration'
ORDER BY e.region_id;
```

```sql
+-------------------------------+--------------------------------------+-----------------+---------------+----------+---------------+---------------------------------+--------------------+----------------------+--------------------+----------------------+
| timestamp                     | procedure_id                         | procedure_state | region_id     | table_id | region_number | region_migration_trigger_reason | source_datanode_id | source_datanode_addr | target_datanode_id | target_datanode_addr |
+-------------------------------+--------------------------------------+-----------------+---------------+----------+---------------+---------------------------------+--------------------+----------------------+--------------------+----------------------+
| 2026-08-10 02:52:50.078350103 | 63167e21-0165-4964-afef-02271baa126b | Done            | 5162550689808 |     1202 |            16 | AutoRebalance                   |                  1 | 172.16.62.49:4001    |                  2 | 172.16.232.158:4001  |
+-------------------------------+--------------------------------------+-----------------+---------------+----------+---------------+---------------------------------+--------------------+----------------------+--------------------+----------------------+
```

`region_migration_trigger_reason` 表示迁移的触发原因。源和目标字段分别给出参与迁移的 Datanode。
