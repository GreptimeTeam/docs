---
keywords: [memtable, Mito engine, write buffer, flush, time partition, BulkMemtable]
description: How Mito organizes mutable Region data in memtables and moves it into SST files.
---

# Memtable design

A memtable is Mito's in-memory write buffer for a Region. It makes writes available to reads before a flush creates SST files. A Region version identifies the memtables and SST files that a scan may read. Together with a committed-sequence fence, it keeps the scan consistent while writes and flushes advance the current version.

## Write and flush lifecycle

For a normal WAL-backed write, Mito uses this order:

```text
write request
     |
     v
WAL append -> mutable memtable -> publish committed sequence
                   |
                 freeze
                   v
            immutable memtable -> SST write -> manifest edit
```

The Region worker assigns sequence numbers and a WAL entry ID before appending the mutation to the [write-ahead log](wal.md). If the WAL append fails, Mito does not update the memtable. After the memtable update succeeds, Mito publishes the committed sequence and the rows become visible to new reads. A Region configured with `skip_wal` omits the WAL append, but keeps the same memtable and visibility ordering.

A flush freezes the mutable memtables and installs a new mutable set before starting the background SST write. New writes therefore continue without changing the frozen data. The flush writes the immutable memtables to SST files, then persists a manifest edit containing the files and the flushed WAL and sequence checkpoints. Only after that edit is durable does Mito remove the flushed memtables from the current Region version. If the flush fails, the immutable memtables remain available for a later attempt.

## Region versions and time partitions

Each Region has one mutable `TimePartitions` container, which can hold more than one memtable:

```text
Region version
├─ mutable TimePartitions
│  ├─ [t0, t1) -> memtable
│  └─ [t1, t2) -> memtable
├─ immutable memtables
└─ SST files
```

Mito routes each row to a partition by its time-index value. Partition ranges are half-open and aligned to a fixed duration. The duration follows the Region's compaction time window; Mito uses one day until a compaction window is available. An out-of-order write can create an earlier partition alongside the latest one.

Freezing a Region freezes all mutable time partitions together. Mito moves their memtables to the immutable list and creates a new `TimePartitions` container. A failed flush can leave more than one generation of immutable memtables, so reads and later flushes must not assume that the list contains a single item.

## Memtable implementations

Mito selects a memtable implementation from the Region's SST format, primary-key encoding, and memtable options:

```text
memtable.type=bulk                                  -> BulkMemtable and flat SST
flat SST format or sparse primary-key encoding      -> BulkMemtable
primary_key SST, dense encoding, primary key exists -> TimeSeriesMemtable
primary_key SST, dense encoding, no primary key     -> SimpleBulkMemtable
```

With the default engine configuration, a Region without an explicit SST format uses `flat`, so `BulkMemtable` is the normal path. The rules prevent incompatible combinations: flat format or sparse primary-key encoding requires `BulkMemtable`, while explicitly selecting the bulk implementation forces flat format.

### BulkMemtable

`BulkMemtable` stores writes as parts in the flat Arrow layout instead of inserting rows into per-series buffers:

```text
BulkMemtable
├─ unordered_part
│  └─ small BulkPart batches
└─ parts
   ├─ BulkPart        (Arrow RecordBatch)
   ├─ MultiBulkPart   (raw RecordBatches)
   └─ EncodedBulkPart (in-memory Parquet)
```

Small parts accumulate in `unordered_part`; larger parts enter `parts` directly. Background memtable compaction merge-sorts eligible parts into a `MultiBulkPart` or encodes them as an `EncodedBulkPart`. Scans use part statistics to prune ranges, and flush can write encoded ranges to SST without decoding and encoding the rows again. For the design rationale and performance results, see [Scaling Time Series to Millions of Cardinalities: GreptimeDB's Flat Format](https://www.greptime.com/blogs/2025-12-22-flat-format).

### TimeSeriesMemtable

`TimeSeriesMemtable` groups rows by encoded primary key. Each series stores its timestamps, sequence numbers, operation types, and field values in column builders. When a reader requests the series, the memtable builds a batch ordered by timestamp and sequence and applies the Region's deduplication or merge mode.

This implementation is used for the `primary_key` SST format with dense primary-key encoding unless the Region explicitly selects the bulk implementation. If the Region has no primary-key columns, the same builder creates a `SimpleBulkMemtable` instead of a series map.

The removed `partition_tree` memtable is not a third implementation. The option parser accepts `memtable.type=partition_tree` for compatibility, but it does not recreate that implementation. The Region uses the bulk and flat path.

## Read snapshots

A scan obtains the Region version and committed sequence together from `VersionControl`. It selects the version before applying the sequence fence. Reading the sequence separately before the version could pair that sequence with a later version after flush or compaction removes an older input, producing an incomplete snapshot.

The selected version supplies mutable memtables, immutable memtables, and SST files. Mito first prunes sources by time range, then asks each memtable for ranges using the scan's projection, predicate, and sequence bounds. The scan merges the resulting ranges with SST ranges and applies the same ordering, deletion, and merge semantics across all sources. References held by the scan keep an older memtable alive even after a newer Region version removes it.

## Memory pressure

Each memtable tracks its estimated heap allocation through the engine's write-buffer manager. Freezing a memtable removes its allocation from the mutable-memory count, but total usage includes the allocation until all references to that memtable are released. The mutable-memory count therefore tracks data that can still accept writes, while total usage continues to include memory retained by active scans.

The global write-buffer limit causes workers to select Regions for flush. If memory remains above the configured limits, Mito stalls writes and can reject them at a higher threshold. An optional per-Region limit applies the same pressure to one hot Region without stalling unrelated Regions. Periodic, manual, and Region lifecycle operations can also request a flush.

## Constraints for changes

Changes to memtable code must preserve these properties:

- For a WAL-backed Region, append to the WAL before installing rows in a memtable. Publish the committed sequence only after installation succeeds.
- Keep frozen memtables readable and retryable until the SST files and manifest edit are durable.
- Obtain the Region version and committed sequence from the same `VersionControl` snapshot; never read the sequence separately before the version.
- Preserve the ordering and metadata that scans and flushes need to apply the same deletion, deduplication, and merge rules across memtable and SST ranges.
- Charge allocations to the write-buffer manager and release them only when the underlying memory can no longer be referenced.
