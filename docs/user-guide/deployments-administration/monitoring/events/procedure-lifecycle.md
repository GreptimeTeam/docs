---
keywords: [GreptimeDB events, Procedure events]
description: Inspect Procedure events in GreptimeDB.
---

# Procedure events

Procedure events share a `procedure_id`. For an overview of the event table and
its common columns, see [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md).

## Get a procedure ID

For a table-creation procedure, locate the `Submitted` row by its catalog,
database, and table:

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
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

Use the returned ID to query the Procedure's event rows. The locator
filters help avoid selecting a procedure for another object with a similar
name.

## Query Procedure events

Use the full-row query when you need to explore every available column:

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp ASC;
```

For routine checks, use a focused projection:

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp;
```

Example output from a MySQL operation:

```sql
+-------------------------------+--------------+-----------------+----------------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | procedure_trigger    | procedure_error | payload                                                    |
+-------------------------------+--------------+-----------------+----------------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table | Running         | {"type":"Submitted"} |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table | Done            | {"type":"Succeeded"} |                 | null                                                       |
+-------------------------------+--------------+-----------------+----------------------+-----------------+------------------------------------------------------------+
```

`Submitted` normally means `Running`; successful completion is `Done` with a
`Succeeded` trigger. The runner maps `Done` to `Succeeded` and calls the live
procedure's `event()` hook again. Thus a terminal event is regenerated, not a
copy of the submitted event. Recording remains asynchronous and best effort.

The JSON-null terminal `payload` in this `create_table` example also applies to
DDL/repartition events after a Procedure completes; it is not a rule for every event family.

## Procedure event triggers

Only applicable triggers are recorded, so query results might not include every
`type` and their order is not fixed:

| `type` | Meaning and fields |
| --- | --- |
| `Recovered` | The root procedure was recovered from persisted state. |
| `ChildSubmitted` | A child submission was attempted. The trigger includes the child `procedure_id` and its `outcome` (`Accepted`, `AlreadyAccepted`, `ManagerStopped`, or `SpawnFailed`). |
| `Retrying` | Procedure execution or rollback is being retried. The trigger includes the retry `phase` (`Execute` or `Rollback`) and `attempt`. |
| `RollingBack` | Procedure rollback is starting. |
| `Failed` | The procedure reached a failed terminal state. Inspect `procedure_error` for failure details. |
| `Poisoned` | The procedure cannot proceed. Inspect `procedure_error` for the failure details. |

## Family-specific terminal fields

Envelope fields (`procedure_id`, `procedure_state`, `procedure_trigger`, and
`procedure_error`) are common. Terminal family fields are type-specific and may
be recomputed or omitted by the event hook.

| Family | Typical terminal fields |
| --- | --- |
| DDL | Object locators; IDs may be added when the Done output carries them. |
| `repartition` | Parent table locator and procedure linkage; payload may be JSON `null`. |
| `repartition_group` | Parent/group IDs; per-target region fields may be SQL `NULL`. |
| `region_migration` | Region, node, and timeout fields. |
| `batch_gc` | Affected Region dimensions and `gc_report`; `payload` is JSON `null`. An empty report emits no `Done` event. |
| `wal_prune` | Topic, prune/latest offsets, and the prune payload. |

To inspect failures without creating one:

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error
FROM greptime_private.events
WHERE procedure_state IN ('Failed', 'Poisoned')
ORDER BY timestamp DESC
LIMIT 20;
```

For recent-event queries, see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md).
