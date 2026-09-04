---
keywords: [flows, flow task, flow definition, source table IDs, sink table name]
description: Provides the flow task information, including flow name, ID, definition, source table IDs, sink table name, and other details.
---

# FLOWS
The `Flows` table provides the flow task information.

```sql
DESC TABLE INFORMATION_SCHEMA.FLOWS;
```

```sql
      Column      |  Type  | Key | Null | Default | Semantic Type 
------------------+--------+-----+------+---------+---------------
 flow_name        | String |     | NO   |         | FIELD
 flow_id          | UInt32 |     | NO   |         | FIELD
 table_catalog    | String |     | NO   |         | FIELD
 flow_definition  | String |     | NO   |         | FIELD
 comment          | String |     | YES  |         | FIELD
 expire_after     | Int64  |     | YES  |         | FIELD
 source_table_ids | String |     | YES  |         | FIELD
 sink_table_name  | String |     | NO   |         | FIELD
 flownode_ids     | String |     | YES  |         | FIELD
 options          | String |     | YES  |         | FIELD
(10 rows)
```

The columns in table:

* `flow_name`: the flow task's name.
* `flow_id`: the flow task's id.
* `table_catalog`: the catalog this flow belongs to, named as `table_catalog` to keep consistent with the `INFORMATION_SCHEMA` standard.
* `flow_definition`: the flow task's definition. It's the SQL statement used to create the flow task.
* `comment`: the comment of the flow task.
* `expire_after`: the retention duration of the flow task, in seconds.
* `source_table_ids`: the source table ids of the flow task.
* `sink_table_name`: the sink table name of the flow task.
* `flownode_ids`: the flownode ids used by the flow task.
* `options`: extra options of the flow task.
## Flow runtime statistics

The `information_schema.flow_statistics` table provides runtime statistics for
Flow tasks. `SHOW FLOW STATUS` is a convenient equivalent view and supports an
optional `LIKE` filter on `flow_name`.

```sql
DESC TABLE INFORMATION_SCHEMA.FLOW_STATISTICS;
```

```text
+---------------------+----------------------+-----+------+---------+---------------+
| Column              | Type                 | Key | Null | Default | Semantic Type |
+---------------------+----------------------+-----+------+---------+---------------+
| flow_id             | UInt32               |     | NO   |         | FIELD         |
| flow_name           | String               |     | NO   |         | FIELD         |
| start_time          | TimestampMillisecond |     | YES  |         | FIELD         |
| last_execution_time | TimestampMillisecond |     | YES  |         | FIELD         |
| uptime_seconds      | Int64                |     | YES  |         | FIELD         |
| state_size          | UInt64               |     | YES  |         | FIELD         |
+---------------------+----------------------+-----+------+---------+---------------+
6 rows in set (0.00 sec)
```

The columns are:

- `flow_id`: The unique ID of the Flow task.
- `flow_name`: The name of the Flow task.
- `start_time`: The time when the Flow first executed.
- `last_execution_time`: The time of the last execution.
- `uptime_seconds`: The elapsed time since `start_time`, in seconds.
- `state_size`: The in-memory state size, in bytes, as a proxy for memory usage.

```sql
SHOW FLOW STATUS;
SHOW FLOW STATUS LIKE 'orders%';
```

In standalone mode, all six columns are populated when their corresponding
runtime data is available. In distributed mode, `start_time` and
`uptime_seconds` are not available in v1.2 because the cross-node FlowStat
heartbeat does not carry start-time information; these columns return SQL
`NULL`.
