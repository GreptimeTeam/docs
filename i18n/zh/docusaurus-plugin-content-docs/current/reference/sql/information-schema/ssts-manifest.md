---
keywords: [SST manifest, SST 文件, region 文件, 文件元数据, 表数据文件]
description: 提供从 manifest 中获取的 SST（排序字符串表）文件信息，包括文件路径、大小、时间范围和行数。
---

# SSTS_MANIFEST

`SSTS_MANIFEST` 表提供从清单中收集的 SST（排序字符串表）文件信息。此表显示每个 SST 文件的详细信息，包括文件路径、大小、级别、时间范围和行数。

:::tip 注意
此表在 [GreptimeCloud](https://greptime.cloud/) 上不可用。
:::

```sql
USE INFORMATION_SCHEMA;
DESC SSTS_MANIFEST;
```

输出如下：

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

`SSTS_MANIFEST` 表中的字段描述如下：

- `table_dir`：表的目录路径。
- `region_id`：引用该文件的 Region ID。
- `table_id`：表的 ID。
- `region_number`：表中的 Region 编号。
- `region_group`：Region 的组标识符。
- `region_sequence`：Region 的序列号。
- `file_id`：SST 文件的唯一标识符（UUID）。
- `level`：LSM 树中的 SST 级别（0 表示未压缩，1 表示已压缩）。
- `file_path`：对象存储中 SST 文件的完整路径。
- `file_size`：SST 文件的大小（字节）。
- `index_file_path`：对象存储中索引文件的完整路径（如果存在）。
- `index_file_size`：索引文件的大小（字节，如果存在）。
- `num_rows`：SST 文件中的行数。
- `num_row_groups`：SST 文件中的行组数。
- `min_ts`：SST 文件中的最小时间戳。
- `max_ts`：SST 文件中的最大时间戳。
- `sequence`：与此文件关联的序列号。
- `origin_region_id`：创建该文件的 Region ID。
- `node_id`：文件所在的数据节点 ID。
- `visible`：该文件在当前版本中是否可见。

## 示例

查询清单中的所有 SST 文件：

```sql
SELECT * FROM INFORMATION_SCHEMA.SSTS_MANIFEST;
```

通过与 `TABLES` 表连接查询特定表的 SST 文件：

```sql
SELECT s.* 
FROM INFORMATION_SCHEMA.SSTS_MANIFEST s
JOIN INFORMATION_SCHEMA.TABLES t ON s.table_id = t.table_id
WHERE t.table_name = 'my_table';
```

仅查询已压缩的 SST 文件（级别 1）：

```sql
SELECT file_path, file_size, num_rows, level
FROM INFORMATION_SCHEMA.SSTS_MANIFEST
WHERE level = 1;
```

查询 SST 文件及其时间范围：

```sql
SELECT table_id, file_path, num_rows, min_ts, max_ts
FROM INFORMATION_SCHEMA.SSTS_MANIFEST
ORDER BY table_id, min_ts;
```

计算每个表的 SST 文件总大小：

```sql
SELECT table_id, COUNT(*) as sst_count, SUM(file_size) as total_size
FROM INFORMATION_SCHEMA.SSTS_MANIFEST
GROUP BY table_id;
```


输出样例：

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
