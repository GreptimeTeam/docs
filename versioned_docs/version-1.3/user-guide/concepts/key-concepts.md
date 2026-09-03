---
keywords: [key concepts, database, table, time index, primary key, table engine, logical table, physical table, Region, index, Pipeline, Flow]
description: Defines GreptimeDB databases, tables, time indexes, primary keys, table engines, Regions, data types, indexes, Pipeline, views, and Flow.
---

# Key Concepts

## Database

A database is a namespace for tables and other objects. It groups data for management and access, but is not by itself a complete tenant-isolation boundary.

## Time-Series Table

A GreptimeDB table follows a relational schema and has exactly one time index. Columns use Tag, Timestamp, and Field semantics. Time-series tables are a natural fit for metrics and IoT workloads, while logs, traces, and event data use the same table model with schemas and options suited to those signals.

Tables can be created with SQL or automatically from supported ingestion protocols. In distributed deployments, a table can be partitioned into Regions placed on different Datanodes. See [Data Model](./data-model.md).

## Time Index and Primary Key

Every GreptimeDB table has exactly one time index. It records sample or event time and lets the storage engine organize and prune data by time.

Primary-key columns use Tag semantics and identify a series or record group. In tables that use deduplication, the primary key and time index identify rows that are merged according to the table's [`merge_mode`](/reference/sql/create.md#create-a-table-with-merge-mode). This is not a general relational uniqueness constraint: append-only tables can omit the primary key, and append-only mode keeps repeated keys and timestamps as separate rows.

## Table Engine

A table engine controls how table data is written, organized, compacted, and read. The main engines are:

- **Mito Engine**: The general-purpose engine for time-indexed tables, including logs, traces, and event data.
- **Metric Engine**: Built on Mito Engine and optimized for large numbers of Prometheus-style metric tables. User-facing metric tables remain logical tables and can share physical tables and metadata internally.

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

## Pipeline

Pipeline processes data during ingestion. It can parse, transform, enrich, and route incoming records before storing them in tables. See [Pipeline](/user-guide/logs/use-custom-pipelines.md).

## Flow

A Flow is a continuous computation over incoming rows after they reach source tables. It updates and materializes its result in a sink table, which can be queried and managed like other tables. See [Flow Computation](/user-guide/flow-computation/overview.md).
