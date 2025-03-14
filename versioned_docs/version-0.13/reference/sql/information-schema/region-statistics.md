---
keywords: [region statistics, rows, disk size, memtable size, sst size, index size]
description: Provides detailed information about a region's statistics, including the total number of rows, disk size, and more. These statistics are approximate values.
---

# REGION_STATISTICS

The `REGION_STATISTICS` table provides detailed information about a region's statistics, including the total number of rows, disk size, and more. These statistics are approximate values.

:::tip NOTE
This table is not available on [GreptimeCloud](https://greptime.cloud/).
:::

```sql
USE INFORMATION_SCHEMA;
DESC REGION_STATISTICS;
```

The output is as follows:

```sql
+---------------+--------+------+------+---------+---------------+
| Column        | Type   | Key  | Null | Default | Semantic Type |
+---------------+--------+------+------+---------+---------------+
| region_id     | UInt64 |      | NO   |         | FIELD         |
| table_id      | UInt32 |      | NO   |         | FIELD         |
| region_number | UInt32 |      | NO   |         | FIELD         |
| region_rows   | UInt64 |      | YES  |         | FIELD         |
| disk_size     | UInt64 |      | YES  |         | FIELD         |
| memtable_size | UInt64 |      | YES  |         | FIELD         |
| manifest_size | UInt64 |      | YES  |         | FIELD         |
| sst_size      | UInt64 |      | YES  |         | FIELD         |
| index_size    | UInt64 |      | YES  |         | FIELD         |
| engine        | String |      | YES  |         | FIELD         |
| region_role   | String |      | YES  |         | FIELD         |
+---------------+--------+------+------+---------+---------------+
```

Fields in the `REGION_STATISTICS` table are described as follows:

- `region_id`: The ID of the Region.
- `table_id`: The ID of the table.
- `region_number`: The number of the region in the table.
- `region_rows`:  The number of rows in the region.
- `disk_size`:  The total size of data files in the region, including data, index and metadata etc.
- `memtable_size`: The region's total size of memtables.
- `manifest_size`: The region's total size of manifest files.
- `sst_size`: The region's total size of SST files.
- `index_size`: The region's total size of index files.
- `engine`: The engine type of the region, `mito` or `metric`.
- `region_role`: The region's role, `Leader` or `Follower`.


Retrieve a table's region statistics information as follows:

```sql
SELECT r.* FROM REGION_STATISTICS r LEFT JOIN TABLES t on r.table_id = t.table_id \
WHERE t.table_name = 'system_metrics';
```


Output:
```sql
+---------------+----------+---------------+-------------+-----------+---------------+---------------+----------+------------+--------+-------------+
| region_id     | table_id | region_number | region_rows | disk_size | memtable_size | manifest_size | sst_size | index_size | engine | region_role |
+---------------+----------+---------------+-------------+-----------+---------------+---------------+----------+------------+--------+-------------+
| 4398046511104 |     1024 |             0 |           8 |      4922 |             0 |          1338 |     3249 |        335 | mito   | Leader      |
+---------------+----------+---------------+-------------+-----------+---------------+---------------+----------+------------+--------+-------------+
```