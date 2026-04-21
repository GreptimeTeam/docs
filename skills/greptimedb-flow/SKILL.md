---
name: greptimedb-flow
description: Guide for creating GreptimeDB flow tasks — continuous aggregation that updates a sink table on the fly as data is ingested. Use when the user asks to build a materialized view, continuous aggregation, stream computation, downsampling job, or rollup. Triggers on phrases like "create flow", "continuous aggregation", "连续聚合", "物化视图", "materialized view", "downsampling", "流式聚合", "time window aggregation".
---

# GreptimeDB Flow Guide

Create GreptimeDB flow definition to do time window based aggregation on the fly
while data ingested into GreptimeDB. This is how GreptimeDB's lightweight
streaming engine works.

Flow is also known as:

1. Stream computing
2. Materialized View
3. Continuous aggregation

## The workflow

To create GreptimeDB flow task, we should follow these phases:

### Phase 1. Learn and understand GreptimeDB Flow

First, we read GreptimeDB flow definitions and how it works from the
documentation.

There are doc pages available, use WebFetch to load and understand them:

1. Overview and quick example:
   https://docs.greptime.com/user-guide/flow-computation/overview/
2. Examples for continuous aggregation:
   https://docs.greptime.com/user-guide/flow-computation/continuous-aggregation/
3. SQL DDL for flow, sink table and related concepts:
   https://docs.greptime.com/user-guide/flow-computation/manage-flow/

### Phase 2. Create flow tasks

We should try to understand:

1. time window the user wants to use
2. aggregation fields and group-by rules

Create the flow and sink table DDL.

**Strongly recommend providing an explicit `CREATE TABLE` for the sink
table** alongside `CREATE FLOW`. Flow will auto-create the sink table if it
does not exist, but manual creation keeps full control over:

- **Column order and type** — must line up with the SELECT in the flow query.
- **Time index** — `TIME INDEX` is typically the column produced by the time
  window function (e.g. `date_bin(...) AS time_window`).
- **`update_at` column** — the Flow engine automatically appends the update
  time to the end of each computation result row. The sink table schema must
  include an `update_at` column.
- **Primary key / tags** — use `PRIMARY KEY` to declare tag columns; together
  with the time index they form the unique key the Flow engine uses to
  insert or update rows.

Minimal example:

```sql
CREATE TABLE temp_alerts (
  sensor_id INT,
  loc       STRING,
  max_temp  DOUBLE,
  time_window TIMESTAMP TIME INDEX,
  update_at TIMESTAMP,
  PRIMARY KEY(sensor_id, loc)
);

CREATE FLOW temp_monitoring
SINK TO temp_alerts
AS
SELECT
  sensor_id,
  loc,
  max(temperature)                           AS max_temp,
  date_bin('10 seconds'::INTERVAL, ts)       AS time_window
FROM temp_sensor_data
GROUP BY sensor_id, loc, time_window
HAVING max_temp > 100;
```

Use `CREATE OR REPLACE FLOW` to update an existing flow (only the flow
definition is replaced; source and sink tables are untouched). Use
`CREATE FLOW IF NOT EXISTS` for idempotent creation. The two clauses
cannot be combined — pick one based on intent.

### Phase 3. Limit recomputation window with `EXPIRE AFTER`

For any stateful aggregation (GROUP BY, windowed aggregates), decide how far
back in time the flow engine should still update results when new data
arrives.

```sql
CREATE FLOW IF NOT EXISTS my_flow
SINK TO my_sink_table
EXPIRE AFTER '1 hour'::INTERVAL
AS
SELECT ...;
```

`EXPIRE AFTER` is a boundary: rows whose time index is older than the given
interval are considered out of scope — the time windows they fall into are
no longer updated even if late data arrives. It is a performance knob that
keeps the flow running without putting too much pressure on the frontend,
not an in-memory state limiter.

Important caveats:

- It does **not** delete data from the source or the sink table. Use the
  table `TTL` option if you also want physical data expiration.
- Without `EXPIRE AFTER`, every historical row remains eligible for
  recomputation whenever new data arrives; for high-volume source tables
  this creates significant load on the frontend.
- Set it to a window comfortably larger than the largest time window used in
  the query, plus any tolerable lateness.

### Phase 4. Verify the tasks

If greptimedb-mcp-server is available, we can use its `execute_sql` tools to
execute the DDL. Try to generate some sample data, insert into source table,
then verify the sink table via SQL SELECT statements. We can use MySQL style
SELECT statements on GreptimeDB for most cases.

## Reference

1. Aggregation functions of Flow:
   https://docs.greptime.com/user-guide/flow-computation/expressions/
2. A full list of aggregation functions:
   https://docs.greptime.com/reference/sql/functions/df-functions/#aggregate-functions
