---
keywords: [GreptimeDB events, query events]
description: Query GreptimeDB lifecycle and operational events.
---

# Query events

Query the `greptime_private.events` system table to investigate recent
procedures. Events are written asynchronously, so a newly submitted operation
might not be visible immediately. See [Procedure lifecycle](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
and [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
for lifecycle states and columns.

## Start with recent events

The following query returns the complete event record:

```sql
SELECT *
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

This is useful for exploration, but it returns 36 columns. For routine checks,
use a focused projection instead:

```sql
SELECT timestamp, type, procedure_state,
       catalog_name, schema_name, table_name, view_name, flow_name, region_id
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

The compact result keeps the time, lifecycle state, type, and the main object
locators visible without pasting the full wide output.

## Discover and filter event types

List types actually present in the cluster before choosing a filter:

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
GROUP BY type
ORDER BY type;
```

The result is a point-in-time view of the event types currently present in the
cluster. It varies with workload and does not define the configured or
source-supported types. See [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
and [Operational events](/user-guide/deployments-administration/monitoring/events/operational-events.md)
for the supported event families.

Combine a type with catalog/schema and an object locator to avoid unrelated rows:

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp;
```

Example output:

```sql
+-------------------------------+--------------+-----------------+----------------------+
| timestamp                     | type         | procedure_state | procedure_trigger    |
+-------------------------------+--------------+-----------------+----------------------+
| 2026-08-10 11:28:40.590240203 | create_table | Running         | {"type":"Submitted"} |
| 2026-08-10 11:28:40.659064297 | create_table | Done            | {"type":"Succeeded"} |
+-------------------------------+--------------+-----------------+----------------------+
```

## Find the latest event for an object

Replace the placeholders with your locators. Each query
returns the newest matching event.

### Database

```sql
SELECT timestamp, type, schema_name, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND type IN ('create_database', 'alter_database', 'drop_database')
ORDER BY timestamp DESC
LIMIT 1;
```

### Table

```sql
SELECT timestamp, type, schema_name, table_name, table_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Flow

Flow rows can have SQL `NULL` in `schema_name`. Use `catalog_name` plus a unique
`flow_name`.

```sql
SELECT timestamp, type, catalog_name, schema_name,
       flow_name, flow_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND flow_name = '<flow_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### View

```sql
SELECT timestamp, type, schema_name, view_name, view_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND view_name = '<view_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Region

Region-bearing operational events are global rows, not database-isolated objects.
The following query finds the latest event for one Region across the applicable
event families:

```sql
SELECT timestamp, type, procedure_state,
       region_id, source_region_id, target_region_id,
       region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id
FROM greptime_private.events
WHERE type IN ('region_migration', 'batch_gc', 'repartition_group')
  AND (region_id = <region_id>
       OR source_region_id = <region_id>
       OR target_region_id = <region_id>)
ORDER BY timestamp DESC
LIMIT 1;
```
