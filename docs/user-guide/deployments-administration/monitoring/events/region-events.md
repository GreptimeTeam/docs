---
keywords: [GreptimeDB events, Region events, repartition, Region migration]
description: Inspect Region events recorded by GreptimeDB.
---

# Region events

In distributed deployments with Metasrv, Region events are recorded when a table's
partition layout changes or a Region moves between Datanodes.

## Repartition

A `repartition` Procedure submits `repartition_group` child Procedures. First,
find the parent Procedure's `Submitted` row:

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

Use the returned ID to query every recorded row for the parent Procedure:

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

The table locator and repartition-intent columns are populated on the `Submitted`
row. Later lifecycle rows for the parent Procedure have SQL `NULL` in those
columns, so query them by `procedure_id` rather than by a table locator.

## Repartition groups

The `Submitted` rows for a `repartition_group` Procedure describe the mapping
from source Regions to target Regions. Use the parent Procedure ID to find them:

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

Only `Submitted` rows for a `repartition_group` Procedure include the parent,
group, and topology fields. Use the child `procedure_id` with the
[Procedure query guide](/user-guide/deployments-administration/monitoring/events/query-events.md)
to inspect its full lifecycle.

## Region migration

A Region migration can be initiated manually, by auto-rebalancing, or during
failover. Query the latest migration as follows:

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

`region_migration_trigger_reason` records why the migration began. This example
omits peer addresses.
