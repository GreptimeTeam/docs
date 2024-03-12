# Data Persistence and Indexing

Similar to all LSMT-like storage engines, data in MemTables is persisted to durable storage, for example, the local disk file system or object storage service. GreptimeDB adopts [Apache Parquet][1] as its persistent file format.

## SST File Format

Parquet is an open source columnar format that provides fast data querying and has already been adopted by many projects, such as Delta Lake.

Parquet has a hierarchical structure like "row groups-columns-data pages". Data in a Parquet file is horizontally partitioned into row groups, in which all values of the same column are stored together to form a data page. Data page is the minimal storage unit. This structure greatly improves performance.

First, clustering data by column makes file scanning more efficient, especially when only a few columns are queried, which is very common in analytical systems.

Second, data of the same column tends to be homogeneous which helps with compression when apply techniques like dictionary and Run-Length Encoding (RLE).

![Parquet file format](/parquet-file-format.png)

## Data Persistence

GreptimeDB provides a configuration item `storage.flush.global_write_buffer_size`, which is flush threshold of the total memory usage for all MemTables.

When the size of data buffered in MemTables reaches that threshold, GreptimeDB will pick MemTables and flush them to SST files.

## Indexing Data in SST Files

Apache Parquet file format provides inherent statistics in headers of column chunks and data pages, which are used for pruning and skipping.

![Column chunk header](/column-chunk-header.png)

For example, in the above Parquet file, if you want to filter rows where `name` = `Emily`, you can easily skip row group 0 because the max value for `name` field is `Charlie`. This statistical information reduces IO operations.

## Index Files

For each SST file, in addition to the internal index within the SST file, GreptimeDB also creates a separate file to store  index structures for that SST file.

The index files utilize the [Puffin][3] format, which offers significant flexibility, allowing for the storage of additional metadata and supporting a broader range of index structures.

![Puffin](/puffin.png)

Currently, the inverted index serves as the first separate index structure supported, stored in the index file in the form of a Blob.

## Inverted Index

In version 0.7, GreptimeDB introduced the inverted index to accelerate queries.

The inverted index is a common index structure used for full-text searches, mapping each word in the document to a list of documents containing that word. We have applied this technology, originating from search engines, to the time series database GreptimeDB.

Search engines and time series databases belong to two different domains. Although the principle of the inverted index technology applied is similar, there are some conceptual migrations:
1. Term: In GreptimeDB, it refers to the column value of the time series.
2. Document: In GreptimeDB, it refers to the data segment containing multiple time series.

The introduction of the inverted index allows GreptimeDB to skip data segments that do not meet the conditions during queries, thereby improving scanning performance.

![Inverted index searching](/inverted-index-searching.png)

For example, in the above query, retrieve the data segments where `job` = `apiserver`, `handler` matches the regex `.*users`, and `status` matches the regex `4..` from the inverted index, and get the data segment list `[1]`. Subsequently, only the data segment needs to be scanned, reducing a large number of IO operations.

### Inverted Index Format

The inverted index is stored by column internally, and each column's inverted index block consists of FST and a Bitmap storing data segment IDs.

The FST (Finite State Transducer) allows us to store mappings from column values to Bitmap positions in a compact format and provides excellent search performance and complex search capabilities (such as regular expression matching).

The Bitmap is used to store data segment IDs, with each bit representing a data segment, and a 1 indicates that the data segment contains the column value.

![Inverted index format](/inverted-index-format.png)

### Index Data Segments

GreptimeDB divides an SST file into several indexed data segments, each containing an equal number of rows.

For example, if a data segment contains 1024 rows and the data segment list obtained after applying the inverted index to the query conditions is `[0, 2]`, then only the 0th and 2nd data segments in the SST file need to be scanned, i.e., from row 0 to row 1023 and from row 2048 to row 3071.

The number of rows in a data segment is controlled by the engine option `index.inverted_index.segment_row_count`, which defaults to `1024`. A smaller value means more precise indexing and often results in better query performance but increases the cost of index storage. By adjusting this option, a balance can be struck between storage costs and query performance.

## Unified Data Access Layer: OpenDAL

GreptimeDB uses [OpenDAL][2] to provide a unified data access layer, thus, the storage engine does not need to interact with different storage APIs, and data can be migrated to cloud-based storage like AWS S3 seamlessly.

[1]: https://parquet.apache.org
[2]: https://github.com/datafuselabs/opendal
[3]: https://iceberg.apache.org/puffin-spec
