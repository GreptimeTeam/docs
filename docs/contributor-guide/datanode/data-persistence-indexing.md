---
keywords: [data persistence, indexing, SST file format, Apache Parquet, inverted index, OpenDAL]
description: Explanation of data persistence and indexing in GreptimeDB, including SST file format, indexing methods, and the use of OpenDAL.
---

# Data Persistence and Indexing

Like other LSM-tree storage engines, GreptimeDB persists data from memtables to durable storage such as a local filesystem or object storage. It uses [Apache Parquet][1] as the persistent file format.

## SST File Format

Parquet is an open source columnar format that provides fast data querying and has already been adopted by many projects, such as Delta Lake.

Parquet organizes data as row groups, column chunks, and pages. A row group contains one column chunk for each column, and each column chunk contains one or more pages. Pages are the units of encoding and compression; column chunks are the I/O units for reading selected columns.

First, clustering data by column makes file scanning more efficient, especially when only a few columns are queried, which is very common in analytical systems.

Second, values within a column tend to be similar, which improves compression with techniques such as dictionary encoding and run-length encoding (RLE).

The following diagram from the Apache Parquet specification also shows the physical file layout: column chunks are stored by row group, while file metadata and its length are written in the footer.

<img src="/parquet-file-layout.gif" alt="Apache Parquet file layout" width="601"/>

*Source: [Apache Parquet file-format specification](https://parquet.apache.org/docs/file-format/).*

## Data Persistence

GreptimeDB provides a configuration item `region_engine.mito.global_write_buffer_size`, which is flush threshold of the total memory usage for all MemTables.

When the size of data buffered in MemTables reaches that threshold, GreptimeDB will pick MemTables and flush them to SST files.

## Indexing Data in SST Files

Apache Parquet file format provides inherent statistics in headers of column chunks and data pages, which are used for pruning and skipping.

<img src="/column-chunk-header.png" alt="Column chunk header" width="350"/>

For example, in the above Parquet file, if you want to filter rows where `name` = `Emily`, you can easily skip row group 0 because the max value for `name` field is `Charlie`. This statistical information reduces IO operations.

## Index Files

For each SST file, GreptimeDB not only maintains an internal index but also generates a separate file to store the index structures specific to that SST file.

The index files utilize the [Puffin][3] format, which offers significant flexibility, allowing for the storage of additional metadata and supporting a broader range of index structures.

![Puffin](/puffin.png)

GreptimeDB stores several index structures in the Puffin file as Blobs, including the inverted index, the skipping index (backed by a bloom filter), and the full-text index. The inverted index was the first one supported and is described in detail below.

## Inverted Index

In version 0.7, GreptimeDB introduced the inverted index to accelerate queries.

The inverted index is a common index structure used for full-text searches, mapping each word in the document to a list of documents containing that word. GreptimeDB applies this search-engine technique to indexes over time-series data.

Search engines and time series databases operate in separate domains, yet the principle behind the applied inverted index technology is similar. This similarity requires some conceptual adjustments:
1. Term: In GreptimeDB, it refers to the column value of the time series.
2. Document: In GreptimeDB, it refers to the data segment containing multiple time series.

The inverted index enables GreptimeDB to skip data segments that do not meet query conditions, thus improving scanning efficiency.

![Inverted index searching](/inverted-index-searching.png)

For instance, the query above uses the inverted index to identify data segments where `job` equals `apiserver`, `handler` matches the regex `.*users`, and `status` matches the regex `4...`. It then scans these data segments to produce the final results that meet all conditions, significantly reducing the number of IO operations.

### Inverted Index Format

![Inverted index format](/inverted-index-format.png)

GreptimeDB builds inverted indexes by column, with each inverted index consisting of an FST and multiple Bitmaps.

The FST (Finite State Transducer) enables GreptimeDB to store mappings from column values to Bitmap positions in a compact format and provides excellent search performance and supports complex search capabilities (such as regular expression matching). The Bitmaps maintain a list of data segment IDs, with each bit representing a data segment.

### Index Data Segments

GreptimeDB divides an SST file into multiple indexed data segments, with each segment housing an equal number of rows. This segmentation is designed to optimize query performance by scanning only the data segments that match the query conditions. 

For example, if a data segment contains 1024 rows and the list of data segments identified through the inverted index for the query conditions is `[0, 2]`, then only the 0th and 2nd data segments in the SST file—from rows 0 to 1023 and 2048 to 3071, respectively—need to be scanned.

The number of rows in a data segment is controlled by the engine option `index.inverted_index.segment_row_count`, which defaults to `1024`. A smaller value means more precise indexing and often results in better query performance but increases the cost of index storage. By adjusting this option, a balance can be struck between storage costs and query performance.

## Unified Data Access Layer: OpenDAL

GreptimeDB uses [OpenDAL][2] to provide a common access layer for local filesystems and object stores. Changing the configured storage backend does not migrate existing data.

[1]: https://parquet.apache.org
[2]: https://github.com/datafuselabs/opendal
[3]: https://iceberg.apache.org/puffin-spec
