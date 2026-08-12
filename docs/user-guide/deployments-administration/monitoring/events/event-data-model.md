---
keywords: [GreptimeDB events, event data model]
description: Understand the GreptimeDB events table data model.
---

# Event data model

`greptime_private.events` has the following common columns. Event-specific
columns are SQL `NULL` when the event type does not populate them.

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
| `procedure_error`   | Debug-formatted error when the Procedure fails; an empty string otherwise.                                                                                  |

Rows with trigger type `Submitted` normally have state `Running`. When a Procedure
succeeds, the completed event has state `Done` and trigger type `Succeeded`. The completed
row is generated from the Procedure's final state, so its fields can differ from
the submitted row. Events are recorded asynchronously; a recording failure does
not change the Procedure result.

`event_context` is written only on `Submitted` rows. When it is available, its
stable `reason` value is one of
`manual`, `auto_create`, `auto_alter`, `auto_repartition`, `auto_rebalance`,
`region_failover`, `scheduled_gc`, or `unknown`. For example, a MySQL-submitted
event can contain `{"protocol":"mysql","reason":"manual"}`.

In addition to `Submitted` and `Succeeded`, a Procedure can emit the following
trigger types when applicable. Not every Procedure emits every trigger type, and rows are
not guaranteed to appear in the order shown:

| `type`           | Meaning and fields                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Recovered`      | The root Procedure was recovered from persisted state.                                                                                                                                   |
| `ChildSubmitted` | A child Procedure submission was attempted. `procedure_trigger` includes the child `procedure_id` and its `outcome` (`Accepted`, `AlreadyAccepted`, `ManagerStopped`, or `SpawnFailed`). |
| `Retrying`       | Procedure execution or rollback is being retried. `procedure_trigger` includes the retry `phase` (`Execute` or `Rollback`) and `attempt`.                                                |
| `RollingBack`    | Procedure rollback is starting.                                                                                                                                                          |
| `Failed`         | The Procedure reached a failed terminal state. Inspect `procedure_error` for failure details.                                                                                            |
| `Poisoned`       | The Procedure cannot proceed. Inspect `procedure_error` for the failure details.                                                                                                         |

For focused examples, see [Query events](/user-guide/deployments-administration/monitoring/events/query-events.md),
[DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md),
[Region events](/user-guide/deployments-administration/monitoring/events/region-events.md), and
[Maintenance events](/user-guide/deployments-administration/monitoring/events/maintenance-events.md).

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

## Event type-specific columns

The following columns are populated only by the listed event types. An SQL `NULL`
value in one of these columns is normal when it does not apply to a row.

- **Database events** (`create_database`, `alter_database`, `drop_database`):
  `catalog_name` and `schema_name` identify the affected database.
- **Table events** (`create_table`, `create_logical_tables`, `alter_table`,
  `alter_logical_tables`, `drop_table`, `undrop_table`, `purge_dropped_table`,
  `truncate_table`): `catalog_name`, `schema_name`, `table_name`, and the
  applicable table ID columns identify the affected table. `physical_table_id`
  applies only to `create_logical_tables` and `alter_logical_tables`.
- **Flow events** (`create_flow`, `drop_flow`): `catalog_name` and `flow_name`
  identify the Flow; `schema_name` is SQL `NULL`.
- **View events** (`create_view`, `drop_view`): `catalog_name`, `schema_name`,
  `view_name`, and `view_id` identify the affected view. See [DDL events](/user-guide/deployments-administration/monitoring/events/ddl-events.md).
- **Region migration** (`region_migration`): `region_id`, `table_id`, and
  `region_number` identify the Region.
  `region_migration_trigger_reason`, `region_migration_src_node_id`,
  `region_migration_src_peer_addr`, `region_migration_dst_node_id`, and
  `region_migration_dst_peer_addr` describe why and where it moved.
- **Repartition** (`repartition`, `repartition_group`): `catalog_name`,
  `schema_name`, `table_name`, and `table_id` identify the affected table. On a
  `repartition_group` `Submitted` row, `parent_procedure_id`,
  `repartition_group_id`, `source_region_id`, `source_region_number`,
  `source_partition_expr`, `target_region_id`, `target_region_number`, and
  `target_partition_expr` describe the parent, group, and Region topology.
  These fields are SQL `NULL` on later lifecycle rows.
- **Batch GC** (`batch_gc`): `region_id`, `table_id`, `region_number`, and
  `gc_report` describe a recorded Region cleanup result.
- **WAL pruning** (`wal_prune`): `topic_name`, `prunable_entry_id`, and
  `latest_offset` identify the topic, requested prune boundary, and exclusive
  latest offset.
