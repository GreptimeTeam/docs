---
keywords: [SST 索引元数据, Puffin 索引, 倒排索引, 全文索引, 布隆过滤器, 索引元数据]
description: 提供对 SST（排序字符串表）索引元数据的访问，包括以 Puffin 格式存储的倒排索引、全文索引和布隆过滤器的信息。
---

# SSTS_INDEX_META

`SSTS_INDEX_META` 表提供对从清单中收集的 SST（排序字符串表）索引元数据的访问。该表显示 Puffin 索引元数据的信息，包括倒排索引、全文索引和布隆过滤器。

:::tip 注意
此表在 [GreptimeCloud](https://greptime.cloud/) 上不可用。
:::

```sql
USE INFORMATION_SCHEMA;
DESC SSTS_INDEX_META;
```

输出如下：

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

`SSTS_INDEX_META` 表中的字段描述如下：

- `table_dir`：表的目录路径。
- `index_file_path`：Puffin 索引文件的完整路径。
- `region_id`：Region 的 ID。
- `table_id`：表的 ID。
- `region_number`：表中的 Region 编号。
- `region_group`：Region 的组标识符。
- `region_sequence`：Region 的序列号。
- `file_id`：索引文件的唯一标识符（UUID）。
- `index_file_size`：索引文件的大小（字节）。
- `index_type`：索引的类型。可能的值包括：
  - `inverted`：用于快速词条查找的倒排索引
  - `fulltext_bloom`：全文索引和布隆过滤器的组合索引
  - `bloom_filter`：用于快速成员测试的布隆过滤器
- `target_type`：被索引目标的类型。通常是 `column`，表示基于列的索引。
- `target_key`：标识目标的键（例如，列 ID）。
- `target_json`：目标配置的 JSON 表示，例如 `{"column":0}`。
- `blob_size`：blob 数据的大小（字节）。
- `meta_json`：包含索引特定信息的 JSON 元数据，例如：
  - 对于倒排索引：FST 大小、位图类型、段行数等
  - 对于布隆过滤器：布隆过滤器大小、行数、段数
  - 对于全文索引：分析器类型、大小写敏感设置
- `node_id`：索引所在数据节点的 ID。

## 示例

查询所有索引元数据：

```sql
SELECT * FROM INFORMATION_SCHEMA.SSTS_INDEX_META;
```

通过与 `TABLES` 表连接查询特定表的索引元数据：

```sql
SELECT s.* 
FROM INFORMATION_SCHEMA.SSTS_INDEX_META s
JOIN INFORMATION_SCHEMA.TABLES t ON s.table_id = t.table_id
WHERE t.table_name = 'my_table';
```

仅查询倒排索引元数据：

```sql
SELECT table_dir, index_file_path, index_type, target_json, meta_json
FROM INFORMATION_SCHEMA.SSTS_INDEX_META
WHERE index_type = 'inverted';
```

按索引类型分组查询索引元数据：

```sql
SELECT index_type, COUNT(*) as count, SUM(index_file_size) as total_size
FROM INFORMATION_SCHEMA.SSTS_INDEX_META
GROUP BY index_type;
```

输出样例：

```sql
mysql> SELECT * FROM INFORMATION_SCHEMA.SSTS_INDEX_META LIMIT 1\G;
*************************** 1. row ***************************
      table_dir: data/greptime/public/1814/
index_file_path: data/greptime/public/1814/1814_0000000000/data/index/aba4af59-1247-4bfb-a20b-69242cdd9374.puffin
      region_id: 7791070674944
       table_id: 1814
  region_number: 0
   region_group: 0
region_sequence: 0
        file_id: aba4af59-1247-4bfb-a20b-69242cdd9374
index_file_size: 838
     index_type: bloom_filter
    target_type: column
     target_key: 2147483652
    target_json: {"column":2147483652}
      blob_size: 688
      meta_json: {"bloom":{"bloom_filter_size":640,"row_count":2242,"rows_per_segment":1024,"segment_count":3}}
        node_id: 0
1 row in set (0.02 sec)
```