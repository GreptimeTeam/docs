---
keywords: [distributed querying, dist planner, dist plan, logical plan, substrait format]
description: Describes the process of distributed querying in GreptimeDB, focusing on the dist planner and dist plan.
---

# Distributed Querying

Frontend and Datanode use the same DataFusion-based query engine. In distributed mode, Frontend adds a planning step that separates work performed by Datanodes from work completed by Frontend.

![Frontend query](/frontend-query.png)

## Dist Planner

The distributed planner rewrites the logical plan. It pushes compatible operators toward table scans and wraps remote subplans in `MergeScan` nodes. Partition predicates are also used to prune Regions before the remote work is scheduled.

Whether an operator can be pushed down depends on the plan shape and the operator's properties. Unsupported parts remain on Frontend. The original design and its commutativity rules are described in the [distributed planner RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-05-09-distributed-planner.md).

## Dist Plan

A remote input is a complete logical subplan, not just a table scan. Frontend serializes the subplan in [Substrait](https://substrait.io) format and sends a Region-specific request to the Datanode that owns the data. The Datanode plans and executes it locally, then streams the result back. Frontend merges the remote streams and executes any operators that were not pushed down.
