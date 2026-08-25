---
keywords: [legacy streaming mode, dataflow, DFIR, differential rows, Flow]
description: Internal compute graph used by Flownode's legacy streaming execution path.
---

# Dataflow

This page describes the compute graph used by Flownode's legacy streaming mode. New continuous-aggregation work uses [batching mode](./batching_mode.md); do not use this page to infer batching behavior.

The streaming path converts a Flow definition through `src/flow/src/transform.rs` into a typed plan in `plan.rs`. `src/flow/src/compute/render.rs` renders supported plan nodes into a DFIR-style dataflow graph, and workers under `src/flow/src/adapter/` own and execute those graphs.

The internal record is a differential row `(row, timestamp, diff)`. `row` contains the values, `timestamp` tracks dataflow progress, and `diff` records multiplicity changes such as insertion (`+1`) and deletion (`-1`). Operators propagate those changes so aggregates and sink output can be updated incrementally.

The typed plan represents map/filter/project and reduce operations, along with join and union nodes. The streaming renderer currently executes map/filter/project and reduce; join and union rendering still return a not-implemented error. Check both `plan.rs` and `compute/render.rs` before adding an operator, because being representable in a plan does not mean it is executable.
