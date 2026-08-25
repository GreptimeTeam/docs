---
keywords: [greptimedb engine, Mito engine, Metric engine, File engine, Table engine]
description: Overview of all the table engines in GreptimeDB.
---

# GreptimeDB Table Engines

## Overview

GreptimeDB provides three table engines with different storage models: Mito, Metric, and File.

### Mito Engine

Mito is the default table engine for `CREATE TABLE` and is optimized for time-series workloads. It uses an [LSM-tree][1] design with a write-ahead log (WAL), memtables, immutable SST files, and time-window compaction. This design supports high-throughput writes while maintaining query performance.

Mito can store SST files on local storage, S3, GCS, or Azure Blob Storage without additional storage plugins. When SST files are stored remotely, Mito can use a tiered local cache to reduce object-storage access latency and cost.

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree

### Metric Engine

The Metric Engine is optimized for metrics workloads that create many small logical tables with similar columns, including monitoring deployments with thousands of Prometheus metric tables.

Multiple logical tables share wide physical tables, which lets the engine reuse columns and metadata instead of creating separate physical storage for every logical table. This reduces storage and metadata overhead, improves columnar compression, and improves query efficiency for metrics workloads. The physical tables are stored by Mito.

### File Engine

The File Engine backs tables created with `CREATE EXTERNAL TABLE`. It reads CSV, JSON, Parquet, and ORC files from local or object storage without importing or converting the data. File Engine tables are read-only and use GreptimeDB's query engine when processing external files.

## Engine Selection Guide

### When to Use Each Engine

- **Mito Engine**: Use Mito for most time-series workloads that need durable storage and a balance of write throughput, query performance, and storage efficiency. It is the default when `CREATE TABLE` omits the `ENGINE` clause.

- **Metric Engine**: Use Metric when a metrics workload contains many logical tables with similar columns. Sharing physical storage reduces storage overhead and improves compression and query performance.

- **File Engine**: Use File to explore or query supported external files without importing them into a regular table. It is suitable for one-time analysis and for files produced by existing data pipelines.

### Specifying Engine Type in SQL

For a regular table, use the `ENGINE` clause of [`CREATE TABLE`](/reference/sql/create.md#create-table) to select Mito or Metric. [`CREATE EXTERNAL TABLE`](/reference/sql/create.md#create-external-table) uses the File Engine and takes the file location and format in its `WITH` clause.
