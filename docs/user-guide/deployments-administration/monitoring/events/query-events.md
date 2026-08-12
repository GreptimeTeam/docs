---
keywords: [GreptimeDB events, query events]
description: Query GreptimeDB event records.
---

# Query events

Use the `greptime_private.events` system table to investigate recent events.
GreptimeDB writes events asynchronously, so a newly submitted operation might
not appear right away. For event columns, see [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md).

## Start with recent events

To view the most recently recorded events:

```sql
SELECT *
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

To focus on a recent operation and select only the columns you need, add a time
range:

```sql
SELECT timestamp, type, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

## Discover and filter event types

Before filtering by type, see which event types the cluster has recorded:

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
GROUP BY type
ORDER BY type;
```

The result covers only the selected time range. It is not a complete list of
types configured or supported by GreptimeDB. See
[Lifecycle event recorder](/user-guide/deployments-administration/configuration.md#lifecycle-event-recorder)
for the configured type lists. For examples, see [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md),
[Region events](/user-guide/deployments-administration/monitoring/events/region-events.md), and
[Maintenance events](/user-guide/deployments-administration/monitoring/events/maintenance-events.md).

Combine an event type with a database and object name to avoid unrelated rows:

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp;
```

Example output:

```sql
+-------------------------------+--------------+-----------------+--------------+
| timestamp                     | type         | procedure_state | trigger_type |
+-------------------------------+--------------+-----------------+--------------+
| 2026-08-10 11:28:40.590240203 | create_table | Running         | Submitted    |
| 2026-08-10 11:28:40.659064297 | create_table | Done            | Succeeded    |
+-------------------------------+--------------+-----------------+--------------+
```

## Find the latest event for an object

Replace the placeholders with the object name and, where needed, the database.
Each query returns the newest matching event.

### Database

```sql
SELECT timestamp, type, schema_name, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type IN ('create_database', 'alter_database', 'drop_database')
ORDER BY timestamp DESC
LIMIT 1;
```

### Table

```sql
SELECT timestamp, type, schema_name, table_name, table_id, procedure_state
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Flow

```sql
SELECT timestamp, type, flow_name, flow_id, procedure_state
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND flow_name = '<flow_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### View

```sql
SELECT timestamp, type, schema_name, view_name, view_id, procedure_state
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND view_name = '<view_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Region

Region events are global, not scoped to a database. Use this query to find the
latest matching event across `region_migration`, `batch_gc`, and
`repartition_group`.

Before running this query, the table must have recorded each selected type at
least once. It adds an event type's columns when it first records that type. A
column is SQL `NULL` when it does not apply to a row.

```sql
SELECT timestamp, type, procedure_state,
       region_id, source_region_id, target_region_id,
       region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id
FROM greptime_private.events
WHERE type IN ('region_migration', 'batch_gc', 'repartition_group')
  AND timestamp >= now() - INTERVAL '1' hour
  AND (region_id = <region_id>
       OR source_region_id = <region_id>
       OR target_region_id = <region_id>)
ORDER BY timestamp DESC
LIMIT 1;
```

## Query Procedure events

Procedure events share a `procedure_id`.

### Get a procedure ID

For a table-creation procedure, find the row whose trigger type is `Submitted`
for the given database and table:

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

Example result:

```sql
+--------------------------------------+
| procedure_id                         |
+--------------------------------------+
| a5788f51-5726-4db7-a85e-e9afc36da557 |
+--------------------------------------+
```

Use the returned ID to query the Procedure's event rows. Include `schema_name`
and `table_name` to avoid selecting a Procedure for another object with a
similar name.

### Query a Procedure

To retrieve every recorded row for a Procedure, query by its ID:

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp ASC;
```

For a smaller result, select only the columns you need:

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp;
```

Example output from a MySQL operation:

```sql
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | trigger_type | procedure_error | payload                                                    |
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table | Running         | Submitted    |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table | Done            | Succeeded    |                 | null                                                       |
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
```

### Find failed Procedures

To list recent failed Procedures:

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error
FROM greptime_private.events
WHERE procedure_state IN ('Failed', 'Poisoned')
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```
