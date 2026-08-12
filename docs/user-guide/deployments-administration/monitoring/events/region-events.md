---
keywords: [GreptimeDB events, Region events, repartition, Region migration]
description: Inspect Region events recorded by GreptimeDB.
---

# Region events

Metasrv records Region events for repartitioning and Region migration in distributed deployments.

A `region_id` combines a high 32-bit `table_id` with a low 32-bit `region_number`. The queries on this page return all three values together.

## Repartition

Each repartition consists of a root `repartition` Procedure and one or more `repartition_group` child Procedures. The root `Submitted` row records the table and requested partition rules. The child `Submitted` rows show how each source Region is split or merged.

Find the root Procedure:

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

The `payload` column contains `source_type` and `target_partition_exprs`. It also contains `source_partition_exprs` for a partitioned source. Use the returned `procedure_id` to query the Region mapping:

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

For an unpartitioned table, `source_partition_expr` is SQL `NULL`. The source and target table IDs are the same because every mapping belongs to one table. To inspect a child Procedure's lifecycle, query its `procedure_id` on [Query Procedure events](/user-guide/deployments-administration/monitoring/events/query-events.md).

## Region migration

Region migration can be started manually or by Region Balancer or Region Failover. This query shows the latest migration:

```sql
SELECT timestamp, procedure_id, procedure_state,
       region_id, table_id, region_number,
       region_migration_trigger_reason,
       region_migration_src_node_id AS source_datanode_id,
       region_migration_src_peer_addr AS source_datanode_addr,
       region_migration_dst_node_id AS target_datanode_id,
       region_migration_dst_peer_addr AS target_datanode_addr
FROM greptime_private.events
WHERE type = 'region_migration'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 1;
```

```sql
+-------------------------------+--------------------------------------+-----------------+---------------+----------+---------------+---------------------------------+--------------------+----------------------+--------------------+----------------------+
| timestamp                     | procedure_id                         | procedure_state | region_id     | table_id | region_number | region_migration_trigger_reason | source_datanode_id | source_datanode_addr | target_datanode_id | target_datanode_addr |
+-------------------------------+--------------------------------------+-----------------+---------------+----------+---------------+---------------------------------+--------------------+----------------------+--------------------+----------------------+
| 2026-08-10 02:52:50.078350103 | 63167e21-0165-4964-afef-02271baa126b | Done            | 5162550689808 |     1202 |            16 | AutoRebalance                   |                  1 | 172.16.62.49:4001    |                  2 | 172.16.232.158:4001  |
+-------------------------------+--------------------------------------+-----------------+---------------+----------+---------------+---------------------------------+--------------------+----------------------+--------------------+----------------------+
```

`region_migration_trigger_reason` identifies why the migration started. The source and target columns identify the Datanodes involved.
