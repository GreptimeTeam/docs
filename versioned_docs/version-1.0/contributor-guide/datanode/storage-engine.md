---
keywords: [storage engine, LSMT, Mito engine, data model, architecture, compaction]
description: Overview of the storage engine in GreptimeDB, its architecture, components, and data model.
---

# Storage Engine

## Introduction

The `storage engine` is responsible for storing the data of the database. Mito, based on [LSMT][1] (Log-structured Merge-tree), is the storage engine we use by default. We have made significant optimizations for handling time-series data scenarios, so mito engine is not suitable for general purposes.

## Architecture

The picture below shows the architecture and process procedure of the storage engine.

![Architecture](/storage-engine-arch.png)

The architecture is the same as a traditional LSMT engine:

- [WAL][2]
  - Guarantees high durability for data that is not yet being flushed.
  - Based on the `Log Store` API, thus it doesn't care about the underlying storage
    media.
  - Log records of the WAL can be stored in the local disk, or a distributed log service which
    implements the `Log Store` API.
- Memtables:
  - Data is written into the `active memtable`, aka `mutable memtable` first.
  - When a `mutable memtable` is full, it will be changed to a `read-only memtable`, aka `immutable memtable`.
- SST
  - The full name of SST, aka SSTable is `Sorted String Table`.
  - `Immutable memtable` is flushed to persistent storage and produces an SST file.
- Compactor
  - Small `SST` is merged into large `SST` by the compactor via compaction.
  - The default compaction strategy is [TWCS][3].
- Manifest
  - The manifest stores the metadata of the engine, such as the metadata of the `SST`.
- Cache
  - Speed up queries.

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree
[2]: https://en.wikipedia.org/wiki/Write-ahead_logging
[3]: https://cassandra.apache.org/doc/latest/cassandra/operating/compaction/twcs.html

## Data Model

The data model provided by the storage engine is between the `key-value` model and the tabular model.

```txt
tag-1, ..., tag-m, timestamp -> field-1, ..., field-n
```

Each row of data contains multiple tag columns, one timestamp column, and multiple field columns.
- `0 ~ m` tag columns
  - Tag columns can be nullable.
  - Specified during table creation using `PRIMARY KEY`.
- Must include one timestamp column
  - Timestamp column cannot be null.
  - Specified during table creation using `TIME INDEX`.
- `0 ~ n` field columns
  - Field columns can be nullable.
- Data is sorted by tag columns and timestamp column.

### Region

Data in the storage engine is stored in `regions`, which are logical isolated storage units within the engine. Rows within a `region` must have the same `schema`, which defines the tag columns, timestamp column, and field columns within the `region`. The data of tables in the database is stored in one or multiple `regions`.
