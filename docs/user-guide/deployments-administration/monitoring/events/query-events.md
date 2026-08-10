---
keywords: [GreptimeDB events, query events]
description: Query GreptimeDB event records.
---

# Query events

Query the `greptime_private.events` system table to investigate recent events.
Events are written asynchronously, so a newly submitted operation might not be
visible immediately. See [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
for event columns.

## Start with recent events

The following query returns all columns for up to 20 events recorded during the
last hour:

```sql
SELECT *
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

This is useful for exploration, but it returns every column. For routine checks,
select only the columns you need:

```sql
SELECT timestamp, type, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

The compact result keeps the time, type, and payload visible without pasting the
full output.

## Discover and filter event types

List types actually present in the cluster before choosing a filter:

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
GROUP BY type
ORDER BY type;
```

The result is a point-in-time view of the event types currently present in the
cluster. It varies with workload and does not define the configured or
source-supported types. See [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
for the supported local DDL event types and
[Operational events](/user-guide/deployments-administration/monitoring/events/operational-events.md)
for the supported Metasrv operational event types.

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

Operational events that reference a Region are global, not tied to a database.
Use this query to find the latest event for a Region. It requires
`region_migration`, `batch_gc`, and `repartition_group` to have each recorded at
least one event: the table adds an event type's columns when it first records
that type. A row fills only the fields for its event type; the other selected
fields are SQL `NULL`.

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

Use the returned ID to query the Procedure's event rows. Filtering by
`schema_name` and `table_name` avoids selecting a procedure for another object
with a similar name.

### Query a Procedure

Use the full-row query when you need to explore every available column:

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp ASC;
```

For routine checks, use a focused projection:

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
  AND timestamp >= now() - INTERVAL '1' hour
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
