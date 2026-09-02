---
keywords: [query engine, Apache DataFusion, logical plan, physical plan, data representation, indexing]
description: Overview of GreptimeDB's query engine, its architecture, data representation, indexing, and extensibility.
---

# Query Engine

## Introduction

GreptimeDB's query engine is built on [Apache DataFusion][1]. DataFusion supplies the logical and physical plan interfaces, optimizer framework, and execution runtime. GreptimeDB adds planners for its query languages, storage-aware optimizer rules, custom plan nodes, and distributed execution.

DDL and other control-plane operations are dispatched by the statement executor. The query engine receives plans for data processing, including the input side of operations such as `INSERT ... SELECT`.

## Query Lifecycle

1. The SQL, PromQL, or log-query planner resolves tables through the catalog and produces a DataFusion logical plan. GreptimeDB plan extensions represent operations that DataFusion does not provide directly.
2. DataFusion analyzer and optimizer rules run together with GreptimeDB rules. These rules normalize expressions and types, rewrite time-range operations, push projections and filters toward scans, and introduce distributed plan nodes when required.
3. The physical planner converts the optimized logical plan into streaming operators. GreptimeDB then applies physical rules for scan parallelism, ordering, and distributed execution.
4. Execution pulls Arrow record batches through the physical plan. Storage scans receive the projection and predicates, and downstream operators consume the resulting stream without materializing the complete result first.

Use [`EXPLAIN`](/reference/sql/explain.md) to inspect the logical and physical plans. `EXPLAIN ANALYZE` also executes the plan and reports runtime metrics.

## Data Representation

GreptimeDB uses [Apache Arrow][2] record batches as its in-memory data representation. A record batch contains equal-length column arrays and a schema. Query operators exchange streams of these batches, which keeps the execution path columnar from Region scans through result encoding.

## Indexing

Index construction and persistent index formats belong to the storage engine. The query layer supplies predicates and projections to a scan; Mito then uses time ranges, Parquet statistics, and indexes to avoid reading data that cannot match. See [Data Persistence and Indexing](./data-persistence-indexing.md).

## Distributed Execution

In distributed mode, the Frontend plans the cluster-wide query and Datanodes execute Region-local subplans. [`MergeScan`](../frontend/distributed-querying.md) is the boundary between those stages.

[1]: https://datafusion.apache.org/
[2]: https://arrow.apache.org/
