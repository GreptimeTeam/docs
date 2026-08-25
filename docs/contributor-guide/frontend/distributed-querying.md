---
keywords: [distributed querying, DistPlannerAnalyzer, MergeScan, Substrait, Region pruning]
description: How GreptimeDB turns a logical query plan into local and remote execution stages.
---

# Distributed Querying

Frontend and Datanode use the same DataFusion-based query engine. In distributed mode, Frontend adds a planning step that separates work executed on Datanodes from work completed by Frontend.

![Frontend query](/frontend-query.png)

## Dist Planner

`DistPlannerAnalyzer` in `src/query/src/dist_plan/analyzer.rs` rewrites the DataFusion logical plan. It pushes compatible operators toward table scans and wraps remote subplans in `MergeScan` nodes. The planner uses operator commutativity and plan-shape rules to decide which work is safe to execute on each Datanode; unsupported shapes remain on Frontend or use the configured fallback path.

Filters on partition columns are also used to prune Regions. Frontend resolves each selected Region to a Datanode through `FrontendRegionQueryHandler` before execution.

The original design and its commutativity rules are documented in the [distributed planner RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-05-09-distributed-planner.md).

## Dist Plan

A `MergeScan` remote input is a complete logical subplan. Frontend serializes that subplan with Substrait and sends a Region-specific query request to the selected Datanode. The Datanode plans and executes the subplan against its local Regions and streams Arrow record batches back.

Frontend merges the remote streams and executes any operators that could not be pushed down. This boundary is not limited to the logical `TableScan` node: filters, projections, partial aggregates, and other compatible operators may be part of a remote subplan.
