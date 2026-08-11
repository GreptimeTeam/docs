---
keywords: [GreptimeDB events, event data model]
description: Understand the GreptimeDB events table data model.
---

# Event data model

`greptime_private.events` has the following common columns.

| Column          | Meaning                                                     |
| --------------- | ----------------------------------------------------------- |
| `type`          | Event type, such as `create_table` or `region_migration`.   |
| `timestamp`     | Time at which the row was recorded.                         |
| `payload`       | JSON data for the event type.                               |
| `event_context` | JSON describing why the event was triggered when available. |

## Procedure event columns

Procedure events also have the following columns:

| Column              | Meaning                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `procedure_id`      | Unique Procedure ID.                                                                                                                                        |
| `procedure_state`   | Procedure state when the event was recorded. Values are `Running`, `Done`, `Retrying`, `PrepareRollback`, `RollingBack`, `Failed`, and `Poisoned`.          |
| `procedure_trigger` | Procedure event trigger in JSON. Its `type` is `Submitted`, `Recovered`, `ChildSubmitted`, `Retrying`, `RollingBack`, `Succeeded`, `Failed`, or `Poisoned`. |
| `procedure_error`   | Error message when the Procedure fails.                                                                                                                     |

`Submitted` events normally have state `Running`. When a Procedure succeeds,
the completed event has state `Done` and trigger type `Succeeded`. The completed
row is generated from the Procedure's final state, so its fields can differ from
the submitted row. Events are recorded asynchronously; a recording failure does
not change the Procedure result.

When `event_context` is available, its stable `reason` value is one of
`manual`, `auto_create`, `auto_alter`, `auto_repartition`, `auto_rebalance`,
`region_failover`, `scheduled_gc`, or `unknown`. For example, a MySQL-submitted
event can contain `{"protocol":"mysql","reason":"manual"}`.

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

## Query JSON fields

See the [JSON functions](/reference/sql/functions/json.md) reference for
details. In event queries, `json_to_string` converts a JSON value to readable
text, `json_get_string` extracts a value by path, `json_path_match` evaluates a
JSON predicate, and `json_is_null` checks whether a value is the JSON `null`
value. Use `IS NULL` separately to check for SQL `NULL`.

For example, this query extracts fields from a `create_table` row that contains
`event_context`:

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

## Procedure event type-specific columns

The following columns are populated only by the listed event types. A `NULL`
value in one of these columns is normal when it does not apply.

- **Database, table, Flow, and view events:** `catalog_name`, `schema_name`,
  `table_name`, `table_id`, `physical_table_id`, `flow_name`, `flow_id`,
  `view_name`, and `view_id` identify the affected object. See [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md).
- **Region migration:** `region_id` and `region_number` identify the Region.
  `region_migration_trigger_reason`, `region_migration_src_node_id`,
  `region_migration_src_peer_addr`, `region_migration_dst_node_id`, and
  `region_migration_dst_peer_addr` describe why and where it moved.
- **Repartition:** `parent_procedure_id` links a child procedure to its parent;
  `repartition_group_id` identifies a group operation. `source_region_id`,
  `source_region_number`, `source_partition_expr`, `target_region_id`,
  `target_region_number`, and `target_partition_expr` describe the affected
  Regions and partition expressions.
- **Batch GC:** `region_id`, `region_number`, and `gc_report` describe the
  Regions processed and their GC result.
- **WAL pruning:** `topic_name`, `prunable_entry_id`, and `latest_offset`
  identify the topic, requested prune boundary, and exclusive latest offset.
