---
keywords: [SST manifest, SST files, region files, file metadata, table data files]
description: Provides access to SST (Sorted String Table) file information from the manifest, including file paths, sizes, time ranges, and row counts.
---

# SSTS_MANIFEST

The `SSTS_MANIFEST` table provides access to SST (Sorted String Table) file information collected from the manifest. This table surfaces detailed information about each SST file, including file paths, sizes, levels, time ranges, and row counts.

:::tip NOTE
This table is not available on [GreptimeCloud](https://greptime.cloud/).
:::

```sql
USE INFORMATION_SCHEMA;
DESC SSTS_MANIFEST;
```

The output is as follows:

```sql
+------------------+---------------------+-----+------+---------+---------------+
| Column           | Type                | Key | Null | Default | Semantic Type |
+------------------+---------------------+-----+------+---------+---------------+
| table_dir        | String              |     | NO   |         | FIELD         |
| region_id        | UInt64              |     | NO   |         | FIELD         |
| table_id         | UInt32              |     | NO   |         | FIELD         |
| region_number    | UInt32              |     | NO   |         | FIELD         |
| region_group     | UInt8               |     | NO   |         | FIELD         |
| region_sequence  | UInt32              |     | NO   |         | FIELD         |
| file_id          | String              |     | NO   |         | FIELD         |
| level            | UInt8               |     | NO   |         | FIELD         |
| file_path        | String              |     | NO   |         | FIELD         |
| file_size        | UInt64              |     | NO   |         | FIELD         |
| index_file_path  | String              |     | YES  |         | FIELD         |
| index_file_size  | UInt64              |     | YES  |         | FIELD         |
| num_rows         | UInt64              |     | NO   |         | FIELD         |
| num_row_groups   | UInt64              |     | NO   |         | FIELD         |
| min_ts           | TimestampNanosecond |     | YES  |         | FIELD         |
| max_ts           | TimestampNanosecond |     | YES  |         | FIELD         |
| sequence         | UInt64              |     | YES  |         | FIELD         |
| origin_region_id | UInt64              |     | NO   |         | FIELD         |
| node_id          | UInt64              |     | YES  |         | FIELD         |
| visible          | Boolean             |     | NO   |         | FIELD         |
+------------------+---------------------+-----+------+---------+---------------+
```

Fields in the `SSTS_MANIFEST` table are described as follows:

- `table_dir`: The directory path of the table.
- `region_id`: The ID of the region that refers to the file.
- `table_id`: The ID of the table.
- `region_number`: The region number within the table.
- `region_group`: The group identifier for the region.
- `region_sequence`: The sequence number of the region.
- `file_id`: The unique identifier of the SST file (UUID).
- `level`: The SST level in the LSM tree (0 for uncompacted, 1 for compacted).
- `file_path`: The full path to the SST file in object storage.
- `file_size`: The size of the SST file in bytes.
- `index_file_path`: The full path to the index file in object storage (if exists).
- `index_file_size`: The size of the index file in bytes (if exists).
- `num_rows`: The number of rows in the SST file.
- `num_row_groups`: The number of row groups in the SST file.
- `min_ts`: The minimum timestamp in the SST file.
- `max_ts`: The maximum timestamp in the SST file.
- `sequence`: The sequence number associated with this file.
- `origin_region_id`: The ID of the region that created the file.
- `node_id`: The ID of the datanode where the file is located.
- `visible`: Whether this file is visible in the current version.

## Examples

Query all SST files in the manifest:

```sql
SELECT * FROM INFORMATION_SCHEMA.SSTS_MANIFEST;
```

Query SST files for a specific table by joining with the `TABLES` table:

```sql
SELECT s.* 
FROM INFORMATION_SCHEMA.SSTS_MANIFEST s
JOIN INFORMATION_SCHEMA.TABLES t ON s.table_id = t.table_id
WHERE t.table_name = 'my_table';
```

Query only compacted SST files (level 1):

```sql
SELECT file_path, file_size, num_rows, level
FROM INFORMATION_SCHEMA.SSTS_MANIFEST
WHERE level = 1;
```

Query SST files with their time ranges:

```sql
SELECT table_id, file_path, num_rows, min_ts, max_ts
FROM INFORMATION_SCHEMA.SSTS_MANIFEST
ORDER BY table_id, min_ts;
```

Calculate total SST file size per table:

```sql
SELECT table_id, COUNT(*) as sst_count, SUM(file_size) as total_size
FROM INFORMATION_SCHEMA.SSTS_MANIFEST
GROUP BY table_id;
```


Output example:

```sql
mysql> SELECT * FROM INFORMATION_SCHEMA.SSTS_MANIFEST LIMIT 1\G;
*************************** 1. row ***************************
       table_dir: data/greptime/public/1024/
       region_id: 4398046511104
        table_id: 1024
   region_number: 0
    region_group: 0
 region_sequence: 0
         file_id: 01234567-89ab-cdef-0123-456789abcdef
           level: 0
       file_path: data/greptime/public/1024/4398046511104_0/01234567-89ab-cdef-0123-456789abcdef.parquet
       file_size: 1234
 index_file_path: data/greptime/public/1024/4398046511104_0/index/01234567-89ab-cdef-0123-456789abcdef.puffin
 index_file_size: 256
        num_rows: 100
  num_row_groups: 1
          min_ts: 2025-01-01 00:00:00.000000000
          max_ts: 2025-01-01 00:01:00.000000000
        sequence: 1
origin_region_id: 4398046511104
         node_id: 0
         visible: true
1 row in set (0.02 sec)
```
