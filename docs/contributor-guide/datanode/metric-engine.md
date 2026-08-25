---
keywords: [Metric engine, small tables, logical table, physical table, storage optimization]
description: Overview of the Metric engine in GreptimeDB, its concepts, architecture, and design for handling small tables.
---

# Metric Engine

## Overview

The `Metric` engine is a component of GreptimeDB, and it's an implementation of the storage engine. It mainly targets scenarios with a large number of small tables for observable metrics.

Its main feature is to use synthetic physical wide tables to store a large amount of small table data, achieving effects such as reuse of the same column and metadata. This reduces storage overhead for small tables and improves columnar compression efficiency. The concept of a table becomes even more lightweight under the `Metric` engine.

## Concepts

The `Metric` engine introduces two new concepts: "logical table" and "physical table". From the user's perspective, logical tables are exactly like ordinary ones. From a storage point-of-view, physical Regions are just regular Regions.

### Logical Table

A logical table refers to user-defined tables. Just like any other ordinary table, its definition includes the name of the table, column definitions, index definitions etc. All operations such as queries or write-ins by users are based on these logical tables. Users don't need to worry about differences between logical and ordinary tables during usage.

From an implementation standpoint, a logical table is virtual; it doesn't directly read or write physical data but maps read/write requests into corresponding requests for physical tables in order to implement data storage and querying.

### Physical Table

A physical table is a table that actually stores data, possessing several physical Regions defined by partition rules.

## Architecture and Design

The main design architecture of the `Metric` engine is as follows:

![Arch](/metric-engine-arch.png)

The `Metric` engine delegates physical storage and queries to the `Mito` engine. Each physical Region is represented by a data Region, which stores rows from many logical tables, and a metadata Region, which stores the logical-table and logical-column mappings.

Logical tables associated with the same physical table share its partition layout. During writes, the engine records the logical table identity with each row. During reads, it adds a logical-table filter before scanning the physical Region.

Logical tables support normal INSERT, DELETE, and SELECT operations. Direct writes to a physical Region are rejected because they would bypass the logical-table mapping; querying a physical table remains supported.

Batch DDL operations reduce metadata work when many logical tables are created or updated together, such as during Prometheus Remote Write auto-creation or physical Region migration.
