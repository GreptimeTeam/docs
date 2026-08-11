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
  AND timestamp >= now() - INTERVAL '1' hour
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

Use the returned ID to query the Procedure's event rows. Filtering by
`catalog_name`, `schema_name`, and `table_name` avoids selecting a procedure
for another object with a similar name.

## Query Procedure events

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

`Submitted` events normally have state `Running`. When a Procedure succeeds,
the completed event has state `Done` and trigger type `Succeeded`. The completed
row is generated from the Procedure's final state, so its fields can differ from
the submitted row.

The JSON-null terminal `payload` in this `create_table` example also applies to
DDL/repartition events after a Procedure completes; it is not a rule for every event type.

## Procedure event triggers

In addition to `Submitted` and `Succeeded`, a Procedure can emit the following
triggers when applicable. Not every Procedure emits every trigger, and rows are
not guaranteed to appear in the order shown:

| `type`           | Meaning and fields                                                                                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Recovered`      | The root procedure was recovered from persisted state.                                                                                                                 |
| `ChildSubmitted` | A child submission was attempted. The trigger includes the child `procedure_id` and its `outcome` (`Accepted`, `AlreadyAccepted`, `ManagerStopped`, or `SpawnFailed`). |
| `Retrying`       | Procedure execution or rollback is being retried. The trigger includes the retry `phase` (`Execute` or `Rollback`) and `attempt`.                                      |
| `RollingBack`    | Procedure rollback is starting.                                                                                                                                        |
| `Failed`         | The procedure reached a failed terminal state. Inspect `procedure_error` for failure details.                                                                          |
| `Poisoned`       | The procedure cannot proceed. Inspect `procedure_error` for the failure details.                                                                                       |

## Fields in completed events

`procedure_id`, `procedure_state`, `procedure_trigger`, and `procedure_error`
are common fields. Other fields in completed events depend on the event type.

| Event type          | Typical completed-event fields                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| DDL                 | Object names; IDs may be added when the Done output carries them.                                            |
| `repartition`       | Parent table locator and procedure linkage; payload may be JSON `null`.                                      |
| `repartition_group` | Parent/group IDs; per-target region fields may be SQL `NULL`.                                                |
| `region_migration`  | Region, node, and timeout fields.                                                                            |
| `batch_gc`          | Affected Region dimensions and `gc_report`; `payload` is JSON `null`. An empty report emits no `Done` event. |
| `wal_prune`         | Topic, prune/latest offsets, and the prune payload.                                                          |

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

For recent-event queries, see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md).
