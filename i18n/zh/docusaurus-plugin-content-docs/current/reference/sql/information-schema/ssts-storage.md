---
keywords: [SST storage, SST 文件, 文件列表, 存储层, 对象存储]
description: 提供从存储层直接获取的 SST（排序字符串表）文件信息，包括文件路径、大小和最后修改时间戳。
---

# SSTS_STORAGE

`SSTS_STORAGE` 表提供直接从存储层列出的 SST（排序字符串表）文件信息。此表显示来自对象存储的原始文件元数据，可能包括尚未反映在清单中的文件或已孤立的文件。

:::tip 注意
此表在 [GreptimeCloud](https://greptime.cloud/) 上不可用。
:::

```sql
USE INFORMATION_SCHEMA;
DESC SSTS_STORAGE;
```

输出如下：

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

`SSTS_STORAGE` 表中的字段描述如下：

- `file_path`：对象存储中文件的完整路径。
- `file_size`：文件的大小（字节，如果存储中可用）。
- `last_modified_ms`：最后修改时间（毫秒，如果存储中可用）。
- `node_id`：文件所在的数据节点 ID。

## 使用场景

`SSTS_STORAGE` 表适用于：

- **存储验证**：将存储中的文件与清单进行比较，以检测孤立文件或不一致性。
- **存储调试**：识别存在于存储中但可能未在清单中正确跟踪的文件。
- **清理操作**：查找并删除不再被引用的孤立 SST 文件。
- **存储审计**：获取存储层中所有 SST 文件的完整视图。

## 示例

查询存储中的所有 SST 文件：

```sql
SELECT * FROM INFORMATION_SCHEMA.SSTS_STORAGE;
```

查找存储中但不在清单中的文件（潜在的孤立文件）:

```sql
SELECT s.file_path, s.file_size, s.last_modified_ms
FROM INFORMATION_SCHEMA.SSTS_STORAGE s
LEFT JOIN INFORMATION_SCHEMA.SSTS_MANIFEST m ON s.file_path = m.file_path
WHERE m.file_path IS NULL;
```

查找存储中最大的 SST 文件：

```sql
SELECT file_path, file_size
FROM INFORMATION_SCHEMA.SSTS_STORAGE
WHERE file_size IS NOT NULL
ORDER BY file_size DESC
LIMIT 10;
```

计算 SST 文件的总存储使用量：

```sql
SELECT COUNT(*) as file_count, SUM(file_size) as total_size
FROM INFORMATION_SCHEMA.SSTS_STORAGE
WHERE file_size IS NOT NULL;
```


输出样例：

```sql
mysql> SELECT * FROM INFORMATION_SCHEMA.SSTS_STORAGE LIMIT 1\G;
*************************** 1. row ***************************
       file_path: data/greptime/public/1024/4398046511104_0/01234567-89ab-cdef-0123-456789abcdef.parquet
       file_size: 1234
last_modified_ms: 2025-01-01 00:00:00.000
         node_id: 0
1 row in set (0.02 sec)
```

## 与 SSTS_MANIFEST 的区别

| 方面 | SSTS_MANIFEST | SSTS_STORAGE |
|------|---------------|--------------|
| **数据源** | 清单元数据 | 直接从存储层 |
| **信息** | 详细的 SST 元数据（行数、时间范围等） | 仅基本文件元数据 |
| **文件覆盖** | 仅清单中跟踪的文件 | 存储中的所有文件 |
| **使用场景** | 查询 SST 元数据进行分析 | 验证存储、查找孤立文件 |
| **性能** | 快速（从清单读取） | 较慢（扫描存储） |
