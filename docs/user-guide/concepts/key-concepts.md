---
keywords: [key concepts, database, table, time index, table engine, Region, index, view, Flow]
description: Defines GreptimeDB databases, tables, time index, table engines, Regions, data types, indexes, views, and Flow.
---

# Key Concepts

## Database

A database is a namespace for tables and other objects. It groups data for management and access, but is not by itself a complete tenant-isolation boundary.

## Time-Series Table

A GreptimeDB table follows a relational schema and has exactly one time index. Columns use Tag, Timestamp, and Field semantics. Time-series tables are a natural fit for metrics and IoT workloads, while logs, traces, and event data use the same table model with schemas and options suited to those signals.

Tables can be created with SQL or automatically from supported ingestion protocols. In distributed deployments, a table can be partitioned into Regions placed on different Datanodes. See [Data Model](./data-model.md).

## Table Engine

A table engine controls how table data is written, organized, compacted, and read. The main engines are:

- **Mito Engine**: The general-purpose engine for time-indexed tables, including logs, traces, and event data.
- **Metric Engine**: Built on Mito Engine and optimized for large numbers of Prometheus-style metric tables by sharing physical storage and metadata.

Table engines are separate from storage providers such as local files, Amazon S3, or Google Cloud Storage. See [Table Engines](/reference/about-greptimedb-engines.md) and [Storage Location](./storage-location.md).

<AnchorAlias id="table-region" />

## Region

A Region is a physical partition of a table and the basic unit of storage, scheduling, and migration. A Region is hosted by a Datanode, while Metasrv maintains its route and placement metadata. Clients normally access tables through Frontend without addressing Regions directly.

## Data Types

GreptimeDB columns are strongly typed. Automatic schema generation can create tables and add compatible columns, but values written to an existing column must match or be cast to its data type. See [Data Types](/reference/sql/data-types.md).

## Index

An index is an optional data structure used to accelerate selected query patterns. GreptimeDB provides inverted, full-text, and skipping indexes with different selectivity, storage, and write-cost trade-offs. See [Data Indexes](/user-guide/manage-data/data-index.md).

## View

A view is a named SQL query presented as a virtual table. It stores the query definition, not a materialized copy of its result; querying the view reads the underlying tables.

## Flow

A Flow is a continuous computation over source-table changes. It updates and materializes its result in a sink table, which can be queried and managed like other tables. See [Flow Computation](/user-guide/flow-computation/overview.md).
