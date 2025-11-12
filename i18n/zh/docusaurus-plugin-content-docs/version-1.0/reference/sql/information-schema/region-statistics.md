---
keywords: [Region 统计信息, REGION_STATISTICS 表, 总行数, 磁盘大小, 近似值]
description: REGION_STATISTICS 表提供关于某个 Region 统计信息的详细数据，包括总行数、磁盘大小等。
---

# REGION_STATISTICS

`REGION_STATISTICS` 表提供了关于某个 Region 统计信息的详细数据，包括总行数、磁盘大小等。这些统计信息都是近似值。

:::tip NOTE
此表在 [GreptimeCloud](https://greptime.cloud/) 中不可用。
:::

```sql
USE INFORMATION_SCHEMA;
DESC REGION_STATISTICS;
```

输出如下：

```sql
+--------------------------+--------+------+------+---------+---------------+
| Column                   | Type   | Key  | Null | Default | Semantic Type |
+--------------------------+--------+------+------+---------+---------------+
| region_id                | UInt64 |      | NO   |         | FIELD         |
| table_id                 | UInt32 |      | NO   |         | FIELD         |
| region_number            | UInt32 |      | NO   |         | FIELD         |
| region_rows              | UInt64 |      | YES  |         | FIELD         |
| written_bytes_since_open | UInt64 |      | YES  |         | FIELD         |
| disk_size                | UInt64 |      | YES  |         | FIELD         |
| memtable_size            | UInt64 |      | YES  |         | FIELD         |
| manifest_size            | UInt64 |      | YES  |         | FIELD         |
| sst_size                 | UInt64 |      | YES  |         | FIELD         |
| sst_num                  | UInt64 |      | YES  |         | FIELD         |
| index_size               | UInt64 |      | YES  |         | FIELD         |
| engine                   | String |      | YES  |         | FIELD         |
| region_role              | String |      | YES  |         | FIELD         |
+--------------------------+--------+------+------+---------+---------------+
```

`REGION_STATISTICS` 表中的字段描述如下：

- `region_id`: Region 的 ID。
- `table_id`: 表的 ID。
- `region_number`: Region 在表中的编号。
- `region_rows`: Region 中的记录行数。
- `written_bytes_since_open`: Region 自打开以来写入的字节数。
- `disk_size`: Region 中数据文件的总大小，包括数据、索引及元信息等。
- `memtable_size`: Region 中内存 memtables 的总大小。
- `manifest_size`: Region 中元信息 manifest 文件的总大小。
- `sst_num`: Region 中 SST 文件的总数量。
- `sst_size`: Region 中 SST 文件的总大小。
- `index_size`: Region 中索引文件的总大小。
- `engine`: Region 的引擎类型，可以是 `mito` 或 `metric`。
- `region_role`: Region 的角色，可以是 `Leader` 或 `Follower`。

获取某张表的 Region 统计信息如下：

```sql
SELECT r.* FROM REGION_STATISTICS r LEFT JOIN TABLES t on r.table_id = t.table_id \
WHERE t.table_name = 'system_metrics';
```

输出：
```sql
+---------------+----------+---------------+-------------+--------------------------+-----------+---------------+---------------+----------+---------+------------+--------+-------------+
| region_id     | table_id | region_number | region_rows | written_bytes_since_open | disk_size | memtable_size | manifest_size | sst_size | sst_num | index_size | engine | region_role |
+---------------+----------+---------------+-------------+--------------------------+-----------+---------------+---------------+----------+---------+------------+--------+-------------+
| 4398046511104 |     1024 |             0 |           8 |                        0 |      4922 |             0 |          1338 |     3249 |       1 |        335 | mito   | Leader      |
+---------------+----------+---------------+-------------+--------------------------+-----------+---------------+---------------+----------+---------+------------+--------+-------------+
```
