---
keywords: [Metric engine, small tables, logical table, physical table, storage optimization]
description: Overview of the Metric engine in GreptimeDB, its concepts, architecture, and design for handling small tables.
---

# Metric Engine

## Overview

The `Metric` engine stores workloads with many small metric tables.

It maps those logical tables onto shared physical wide tables so they can reuse columns and metadata. This reduces per-table storage overhead and improves columnar compression.

## Concepts

The `Metric` engine introduces two new concepts: "logical table" and "physical table". From the user's perspective, logical tables are exactly like ordinary ones. From a storage point-of-view, physical Regions are just regular Regions.

### Logical Table

A logical table refers to user-defined tables. Just like any other ordinary table, its definition includes the name of the table, column definitions, index definitions etc. All operations such as queries or write-ins by users are based on these logical tables. Users don't need to worry about differences between logical and ordinary tables during usage.

A logical table is virtual. The engine maps its read and write requests to the corresponding physical table instead of storing data for it directly.

### Physical Table

A physical table is a table that actually stores data, possessing several physical Regions defined by partition rules.

## Architecture and Design

The main design architecture of the `Metric` engine is as follows:

![Arch](/metric-engine-arch.png)

The `Metric` engine delegates physical storage and queries to the `Mito` engine. Each physical Region is represented by a data Region, which stores rows from many logical tables, and a metadata Region, which stores the logical-table and logical-column mappings.

Logical tables associated with the same physical table share its partition layout. During writes, the engine records the logical table identity with each row. During reads, it adds a logical-table filter before scanning the physical Region.

Logical tables support normal INSERT, DELETE, and SELECT operations. Direct writes to a physical Region are rejected because they would bypass the logical-table mapping; querying a physical table remains supported.

Batch DDL operations reduce metadata work when many logical tables are created or updated together, such as during Prometheus Remote Write auto-creation or physical Region migration.
