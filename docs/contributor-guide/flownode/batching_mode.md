---
keywords: [batching mode, BatchingEngine, dirty time windows, checkpoints, continuous aggregation]
description: Batching mode task lifecycle, dirty-window processing, and recovery invariants.
---

# Flownode Batching Mode Developer Guide

Batching mode maintains a sink table by rerunning a Flow query for source data that may have changed. It is the actively developed Flownode execution path. Mode selection remains internal; see the [Flownode overview](./overview.md).

## Overview

For a time-windowed Flow, writes to a source table mark the corresponding windows as dirty. A background task consumes those windows, adds time predicates to the Flow query when the query shape permits it, and sends an insert plan to Frontend. Frontend executes the query and writes the result to the sink table.

Evaluation-interval and TQL flows can require an unfiltered execution rather than a dirty-window filter. The batching path therefore treats a dirty window either as an exact range to recompute or as a signal that a full query is required, depending on the Flow definition.

## Architecture

### `BatchingEngine`

`BatchingEngine` in `src/flow/src/batching_mode/engine.rs` owns the map from `FlowId` to `BatchingTask`. It creates and removes tasks, handles flush requests, and dispatches dirty-window notifications to every Flow that reads the affected source table.

Task creation parses the Flow query, records source and sink tables, creates the sink table when needed, and initializes the execution state. Metadata for the Flow itself is persisted by `common-meta`.

### `BatchingTask`

One `BatchingTask` represents one Flow. `TaskConfig` contains immutable query, table, window, expiration, and scheduling data. `TaskState` contains the mutable execution state.

The background loop waits for its schedule or a notification, generates the next insert plan, executes it through `FrontendClient`, and records the result. An execution lock serializes background execution, manual flush, plan generation, and checkpoint updates so two runs cannot consume the same state concurrently.

### `TaskState` and `DirtyTimeWindows`

`DirtyTimeWindows` stores non-overlapping ranges that need recomputation. Plan generation removes a bounded set of ranges from the queue. If planning or execution fails, those ranges are restored; they are not discarded merely because a run started.

`TaskState` also stores per-Region checkpoints for the experimental incremental-read path. Incremental mode advances a checkpoint only when the result reports a complete watermark proof for the participating Regions. A scoped full-snapshot repair freezes a high watermark while it drains dirty windows; new writes stay in the live queue. If the repair fails or its watermark proof is incomplete, pending windows return to the queue.

Incremental reads are disabled by default through `experimental_enable_incremental_read`. When disabled or when the query shape is incompatible, the task uses full-snapshot execution.

### `TimeWindowExpr`

`TimeWindowExpr` in `src/flow/src/batching_mode/time_window.rs` evaluates window expressions such as `date_bin`. It maps an input timestamp to its window bounds and provides the window size used to merge ranges and generate predicates.

## Query Execution Flow

1. A source write or explicit mark-dirty request identifies the affected Flow and time range.
2. `BatchingEngine` adds the range to the task's `DirtyTimeWindows` and wakes the task when required.
3. `BatchingTask` consumes a bounded group of windows and builds a filtered insert plan, or chooses an unfiltered full query for a Flow that cannot be scoped safely.
4. `FrontendClient` sends the serialized logical plan to Frontend. Frontend executes the query and writes rows to the sink table.
5. On success, the task commits the execution state and advances only checkpoints justified by returned watermarks. On failure, it restores consumed windows before the next retry.

Changes to plan coverage, checkpoint advancement, or dirty-window restoration affect correctness. A run must never clear work that has not been reflected in the sink table, and a checkpoint must never move beyond data proven to be included in the result.
