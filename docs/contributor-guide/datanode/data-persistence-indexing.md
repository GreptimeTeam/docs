---
keywords: [data persistence, indexing, SST file format, Apache Parquet, inverted index, OpenDAL]
description: Explanation of data persistence and indexing in GreptimeDB, including SST file format, indexing methods, and the use of OpenDAL.
---

# Data Persistence and Indexing

Mito flushes data from memtables to durable local filesystems or object storage. SST files use [Apache Parquet][1] as their data format.

## SST File Format

Parquet is a columnar file format. Its hierarchy determines the units that Mito can read, cache, or prune during a scan.

Parquet organizes data as row groups, column chunks, and pages. A row group contains one column chunk for each column, and each column chunk contains one or more pages. Pages are the smallest encoded I/O units within a column chunk.

Column chunks let a projected scan read only the requested columns.

Pages within one column also tend to compress well with encodings such as dictionary encoding and run-length encoding (RLE).

<img src="/parquet-file-format.png" alt="Parquet file format" width="500"/>

## Data Persistence

`region_engine.mito.global_write_buffer_size` sets the memory threshold shared by all Mito memtables on a Datanode.

When memory usage reaches the threshold, the write-buffer manager selects memtables and schedules SST flushes through `src/mito2/src/flush.rs`.

## Indexing Data in SST Files

Parquet records column statistics for row groups and pages. Mito converts compatible query predicates into Parquet pruning predicates so it can skip row groups whose min/max or null statistics cannot match.

## Index Files

Mito stores index artifacts associated with an SST in versioned [Puffin][3] files. The Region manifest identifies the active index version; publishing or rebuilding an index must not make the manifest reference an incomplete artifact.

`src/mito2/src/sst/index/` integrates inverted, bloom-filter skipping, full-text, and feature-gated vector indexes with SST reads and writes. Their reusable index formats live under `src/index/src/`, while `puffin_manager.rs` manages the companion files.

## Inverted Index

For each indexed column, the inverted index maps encoded column values to the SST data segments that contain them. Applying a predicate produces candidate segment IDs; the normal scan still evaluates the complete predicate on rows from those segments.

![Inverted index searching](/inverted-index-searching.png)

The query above uses the inverted index to identify data segments where `job` equals `apiserver`, `handler` matches the regex `.*users`, and `status` matches the regex `4...`. Mito scans those candidate segments and applies the complete query predicate to their rows.

### Inverted Index Format

![Inverted index format](/inverted-index-format.png)

Each column index contains a finite-state transducer (FST) and bitmaps. The FST maps encoded values to bitmap positions and supports lookups such as regular-expression matching. Each bitmap records the data segments that contain a value.

### Index Data Segments

GreptimeDB divides an SST file into fixed-size indexed data segments. A matching bitmap becomes a Parquet row selection, so Mito reads only the candidate row ranges.

For example, with 1024 rows per segment and candidate segment IDs `[0, 2]`, Mito scans rows 0–1023 and 2048–3071 instead of all rows in the SST.

The engine option `index.inverted_index.segment_row_count`, which defaults to `1024`, controls the target segment size. Smaller segments make pruning more precise but increase index size and build cost.

## Unified Data Access Layer: OpenDAL

The `object-store` crate wraps [OpenDAL][2] for local filesystems and object stores. Mito performs SST and index I/O through `src/mito2/src/access_layer.rs`; storage-engine code should not add backend-specific paths around that boundary. Changing a configured backend does not migrate existing data.

[1]: https://parquet.apache.org
[2]: https://opendal.apache.org/
[3]: https://iceberg.apache.org/puffin-spec
