---
keywords: [dataflow module, SQL query transformation, execution plan, DAG, map and reduce operations]
description: Explanation of the dataflow module in Flownode, its operations, internal data handling, and future enhancements.
---

# Dataflow

The `dataflow` module (see `flow::compute` module) is the core computing module of `flow`.
It takes a SQL query and transforms it into flow's internal execution plan.
This execution plan is then rendered into an actual dataflow, which is essentially a directed acyclic graph (DAG) of functions with input and output ports.
The dataflow is triggered to run when needed.

Currently, this dataflow only supports `map` and `reduce` operations. Support for `join` operations will be added in the future.

Internally, the dataflow handles data in row format, using a tuple `(row, time, diff)`. Here, `row` represents the actual data being passed, which may contain multiple `Value` objects.
`time` is the system time which tracks the progress of the dataflow, and `diff` typically represents the insertion or deletion of the row (+1 or -1).
Therefore, the tuple represents the insert/delete operation of the `row` at a given system `time`.