---
keywords: [GreptimeDB events, event data model]
description: Understand the GreptimeDB events table data model.
---

# Event data model

The `greptime_private.events` table uses a shared envelope for every event. The
event family adds only the columns that it needs, so most family-specific
columns are sparse (`NULL` for unrelated rows).

For how to locate rows, see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md).
For the meaning of each event family, see [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
and [Operational events](/user-guide/deployments-administration/monitoring/events/operational-events.md).

## Common columns

Every row has these base columns:

| Column | Meaning |
| --- | --- |
| `type` | Lower-snake-case event type, such as `create_table` or `region_migration`. |
| `payload` | JSON payload for the event. A `Submitted` row generally contains the operation's intent. |
| `timestamp` | Time at which the event row was recorded. |

The procedure envelope identifies the operation and its lifecycle:

| Column | Meaning |
| --- | --- |
| `procedure_id` | Identifier shared by rows from one procedure. |
| `procedure_state` | Procedure state, such as `Running` or `Done`. |
| `procedure_trigger` | JSON trigger, including `Submitted`, `Recovered`, `ChildSubmitted`, `Retrying`, `RollingBack`, `Succeeded`, `Failed`, or `Poisoned`. |
| `procedure_error` | Error text recorded for a procedure failure, when present. |

`procedure_state = 'Done'` corresponds to a `Succeeded` trigger in the captured
successful run. `Failed` and `Poisoned` are terminal failure triggers; inspect
the trigger and error together rather than inferring a failure from a sparse
family column. See [Procedure lifecycle](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md).

## Context and payload semantics

`event_context` is optional JSON describing why an event was triggered. Stable
`reason` values include `manual`, `auto_create`, `auto_alter`,
`auto_repartition`, `auto_rebalance`, `region_failover`, `scheduled_gc`, and
`unknown`. For example, a manually submitted MySQL DDL event can have
`{"protocol":"mysql","reason":"manual"}`.

Do not confuse SQL `NULL` with JSON `null`:

- A submitted row can carry an object payload.
- A later lifecycle row can carry JSON `null`. In that case,
  `payload IS NULL = 0` and `json_is_null(payload) = 1`.
- `event_context` can instead be SQL `NULL`, for example on the captured
  terminal row.

This focused projection shows both cases without relying on generated IDs:

```sql
SELECT procedure_state,
       json_to_string(payload) AS payload,
       payload IS NULL AS payload_is_sql_null,
       json_is_null(payload) AS payload_is_json_null,
       json_to_string(event_context) AS event_context,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_model_20260810'
  AND table_name = 'model_probe'
ORDER BY timestamp;
```

Compact output from GreptimeDB 1.3.0:

```text
| procedure_state | payload                                                    | payload_is_sql_null | payload_is_json_null | event_context                          | procedure_trigger    |
| Running         | {"create_if_not_exists":false,"engine":"mito","version":1} | 0                   | 0                    | {"protocol":"mysql","reason":"manual"} | {"type":"Submitted"} |
| Done            | null                                                       | 0                   | 1                    | NULL                                    | {"type":"Succeeded"} |
```

## Sparse family-specific columns

Use the common locator columns first, then add family-specific projections:

- Database and table events use `catalog_name`, `schema_name`, `table_name`,
  `table_id`, and sometimes `physical_table_id`.
- Flow and view events use `flow_name`, `flow_id`, `view_name`, and `view_id`.
- Region and migration events use `region_id`, `region_number`, source and
  destination node or peer columns, and a migration trigger reason.
- Repartition events use `repartition_group_id`, source/target region and
  number columns, and source/target partition expressions.
- WAL and GC events use `topic_name`, `prunable_entry_id`, `latest_offset`, or
  `gc_report`.
- Child procedures can expose `parent_procedure_id`.

These fields are not populated uniformly across lifecycle rows. For example,
the captured `create_table` submission had `table_id = NULL`, while its
terminal row had a table ID; `region_id` stayed SQL `NULL` on both rows. See
the family pages for family-specific contracts rather than treating a missing
sparse value as an error.

## Query JSON columns

Use `json_to_string` to display JSON, `json_get_string` to extract a scalar,
`json_path_match` to evaluate a predicate, and `json_is_null` to test for JSON
`null`:

```sql
SELECT procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_path_match(procedure_trigger, '$.type == "Succeeded"') AS is_succeeded,
       json_get_string(event_context, 'reason') AS reason
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_model_20260810'
  AND table_name = 'model_probe'
ORDER BY timestamp;
```

```text
| procedure_state | trigger_type | is_succeeded | reason |
| Running         | Submitted    | 0            | manual |
| Done            | Succeeded    | 1            | NULL   |
```

`json_get_string` returns `NULL` here because `event_context` is SQL `NULL` on
the terminal row. For JSON function details, see the [JSON functions](/reference/sql/functions/json.md)
reference.
