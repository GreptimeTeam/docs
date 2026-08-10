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

The issue-required query returns the complete, wide event record:

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

The tested cluster returned `alter_table`, `batch_gc`, `create_database`,
`create_flow`, `create_logical_tables`, `create_table`, `create_view`,
`drop_database`, `drop_table`, `region_migration`, `repartition`,
`repartition_group`, and `wal_prune`. This is an observed set, not the complete
configured or source-supported set. See [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
and [Operational events](/user-guide/deployments-administration/monitoring/events/operational-events.md)
for the full event families.

Combine a type with catalog/schema and an object locator to avoid unrelated
rows:

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       schema_name, table_name
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND table_name = 'query_source'
ORDER BY timestamp;
```

Compact result for `query_source`:

```text
+-------------------------------+--------------+-----------------+----------------------+----------------------------+--------------+
| timestamp                     | type         | procedure_state | procedure_trigger    | schema_name                | table_name   |
+-------------------------------+--------------+-----------------+----------------------+----------------------------+--------------+
| 2026-08-10 11:28:40.590240203 | create_table | Running         | {"type":"Submitted"} | docs_ev2723_query_20260810 | query_source |
| 2026-08-10 11:28:40.659064297 | create_table | Done            | {"type":"Succeeded"} | docs_ev2723_query_20260810 | query_source |
+-------------------------------+--------------+-----------------+----------------------+----------------------------+--------------+
```

## Find the latest event for an object

Replace the example database and object names with your locators. Each query
returns the newest matching event.

### Database

```sql
SELECT timestamp, type, schema_name, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND type IN ('create_database', 'alter_database', 'drop_database')
ORDER BY timestamp DESC
LIMIT 1;
```

### Table

```sql
SELECT timestamp, type, schema_name, table_name, table_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND table_name = 'query_source'
ORDER BY timestamp DESC
LIMIT 1;
```

### Flow

On the tested cluster, generated Flow rows had SQL `NULL` in `schema_name`.
Use the catalog and a unique `flow_name`; this query intentionally does not
pretend to be schema-filtered.

```sql
SELECT timestamp, type, catalog_name, schema_name,
       flow_name, flow_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND flow_name = 'query_flow'
ORDER BY timestamp DESC
LIMIT 1;
```

### View

```sql
SELECT timestamp, type, schema_name, view_name, view_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND view_name = 'query_view'
ORDER BY timestamp DESC
LIMIT 1;
```

### Region

Region migration events are global operational rows, not database-isolated
objects. The following read-only query finds the latest pre-existing row:

```sql
SELECT timestamp, type, region_id, region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id,
       procedure_state
FROM greptime_private.events
WHERE type = 'region_migration'
ORDER BY timestamp DESC
LIMIT 1;
```
