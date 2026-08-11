---
keywords: [GreptimeDB events, event data model]
description: Understand the GreptimeDB events table data model.
---

# Event data model

`greptime_private.events` has a common envelope. Family-specific columns are
sparse and are SQL `NULL` when a family does not populate them.

| Column | Meaning |
| --- | --- |
| `type` | Event type, such as `create_table` or `region_migration`. |
| `timestamp` | Time at which the row was recorded. |
| `procedure_id` | Unique Procedure ID. |
| `procedure_state` | Procedure state when the event was recorded. Values are `Running`, `Done`, `Retrying`, `PrepareRollback`, `RollingBack`, `Failed`, and `Poisoned`. |
| `procedure_trigger` | Procedure event trigger in JSON. Its `type` is `Submitted`, `Recovered`, `ChildSubmitted`, `Retrying`, `RollingBack`, `Succeeded`, `Failed`, or `Poisoned`. |
| `procedure_error` | Error message when the Procedure fails. |
| `payload` | JSON data for the event type. |
| `event_context` | JSON describing why the event was triggered when context is available. |

The runner regenerates terminal events through the live procedure's `event()`
hook. Terminal family fields are therefore type-specific, not guaranteed copies
of submitted fields. Recording is asynchronous and best effort.

When `event_context` is available, its stable `reason` value is one of
`manual`, `auto_create`, `auto_alter`, `auto_repartition`, `auto_rebalance`,
`region_failover`, `scheduled_gc`, or `unknown`. For example, a MySQL-submitted
event can contain `{"protocol":"mysql","reason":"manual"}`.

For focused examples, see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md),
[Procedure events](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md),
and [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md).

## Query JSON fields

See the [JSON functions](/reference/sql/functions/json.md) reference for
details. In event queries, `json_to_string` converts a JSON value to readable
text, `json_get_string` extracts a value by path, `json_path_match` evaluates a
JSON predicate, and `json_is_null` checks whether a value is the JSON `null`
value. Use `IS NULL` separately to check for SQL `NULL`.

For example, this query extracts fields from a `create_table` row that has
event context:

```sql
SELECT procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_path_match(procedure_trigger, '$.type == "Submitted"') AS is_submitted,
       json_get_string(event_context, 'reason') AS reason
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND event_context IS NOT NULL
ORDER BY timestamp;
```

```sql
+-----------------+--------------+--------------+--------+
| procedure_state | trigger_type | is_submitted | reason |
+-----------------+--------------+--------------+--------+
| Running         | Submitted    |            1 | manual |
+-----------------+--------------+--------------+--------+
```

## JSON `null` and SQL `NULL`

In the `create_table` example and DDL/repartition events after a Procedure completes, a terminal
`payload` can be JSON `null` rather than SQL `NULL`:

```sql
SELECT procedure_state, json_to_string(payload) AS payload,
       payload IS NULL AS payload_is_sql_null,
       json_is_null(payload) AS payload_is_json_null,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND catalog_name = 'greptime'
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp;
```

```sql
+-----------------+------------------------------------------------------------+---------------------+----------------------+--------------+
| procedure_state | payload                                                    | payload_is_sql_null | payload_is_json_null | trigger_type |
+-----------------+------------------------------------------------------------+---------------------+----------------------+--------------+
| Running         | {"create_if_not_exists":false,"engine":"mito","version":1} | 0                   | 0                    | Submitted    |
| Done            | null                                                       | 0                   | 1                    | Succeeded    |
+-----------------+------------------------------------------------------------+---------------------+----------------------+--------------+
```

Typical family columns include database/table locators and IDs, flow/view
locators and IDs, region/node fields, repartition source/target fields,
`parent_procedure_id`, `gc_report`, and WAL offsets. Missing sparse values are
not by themselves errors; use the family pages for their contracts.
