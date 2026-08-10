---
keywords: [GreptimeDB events, procedure lifecycle]
description: Inspect procedure lifecycle events in GreptimeDB.
---

# Procedure lifecycle

Procedure events share a `procedure_id`. Use that ID to follow one procedure
without relying on object names or event timing. For the event columns and JSON
fields, see [Event data model](/user-guide/deployments-administration/monitoring/events/event-data-model.md).

## Get a procedure ID

Select the `Submitted` row for the operation you want to inspect. For example:

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_life_20260810'
  AND table_name = 'lifecycle_probe'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

```text
+--------------------------------------+
| procedure_id                         |
+--------------------------------------+
| a5788f51-5726-4db7-a85e-e9afc36da557 |
+--------------------------------------+
```

Replace the database, object, and event type with the operation you are
investigating. The returned UUID is the value to use in the following queries.

## Query one procedure

The reusable, full-row query is useful when you need every sparse locator or
operational column:

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp ASC;
```

For routine monitoring, prefer this smaller projection:

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp;
```

Captured output:

```text
+-------------------------------+--------------+----------------------+----------------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state      | procedure_trigger    | procedure_error | payload                                                    |
+-------------------------------+--------------+----------------------+----------------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table  | Running              | {"type":"Submitted"} |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table  | Done                 | {"type":"Succeeded"} |                 | null                                                       |
+-------------------------------+--------------+----------------------+----------------------+-----------------+------------------------------------------------------------+
```

`Submitted` is the initial lifecycle trigger, and its procedure state is
`Running`. A successful terminal event has `procedure_state = 'Done'` and a
`Succeeded` trigger. The initial row commonly carries the operation's payload
and context; the terminal payload is JSON `null`, not SQL `NULL`.

## Interpret other lifecycle triggers

The runtime can record these triggers as applicable:

| Trigger | Meaning |
| --- | --- |
| `Recovered` | A root procedure was recovered from persisted state. |
| `ChildSubmitted` | A child submission was attempted; the JSON includes the child ID and outcome. |
| `Retrying` | Execution or rollback is being retried; the JSON includes its phase and attempt. |
| `RollingBack` | Rollback is starting after a failure. |
| `Failed` | The procedure reached a failed terminal state. Inspect `procedure_error`. |
| `Poisoned` | The procedure cannot proceed because it was poisoned. Inspect `procedure_error`. |

These are framework lifecycle possibilities, not a required sequence. A
procedure does not necessarily emit every trigger or every intermediate state.
`Retrying` and `RollingBack` can carry an error in `procedure_error`.

## Inspect failures without creating one

This read-only query finds failed or poisoned procedures in a database:

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       procedure_error
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_life_20260810'
  AND procedure_state IN ('Failed', 'Poisoned')
ORDER BY timestamp;
```

The dedicated runtime database used for this example had no failure rows, so no
failed or poisoned output is shown. The query is source-validated; do not infer
failure output from the successful example or manufacture a failure to test it.

For general event filters and polling guidance, see
[Query events](/user-guide/deployments-administration/monitoring/events/query-events.md).
