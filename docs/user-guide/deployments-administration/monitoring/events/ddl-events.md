---
keywords: [GreptimeDB events, DDL events]
description: Inspect DDL events recorded by GreptimeDB.
---

# DDL events

DDL events record the lifecycle of submitted database-object changes, including
submission and completion rows. This page is for inspecting recorded events,
not for defining a required workflow that generates them. For the shared event
columns and procedure states, see [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md).
For general query patterns, see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md).

## Database events

Database events use `catalog_name` and `schema_name` as their locator. The
`schema_name` is the database name. A `Running` row's payload describes the
requested option or action; a terminal `Done` row normally has JSON `null` in
`payload`.

Supported types are:

- `create_database`: creation options, such as `create_if_not_exists` and
  database options.
- `alter_database`: the option action and values, such as `set` and `ttl`.
- `drop_database`: whether the operation allows a missing database.

Example observed rows:

```text
create_database  Running  docs_ev2723_ddl_db_20260810  {"create_if_not_exists":true,"options":[{"key":"ttl","value":"1h"}],"version":1}
alter_database   Running  docs_ev2723_ddl_db_20260810  {"action":"set","options":[{"key":"ttl","value":"2h"}],"version":1}
drop_database    Running  docs_ev2723_ddl_db_20260810  {"drop_if_exists":true,"version":1}
```

## Table events

Use `catalog_name`, `schema_name`, and `table_name` to locate a table. Use
`table_id` when following one table across its lifecycle: a create submission
can have no ID, while the completed create row can contain the allocated ID.
The payload identifies the intended table operation or its options; completed
rows use JSON `null` in the observed runtime.

The source supports these table families:

| Type | Payload intent |
| --- | --- |
| `create_table` | Creation options, including the engine and `create_if_not_exists`. |
| `create_logical_tables` | Logical-table creation intent. Source-supported; not observed in the runtime evidence. |
| `alter_table` | The schema alteration, for example `add_columns`. |
| `alter_logical_tables` | Logical-table alteration intent. Source-supported; not observed in the runtime evidence. |
| `drop_table` | Whether a missing table is allowed. |
| `truncate_table` | The requested time-range scope, represented by `time_range_count` in the observed payload. |
| `undrop_table` | Enterprise-only restoration of a dropped table. Source-supported; no live evidence was collected. |
| `purge_dropped_table` | Enterprise-only permanent removal of a dropped table. Source-supported; no live evidence was collected. |

Observed query and rows:

```sql
SELECT timestamp, type, procedure_state, table_name, table_id,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_ddl_20260810'
  AND type IN ('create_table', 'alter_table', 'truncate_table', 'drop_table')
ORDER BY timestamp;
```

```text
create_table  Running  ddl_source      NULL  {"create_if_not_exists":false,"engine":"mito","version":1}
create_table  Done     ddl_source      1449  null
alter_table   Running  ddl_source      1449   {"kind":"add_columns","version":1}
truncate_table Running ddl_drop_probe  1451  {"time_range_count":0,"version":1}
drop_table    Running  ddl_drop_probe  1451  {"drop_if_exists":false,"version":1}
```

The logical-table and enterprise-only types above are source-supported names,
not claims that those event rows were observed.

## Flow events

Flow rows use `catalog_name`, `flow_name`, and `flow_id`. In the observed
runtime, `schema_name` was SQL `NULL`, so do not use it as the flow locator.
The payload records creation or drop intent, such as evaluation interval,
replacement, expiration, or missing-object handling.

```sql
SELECT timestamp, type, procedure_state, catalog_name, schema_name,
       flow_name, flow_id, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime' AND flow_name = 'ddl_flow'
ORDER BY timestamp;
```

Observed rows include:

```text
create_flow  Running  greptime  NULL  ddl_flow  NULL  {"create_if_not_exists":false,"eval_interval_secs":10,"expire_after":null,"or_replace":false,"version":1}
create_flow  Done     greptime  NULL  ddl_flow  1025  null
drop_flow    Running  greptime  NULL  ddl_flow  1025   {"drop_if_exists":false,"version":1}
```

The supported flow types are `create_flow` and `drop_flow`.

## View events

View rows use `catalog_name`, `schema_name`, `view_name`, and `view_id`. The
creation payload records replacement behavior and a compact summary of the
definition, such as referenced-table and column counts. The drop payload
records missing-view handling.

```text
create_view  Running  ddl_view  NULL  {"column_count":0,"create_if_not_exists":false,"or_replace":false,"referenced_table_count":1,"version":1}
create_view  Done     ddl_view  1452  null
drop_view    Running  ddl_view  1452  {"drop_if_exists":false,"version":1}
```

The supported view types are `create_view` and `drop_view`. For procedure
submission, completion, and failure interpretation, see [Procedure lifecycle](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md).
