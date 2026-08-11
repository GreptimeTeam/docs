---
keywords: [GreptimeDB events, DDL events]
description: Inspect DDL events recorded by GreptimeDB.
---

# DDL events

See [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md)
for shared columns and Procedure states.

## Database events

```sql
SELECT timestamp, type, procedure_state AS state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

Database event types are `create_database`, `alter_database`, and `drop_database`.
Event rows retain `catalog_name` and `schema_name`. This query uses these
columns as filters but does not include them in the result.

**`create_database`**

```sql
+-------------------------------+-----------------+---------+--------------+----------------------------------------------------------------------------------+
| timestamp                     | type            | state   | trigger_type | payload                                                                          |
+-------------------------------+-----------------+---------+--------------+----------------------------------------------------------------------------------+
| 2026-08-10 11:39:18.014737397 | create_database | Running | Submitted    | {"create_if_not_exists":true,"options":[{"key":"ttl","value":"1h"}],"version":1} |
| 2026-08-10 11:39:18.052757527 | create_database | Done    | Succeeded    | null                                                                             |
+-------------------------------+-----------------+---------+--------------+----------------------------------------------------------------------------------+
```

**`alter_database`**

```sql
+-------------------------------+----------------+---------+--------------+---------------------------------------------------------------------+
| timestamp                     | type           | state   | trigger_type | payload                                                             |
+-------------------------------+----------------+---------+--------------+---------------------------------------------------------------------+
| 2026-08-10 11:39:18.060198497 | alter_database | Running | Submitted    | {"action":"set","options":[{"key":"ttl","value":"2h"}],"version":1} |
| 2026-08-10 11:39:18.107764363 | alter_database | Done    | Succeeded    | null                                                                |
+-------------------------------+----------------+---------+--------------+---------------------------------------------------------------------+
```

**`drop_database`**

```sql
+-------------------------------+---------------+---------+--------------+-------------------------------------+
| timestamp                     | type          | state   | trigger_type | payload                             |
+-------------------------------+---------------+---------+--------------+-------------------------------------+
| 2026-08-10 11:39:18.113713574 | drop_database | Running | Submitted    | {"drop_if_exists":true,"version":1} |
| 2026-08-10 11:39:18.197868233 | drop_database | Done    | Succeeded    | null                                |
+-------------------------------+---------------+---------+--------------+-------------------------------------+
```

## Table events

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       table_name, table_id, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

This query returns table events of the selected type from the specified database
in the last hour. To query one table, add
`AND table_name = '<table_name>'` to the `WHERE` clause.

Rows for the same table retain `table_name`. A successful `create_table` or
`create_logical_tables` event includes `table_id` only when the Procedure returns
the allocated ID. `alter_table`, `truncate_table`, and `drop_table` already know
the table ID when they are submitted, so their event rows include it.

GreptimeDB also records `create_logical_tables` and `alter_logical_tables` events.
`undrop_table` and `purge_dropped_table` are Enterprise-only.

**`create_table`**

```sql
+-------------------------------+--------------+-----------------+--------------+----------------+----------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | trigger_type | table_name     | table_id | payload                                                    |
+-------------------------------+--------------+-----------------+--------------+----------------+----------+------------------------------------------------------------+
| 2026-08-10 11:39:53.544351589 | create_table | Running         | Submitted    | ddl_source     |     NULL | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:39:53.620080844 | create_table | Done            | Succeeded    | ddl_source     |     1449 | null                                                       |
+-------------------------------+--------------+-----------------+--------------+----------------+----------+------------------------------------------------------------+
```

**`alter_table`**

```sql
+-------------------------------+-------------+-----------------+--------------+------------+----------+------------------------------------+
| timestamp                     | type        | procedure_state | trigger_type | table_name | table_id | payload                            |
+-------------------------------+-------------+-----------------+--------------+------------+----------+------------------------------------+
| 2026-08-10 11:40:23.445906161 | alter_table | Running         | Submitted    | ddl_source |     1449 | {"kind":"add_columns","version":1} |
| 2026-08-10 11:40:23.539710789 | alter_table | Done            | Succeeded    | ddl_source |     1449 | null                               |
+-------------------------------+-------------+-----------------+--------------+------------+----------+------------------------------------+
```

**`truncate_table`**

```sql
+-------------------------------+----------------+-----------------+--------------+----------------+----------+------------------------------------+
| timestamp                     | type           | procedure_state | trigger_type | table_name     | table_id | payload                            |
+-------------------------------+----------------+-----------------+--------------+----------------+----------+------------------------------------+
| 2026-08-10 11:40:51.949349425 | truncate_table | Running         | Submitted    | ddl_drop_probe |     1451 | {"time_range_count":0,"version":1} |
| 2026-08-10 11:40:51.982366731 | truncate_table | Done            | Succeeded    | ddl_drop_probe |     1451 | null                               |
+-------------------------------+----------------+-----------------+--------------+----------------+----------+------------------------------------+
```

**`drop_table`**

```sql
+-------------------------------+------------+-----------------+--------------+----------------+----------+--------------------------------------+
| timestamp                     | type       | procedure_state | trigger_type | table_name     | table_id | payload                              |
+-------------------------------+------------+-----------------+--------------+----------------+----------+--------------------------------------+
| 2026-08-10 11:40:51.986072827 | drop_table | Running         | Submitted    | ddl_drop_probe |     1451 | {"drop_if_exists":false,"version":1} |
| 2026-08-10 11:40:52.061732144 | drop_table | Done            | Succeeded    | ddl_drop_probe |     1451 | null                                 |
+-------------------------------+------------+-----------------+--------------+----------------+----------+--------------------------------------+
```

## Flow events

Flow rows retain `catalog_name` and `flow_name`. `schema_name` is SQL `NULL` for
flows, while `flow_name` remains available. `create_flow` adds `flow_id` when
available, and `drop_flow` retains the known ID.

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       catalog_name, schema_name, flow_name, flow_id,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND flow_name = '<flow_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

**`create_flow`**

```sql
+-------------------------------+-------------+-----------------+--------------+--------------+-------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| timestamp                     | type        | procedure_state | trigger_type | catalog_name | schema_name | flow_name | flow_id | payload                                                                                                   |
+-------------------------------+-------------+-----------------+--------------+--------------+-------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| 2026-08-10 11:41:47.833758897 | create_flow | Running         | Submitted    | greptime     | NULL        | ddl_flow  |    NULL | {"create_if_not_exists":false,"eval_interval_secs":10,"expire_after":null,"or_replace":false,"version":1} |
| 2026-08-10 11:41:47.857319802 | create_flow | Done            | Succeeded    | greptime     | NULL        | ddl_flow  |    1025 | null                                                                                                      |
+-------------------------------+-------------+-----------------+--------------+--------------+-------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
```

**`drop_flow`**

```sql
+-------------------------------+-----------+-----------------+--------------+--------------+-------------+-----------+---------+--------------------------------------+
| timestamp                     | type      | procedure_state | trigger_type | catalog_name | schema_name | flow_name | flow_id | payload                              |
+-------------------------------+-----------+-----------------+--------------+--------------+-------------+-----------+---------+--------------------------------------+
| 2026-08-10 11:41:47.864231473 | drop_flow | Running         | Submitted    | greptime     | NULL        | ddl_flow  |    1025 | {"drop_if_exists":false,"version":1} |
| 2026-08-10 11:41:47.926665304 | drop_flow | Done            | Succeeded    | greptime     | NULL        | ddl_flow  |    1025 | null                                 |
+-------------------------------+-----------+-----------------+--------------+--------------+-------------+-----------+---------+--------------------------------------+
```

## View events

View rows retain stable `view_name` values. `create_view` adds `view_id` only
when available, and `drop_view` retains the known ID.

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       view_name, view_id, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND view_name = '<view_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

The query uses `schema_name` as a filter and does not include it in the result.

**`create_view`**

```sql
+-------------------------------+-------------+-----------------+--------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| timestamp                     | type        | procedure_state | trigger_type | view_name | view_id | payload                                                                                                   |
+-------------------------------+-------------+-----------------+--------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| 2026-08-10 11:41:18.483028192 | create_view | Running         | Submitted    | ddl_view  |    NULL | {"column_count":0,"create_if_not_exists":false,"or_replace":false,"referenced_table_count":1,"version":1} |
| 2026-08-10 11:41:18.513571854 | create_view | Done            | Succeeded    | ddl_view  |    1452 | null                                                                                                      |
+-------------------------------+-------------+-----------------+--------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
```

**`drop_view`**

```sql
+-------------------------------+-----------+-----------------+--------------+-----------+---------+--------------------------------------+
| timestamp                     | type      | procedure_state | trigger_type | view_name | view_id | payload                              |
+-------------------------------+-----------+-----------------+--------------+-----------+---------+--------------------------------------+
| 2026-08-10 11:41:18.520281932 | drop_view | Running         | Submitted    | ddl_view  |    1452 | {"drop_if_exists":false,"version":1} |
| 2026-08-10 11:41:18.572632167 | drop_view | Done            | Succeeded    | ddl_view  |    1452 | null                                 |
+-------------------------------+-----------+-----------------+--------------+-----------+---------+--------------------------------------+
```
