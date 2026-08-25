---
keywords: [Metric engine, logical table, physical table, Mito, Prometheus]
description: Metric Engine's logical-to-physical storage model for large numbers of metric tables.
---

# Metric Engine

## Overview

Metric Engine is a `RegionEngine` implementation for Prometheus-style workloads with many small metric tables. It multiplexes logical tables into shared physical Mito Regions, reducing per-table metadata and storage overhead while retaining a table-level interface for reads and writes.

Metric Engine does not implement another on-disk format. It rewrites logical requests and delegates physical storage, indexing, and scans to Mito.

## Concepts

### Logical Table

A logical table is the table exposed to users. It has its own schema and table ID, and all user writes and queries address that table. Internally, each logical Region records the physical Region that stores its rows.

On writes, Metric Engine injects the logical table identity into each row before forwarding it to the physical data Region. On reads, it adds a logical-table filter so only rows belonging to the requested table are returned.

### Physical Table

A physical table owns the shared Regions. Each physical Region is represented by a pair of Mito Regions:

- a data Region containing rows from multiple logical tables;
- a metadata Region containing logical-table and logical-column mappings used by Metric Engine.

Direct writes to a physical Region are rejected because they would bypass the logical-table mapping. Queries against a physical table remain supported.

## Architecture and Design

Logical tables associated with a physical table use the same partition layout. Their logical Region IDs map to the corresponding physical data and metadata Region IDs. The mapping is maintained by Metric Engine and by table-route metadata.

`row_modifier.rs` and `batch_modifier.rs` encode the logical table identity and time-series identity into Mito's internal columns. Depending on the physical Region's primary-key encoding, this uses `__table_id` and `__tsid` columns or the sparse `__primary_key` representation. The read path always applies the logical table ID before delegating the scan to Mito.

Metric Engine provides batch DDL paths for operations that affect many logical tables. This avoids issuing a separate metadata update for every table during workloads such as Prometheus Remote Write auto-creation or physical Region migration. These are data definition language operations; ordinary logical-table inserts, deletes, and queries still use the standard Region request paths.

The main implementation is under `src/metric-engine/src/`. Changes to reserved columns, Region ID conversion, or metadata encoding affect persisted data and require backward-compatibility review.
