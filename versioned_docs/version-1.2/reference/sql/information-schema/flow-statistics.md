---
keywords: [flow statistics, flow runtime, uptime, state size, last execution time]
description: Provides runtime statistics for flows, including start time, last execution time, uptime, and state size.
---

# FLOW_STATISTICS

The `FLOW_STATISTICS` table provides runtime statistics for flows. It lists every flow in the
current catalog, including flows that have not reported statistics yet.

```sql
DESC TABLE INFORMATION_SCHEMA.FLOW_STATISTICS;
```

```sql
+---------------------+----------------------+------+------+---------+---------------+
| Column              | Type                 | Key  | Null | Default | Semantic Type |
+---------------------+----------------------+------+------+---------+---------------+
| flow_id             | UInt32               |      | NO   |         | FIELD         |
| flow_name           | String               |      | NO   |         | FIELD         |
| start_time          | TimestampMillisecond |      | YES  |         | FIELD         |
| last_execution_time | TimestampMillisecond |      | YES  |         | FIELD         |
| uptime_seconds      | Int64                |      | YES  |         | FIELD         |
| state_size          | UInt64               |      | YES  |         | FIELD         |
+---------------------+----------------------+------+------+---------+---------------+
```

Fields in the `FLOW_STATISTICS` table are described as follows:

- `flow_id`: The ID of the flow.
- `flow_name`: The name of the flow.
- `start_time`: Timestamp indicating when the Flownode started running the flow.
- `last_execution_time`: Timestamp of the flow's most recent execution.
- `uptime_seconds`: Seconds elapsed since `start_time`.
- `state_size`: Size of the flow's in-memory state, in bytes.

Statistics are reported by Flownodes through heartbeats. The last four columns are `NULL` for a
flow that has no statistics reported yet, for example immediately after the flow is created or
after a Flownode restart.

In a cluster, `start_time` and `uptime_seconds` are always `NULL`: the Flownode state persisted
for the cluster does not carry a flow's start time. Both columns are populated in standalone
deployments.

[`SHOW FLOW STATUS`](/reference/sql/show.md#show-flow-status) returns the same columns.
