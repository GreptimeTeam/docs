---
keywords: [query engine, Apache DataFusion, logical plan, physical plan, Arrow, indexes]
description: Overview of GreptimeDB's DataFusion-based query planning and execution pipeline.
---

# Query Engine

## Introduction

GreptimeDB's query engine is built on [Apache DataFusion][1]. The `query` crate owns SQL, PromQL, and log planning, GreptimeDB optimizer rules, physical planning, and execution.

![Execution Procedure](/execution-procedure.png)

A query first becomes a DataFusion logical plan. SQL and other query-language planners produce these plans, and Frontend also sends serialized logical subplans to Datanodes during distributed execution.

Analyzer and optimizer rules normalize the plan, push filters and projections, prune Regions, and introduce GreptimeDB extension nodes such as `MergeScan`. Both DataFusion rules and rules under `src/query/src/optimizer/` participate in this phase.

The physical planner converts the optimized logical plan into DataFusion `ExecutionPlan` implementations. Executing the root plan returns an asynchronous stream of Arrow `RecordBatch` values. Use `EXPLAIN` or `EXPLAIN VERBOSE` to inspect the plans produced for a SQL statement.

## Data Representation

GreptimeDB uses [Apache Arrow][2] arrays and `RecordBatch` values for in-memory data exchange. The columnar representation is shared by storage scans, query operators, RPC streams, and result encoders, avoiding row-by-row conversion inside the execution pipeline.

## Indexing

Index construction and persistent index formats belong to the storage engine, not the query engine. Mito uses Parquet statistics and inverted, skipping, and full-text indexes to prune SST files, row groups, and data segments. A feature-gated vector index supplies candidate rows for vector search. See [Data Persistence and Indexing](./data-persistence-indexing.md).

The query layer contributes predicates and projections to the scan. An index can reduce the data read by a compatible predicate, but it does not replace the remaining filter operators in the query plan.

## Distributed Execution

Frontend rewrites compatible logical-plan fragments into remote `MergeScan` inputs, serializes them with Substrait, and sends Region-specific requests to Datanodes. See [Distributed Querying](../frontend/distributed-querying.md).

[1]: https://datafusion.apache.org/
[2]: https://arrow.apache.org/
