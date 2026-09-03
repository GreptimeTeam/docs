---
keywords: [Flownode, batching mode, streaming mode, dataflow, dirty time windows]
description: How Flownode selects and runs its batching and legacy streaming execution paths.
---

# Dataflow

Flownode has two internal execution paths:

- **Batching mode** is the primary path for aggregation and TQL workloads. It evaluates queries over persisted source data and writes materialized results to a sink table.
- **Streaming mode** is the legacy path retained for compatibility and deprecated for new workloads. It incrementally processes rows mirrored from Frontend as they arrive.

Users do not select the mode directly. When a Flow is created, GreptimeDB chooses the path from the query and source-table properties. Aggregation, `DISTINCT`, and TQL queries use batching mode. Simple non-aggregation queries, and any Flow whose source table has `ttl = 'instant'`, currently use streaming mode. A Flow deferred because its source table does not yet exist starts as a pending batching Flow.

## Batching mode

Batching mode reuses GreptimeDB's query engine instead of maintaining an operator graph for every incoming row. For a time-windowed Flow, its main loop is:

1. A source-table write marks the affected time windows as dirty.
2. A `BatchingTask` runs on its evaluation schedule or adaptive polling cadence and collects the pending dirty windows at that evaluation. Marking a window dirty does not wake the task.
3. The task adds time predicates for those windows to the Flow query and asks Frontend to execute it against the source tables.
4. The query result is inserted into the sink table, updating the materialized result for windows that were evaluated.
5. Successfully processed windows are removed from the dirty set. Failed work remains available for a later evaluation.

Flows with an evaluation interval but without a time-window expression run the complete query on each scheduled evaluation. This path also lets Flow use query-engine features that the streaming renderer does not implement. See [Flownode Batching Mode Developer Guide](./batching_mode.md) for the task and dirty-window components.

## Streaming mode

The `dataflow` module (see `flow::compute` module) is the core computing module of `flow`.
It takes a SQL query and transforms it into flow's internal execution plan.
This execution plan is then rendered into an actual dataflow, which is essentially a directed acyclic graph (DAG) of functions with input and output ports.
New row changes drive the graph incrementally.

The renderer supports map/filter/project and reduce operations. Join and union plan nodes exist, but their streaming renderers are not implemented.

Internally, the dataflow handles data in row format, using a tuple `(row, time, diff)`. Here, `row` represents the actual data being passed, which may contain multiple `Value` objects.
`time` is the system time which tracks the progress of the dataflow, and `diff` typically represents the insertion or deletion of the row (+1 or -1).
Therefore, the tuple represents the insert/delete operation of the `row` at a given system `time`. Stateful operators keep indexed traces of these changes in an [Arrangement](./arrangement.md).
