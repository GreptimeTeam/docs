---
keywords: [storage engine, LSMT, Mito engine, data model, architecture, compaction]
description: Overview of the storage engine in GreptimeDB, its architecture, components, and data model.
---

# Storage Engine

## Introduction

Mito is GreptimeDB's primary time-series Region engine. It implements the `RegionEngine` trait and uses an [LSM tree][1] write path: WAL and memtables absorb writes, immutable Parquet SST files hold persisted data, and background compaction reorganizes those files.

## Architecture

The implementation is under `src/mito2/src/`. `engine.rs` dispatches Region requests, `worker/` owns the per-Region write loop, `read/` builds scans, and `flush.rs`, `compaction/`, `manifest/`, and `sst/` implement the persistent lifecycle.

- **WAL** records writes that have not reached an SST so a Region can recover its memtable state. It uses the `LogStore` API with local raft-engine and remote Kafka providers. The acknowledgement durability boundary depends on provider configuration; see [Write-Ahead Logging](./wal.md).
- **Memtables** receive writes in a mutable active memtable. A flush freezes it into an immutable memtable that remains readable until its rows have been written to an SST.
- **SST files** are immutable Parquet files whose rows are sorted by primary key and time index; see [Data Layout in SST Files](#data-layout-in-sst-files).
- **Compaction** merges SST files and removes expired data. The default strategy is [TWCS][3], which groups files by time window. See [Compaction](/user-guide/deployments-administration/manage-data/compaction.md).
- **Manifest** stores versioned Region metadata and SST file changes used during recovery.
- **Caches** retain file metadata, data pages, and other reusable scan state.

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree
[2]: https://en.wikipedia.org/wiki/Write-ahead_logging
[3]: https://cassandra.apache.org/doc/latest/cassandra/operating/compaction/twcs.html

## Data Model

Mito receives a `RegionMetadata` schema with a primary-key column list, one non-null time-index column, and field columns. The SQL layer exposes primary-key columns as tags, but Mito operates on column IDs and semantic types rather than SQL table definitions.

### Region

A Region is Mito's isolation, recovery, and request unit. Every row in a Region follows its Region metadata. A table can span several Regions, while table routing and placement remain outside the storage engine.

## Data Layout in SST Files

When a memtable is flushed, Mito writes its rows into immutable [Apache Parquet](https://parquet.apache.org) SST files. For the Parquet file format itself and how SST files are indexed, see [Data Persistence and Indexing](data-persistence-indexing.md).

Within an SST file, rows are sorted by `(primary key, time index)`. Rows that share the same primary key (the tag columns) belong to the same time-series and are stored contiguously, ordered by timestamp. This locality is what makes scanning a single series cheap and improves compression. For append-only tables without a primary key, rows are sorted by the time index alone.

Besides the table columns, Mito stores three internal columns in each SST file so it can merge, deduplicate, and apply deletes correctly when reading from multiple memtables and SST files:

- `__primary_key`: the encoded primary key (tags) of the row.
- `__sequence`: the sequence number of the row.
- `__op_type`: the operation type of the row (put or delete).

Each Parquet SST is split into row groups, the unit that Parquet can read or skip independently. Every row group carries column statistics such as min value, max value, and null count. Mito also records file-level metadata for each SST, including the time range, row count, row-group count, available indexes, and the primary-key range. These statistics drive the scan pruning described below.

Mito supports two SST formats: `flat` and `primary_key`. `flat` is the default for new tables and works well across primary-key cardinalities, including high-cardinality keys. `primary_key` is the legacy format kept for compatibility with older tables. See [SST format](/reference/sql/create.md#create-a-table-with-sst-format) and the [table design guide](/user-guide/deployments-administration/performance-tuning/design-table.md#sst-format) for more details.

<img src="/sst-layout.svg" alt="SST layout" style={{width: '80%', margin: '0 auto'}}/>

## Scan Pruning

Mito avoids reading data that cannot match a query by combining several pruning steps, from coarse to fine:

1. **Time-range pruning.** Files and memtables whose time range does not intersect the query's time range are skipped before opening any reader. This is usually the cheapest and most effective step for time-series queries.
2. **Row-group statistics.** If a row group's min-max statistics prove that no row can match a predicate, the whole row group is skipped.
3. **Indexes.** Inverted, skipping, and full-text indexes provide more selective pruning for predicates that statistics cannot resolve. The feature-gated vector index selects candidate rows for vector search. See [Data Persistence and Indexing](data-persistence-indexing.md).

<img src="/scan-pruning.svg" alt="Scan pruning pipeline" style={{width: '80%', margin: '0 auto'}}/>
