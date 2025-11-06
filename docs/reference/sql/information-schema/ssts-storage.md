---
keywords: [SST storage, SST files, file listing, storage layer, object storage]
description: Provides access to SST (Sorted String Table) file information from the storage layer, including file paths, sizes, and last modified timestamps.
---

# SSTS_STORAGE

The `SSTS_STORAGE` table provides access to SST (Sorted String Table) file information listed directly from the storage layer. This table shows raw file metadata from object storage, which may include files that are not yet reflected in the manifest or files that have been orphaned.

:::tip NOTE
This table is not available on [GreptimeCloud](https://greptime.cloud/).
:::

```sql
USE INFORMATION_SCHEMA;
DESC SSTS_STORAGE;
```

The output is as follows:

```sql
+------------------+----------------------+-----+------+---------+---------------+
| Column           | Type                 | Key | Null | Default | Semantic Type |
+------------------+----------------------+-----+------+---------+---------------+
| file_path        | String               |     | NO   |         | FIELD         |
| file_size        | UInt64               |     | YES  |         | FIELD         |
| last_modified_ms | TimestampMillisecond |     | YES  |         | FIELD         |
| node_id          | UInt64               |     | YES  |         | FIELD         |
+------------------+----------------------+-----+------+---------+---------------+
```

Fields in the `SSTS_STORAGE` table are described as follows:

- `file_path`: The full path to the file in object storage.
- `file_size`: The size of the file in bytes (if available from storage).
- `last_modified_ms`: The last modified time in milliseconds since epoch (if available from storage).
- `node_id`: The ID of the datanode where the file is located.

## Use Cases

The `SSTS_STORAGE` table is useful for:

- **Storage verification**: Compare files in storage against the manifest to detect orphaned files or inconsistencies.
- **Storage debugging**: Identify files that exist in storage but may not be properly tracked in the manifest.
- **Cleanup operations**: Find and remove orphaned SST files that are no longer referenced.
- **Storage auditing**: Get a complete view of all SST files in the storage layer.

## Examples

Query all SST files in storage:

```sql
SELECT * FROM INFORMATION_SCHEMA.SSTS_STORAGE;
```

Find files in storage that are not in the manifest (potential orphaned files):

```sql
SELECT s.file_path, s.file_size, s.last_modified_ms
FROM INFORMATION_SCHEMA.SSTS_STORAGE s
LEFT JOIN INFORMATION_SCHEMA.SSTS_MANIFEST m ON s.file_path = m.file_path
WHERE m.file_path IS NULL;
```

Find the largest SST files in storage:

```sql
SELECT file_path, file_size
FROM INFORMATION_SCHEMA.SSTS_STORAGE
WHERE file_size IS NOT NULL
ORDER BY file_size DESC
LIMIT 10;
```

Calculate total storage usage by SST files:

```sql
SELECT COUNT(*) as file_count, SUM(file_size) as total_size
FROM INFORMATION_SCHEMA.SSTS_STORAGE
WHERE file_size IS NOT NULL;
```

Output example:

```sql
mysql> SELECT * FROM INFORMATION_SCHEMA.SSTS_STORAGE LIMIT 1\G;
*************************** 1. row ***************************
       file_path: data/greptime/public/1024/4398046511104_0/01234567-89ab-cdef-0123-456789abcdef.parquet
       file_size: 1234
last_modified_ms: 2025-01-01 00:00:00.000
         node_id: 0
1 row in set (0.02 sec)
```

## Differences from SSTS_MANIFEST

| Aspect | SSTS_MANIFEST | SSTS_STORAGE |
|--------|---------------|--------------|
| **Data Source** | Manifest metadata | Storage layer directly |
| **Information** | Detailed SST metadata (rows, time ranges, etc.) | Basic file metadata only |
| **File Coverage** | Only files tracked in manifest | All files in storage |
| **Use Case** | Query SST metadata for analysis | Verify storage, find orphaned files |
| **Performance** | Fast (reads from manifest) | Slower (scans storage) |
