---
keywords: [SST index metadata, Puffin index, inverted index, fulltext index, bloom filter, index metadata]
description: Provides access to SST (Sorted String Table) index metadata, including information about inverted indexes, fulltext indexes, and bloom filters stored in Puffin format.
---

# SSTS_INDEX_META

The `SSTS_INDEX_META` table provides access to SST (Sorted String Table) index metadata collected from the manifest. This table surfaces information about Puffin index metadata, including inverted indexes, fulltext indexes, and bloom filters.

:::tip NOTE
This table is not available on [GreptimeCloud](https://greptime.cloud/).
:::

```sql
USE INFORMATION_SCHEMA;
DESC SSTS_INDEX_META;
```

The output is as follows:

```sql
+-----------------+--------+-----+------+---------+---------------+
| Column          | Type   | Key | Null | Default | Semantic Type |
+-----------------+--------+-----+------+---------+---------------+
| table_dir       | String |     | NO   |         | FIELD         |
| index_file_path | String |     | NO   |         | FIELD         |
| region_id       | UInt64 |     | NO   |         | FIELD         |
| table_id        | UInt32 |     | NO   |         | FIELD         |
| region_number   | UInt32 |     | NO   |         | FIELD         |
| region_group    | UInt8  |     | NO   |         | FIELD         |
| region_sequence | UInt32 |     | NO   |         | FIELD         |
| file_id         | String |     | NO   |         | FIELD         |
| index_file_size | UInt64 |     | YES  |         | FIELD         |
| index_type      | String |     | NO   |         | FIELD         |
| target_type     | String |     | NO   |         | FIELD         |
| target_key      | String |     | NO   |         | FIELD         |
| target_json     | String |     | NO   |         | FIELD         |
| blob_size       | UInt64 |     | NO   |         | FIELD         |
| meta_json       | String |     | YES  |         | FIELD         |
| node_id         | UInt64 |     | YES  |         | FIELD         |
+-----------------+--------+-----+------+---------+---------------+
```

Fields in the `SSTS_INDEX_META` table are described as follows:

- `table_dir`: The directory path of the table.
- `index_file_path`: The full path to the Puffin index file.
- `region_id`: The ID of the region.
- `table_id`: The ID of the table.
- `region_number`: The region number within the table.
- `region_group`: The group identifier for the region.
- `region_sequence`: The sequence number of the region.
- `file_id`: The unique identifier of the index file (UUID).
- `index_file_size`: The size of the index file in bytes.
- `index_type`: The type of index. Possible values include:
  - `inverted`: Inverted index for fast term lookups
  - `fulltext_bloom`: Combined fulltext and bloom filter index
  - `bloom_filter`: Bloom filter for fast membership tests
- `target_type`: The type of target being indexed. Typically `column` for column-based indexes.
- `target_key`: The key identifying the target (e.g., column ID).
- `target_json`: JSON representation of the target configuration, such as `{"column":0}`.
- `blob_size`: The size of the blob data in bytes.
- `meta_json`: JSON metadata containing index-specific information such as:
  - For inverted indexes: FST size, bitmap type, segment row count, etc.
  - For bloom filters: bloom filter size, row count, segment count
  - For fulltext indexes: analyzer type, case sensitivity settings
- `node_id`: The ID of the datanode where the index is located.

## Examples

Query all index metadata:

```sql
SELECT * FROM INFORMATION_SCHEMA.SSTS_INDEX_META;
```

Query index metadata for a specific table by joining with the `TABLES` table:

```sql
SELECT s.* 
FROM INFORMATION_SCHEMA.SSTS_INDEX_META s
JOIN INFORMATION_SCHEMA.TABLES t ON s.table_id = t.table_id
WHERE t.table_name = 'my_table';
```

Query only inverted index metadata:

```sql
SELECT table_dir, index_file_path, index_type, target_json, meta_json
FROM INFORMATION_SCHEMA.SSTS_INDEX_META
WHERE index_type = 'inverted';
```

Query index metadata grouped by index type:

```sql
SELECT index_type, COUNT(*) as count, SUM(index_file_size) as total_size
FROM INFORMATION_SCHEMA.SSTS_INDEX_META
GROUP BY index_type;
```
