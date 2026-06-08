---
keywords: [STATISTICS 表, 索引, SHOW INDEX, INFORMATION_SCHEMA, MySQL 兼容]
description: 以兼容 MySQL 的形式提供索引元数据，包括主键、时间索引和二级索引。
---

# STATISTICS

`STATISTICS` 表以兼容 MySQL 的形式提供索引元数据。它为 `SHOW INDEX` 提供底层数据，并且会为主键、时间索引、倒排索引、全文索引和 `SKIPPING INDEX` 中的每个被索引列返回一行。

```sql
USE INFORMATION_SCHEMA;
DESC STATISTICS;
```

结果如下：

```sql
+---------------------+--------+------+------+---------+---------------+
| Column              | Type   | Key  | Null | Default | Semantic Type |
+---------------------+--------+------+------+---------+---------------+
| table_catalog       | String |      | NO   |         | FIELD         |
| table_schema        | String |      | NO   |         | FIELD         |
| table_name          | String |      | NO   |         | FIELD         |
| non_unique          | Int64  |      | NO   |         | FIELD         |
| index_schema        | String |      | NO   |         | FIELD         |
| index_name          | String |      | NO   |         | FIELD         |
| seq_in_index        | Int64  |      | NO   |         | FIELD         |
| column_name         | String |      | NO   |         | FIELD         |
| collation           | String |      | YES  |         | FIELD         |
| cardinality         | Int64  |      | YES  |         | FIELD         |
| sub_part            | Int64  |      | YES  |         | FIELD         |
| packed              | String |      | YES  |         | FIELD         |
| nullable            | String |      | NO   |         | FIELD         |
| index_type          | String |      | NO   |         | FIELD         |
| comment             | String |      | NO   |         | FIELD         |
| index_comment       | String |      | NO   |         | FIELD         |
| is_visible          | String |      | NO   |         | FIELD         |
| expression          | String |      | YES  |         | FIELD         |
| greptime_index_type | String |      | YES  |         | FIELD         |
+---------------------+--------+------+------+---------+---------------+
```

创建包含不同索引类型的表并查询相关元数据：

```sql
CREATE TABLE IF NOT EXISTS system_metrics (
    host STRING,
    idc STRING FULLTEXT INDEX INVERTED INDEX,
    cpu_util DOUBLE,
    memory_util DOUBLE,
    disk_util DOUBLE,
    desc1 STRING,
    desc2 STRING FULLTEXT INDEX,
    desc3 STRING FULLTEXT INDEX,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(host, idc),
    TIME INDEX(ts)
);

CREATE TABLE IF NOT EXISTS test (
    a STRING,
    b STRING SKIPPING INDEX,
    c DOUBLE,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(a, b),
    TIME INDEX(ts)
);

SELECT table_schema,
       table_name,
       non_unique,
       index_name,
       seq_in_index,
       column_name,
       index_type,
       greptime_index_type
FROM information_schema.statistics
WHERE table_schema = 'public'
  AND table_name IN ('system_metrics', 'test')
ORDER BY table_name, index_name, seq_in_index, column_name;
```

结果如下：

```sql
+--------------+----------------+------------+----------------+--------------+-------------+------------+-------------------------------+
| table_schema | table_name     | non_unique | index_name     | seq_in_index | column_name | index_type | greptime_index_type           |
+--------------+----------------+------------+----------------+--------------+-------------+------------+-------------------------------+
| public       | system_metrics | 1          | FULLTEXT INDEX | 1            | idc         | FULLTEXT   | greptime-fulltext-index-bloom |
| public       | system_metrics | 1          | FULLTEXT INDEX | 2            | desc2       | FULLTEXT   | greptime-fulltext-index-bloom |
| public       | system_metrics | 1          | FULLTEXT INDEX | 3            | desc3       | FULLTEXT   | greptime-fulltext-index-bloom |
| public       | system_metrics | 1          | INVERTED INDEX | 1            | idc         | INVERTED   | greptime-inverted-index-v1    |
| public       | system_metrics | 0          | PRIMARY        | 1            | host        | BTREE      | greptime-primary-key-v1       |
| public       | system_metrics | 0          | PRIMARY        | 2            | idc         | BTREE      | greptime-primary-key-v1       |
| public       | system_metrics | 1          | TIME INDEX     | 1            | ts          | BTREE      |                               |
| public       | test           | 0          | PRIMARY        | 1            | a           | BTREE      | greptime-primary-key-v1       |
| public       | test           | 0          | PRIMARY        | 2            | b           | BTREE      | greptime-primary-key-v1       |
| public       | test           | 1          | SKIPPING INDEX | 1            | b           | BLOOM      | greptime-bloom-filter-v1      |
| public       | test           | 1          | TIME INDEX     | 1            | ts          | BTREE      |                               |
+--------------+----------------+------------+----------------+--------------+-------------+------------+-------------------------------+
```

以下语句是等价的：

```sql
SELECT table_name, non_unique, index_name, seq_in_index, column_name
FROM information_schema.statistics
WHERE table_schema = '<db_name>' AND table_name = '<table_name>';

SHOW INDEX FROM <table_name> IN <db_name>;
```

`STATISTICS` 表中列的描述如下：

- `table_catalog`：表所属的目录。该值始终为 `def`。
- `table_schema`：表所属的数据库。
- `table_name`：表名称。
- `non_unique`：索引是否允许重复值。`0` 表示唯一，`1` 表示非唯一。
- `index_schema`：索引元数据所属的数据库，与 `table_schema` 相同。
- `index_name`：索引名称，例如 `PRIMARY`、`TIME INDEX`、`INVERTED INDEX`、`FULLTEXT INDEX` 或 `SKIPPING INDEX`。
- `seq_in_index`：列在索引中的位置，编号从 `1` 开始。
- `column_name`：被索引的列名。
- `collation`：列在索引中的排序方向。目前始终为 `A`。
- `cardinality`：索引中唯一值个数的估算值。目前为 `NULL`。
- `sub_part`：索引前缀长度。目前为 `NULL`。
- `packed`：键的压缩方式。目前为 `NULL`。
- `nullable`：被索引列是否可以为 `NULL`。取值为 `YES` 或空字符串。
- `index_type`：兼容 MySQL 的索引类别，例如 `BTREE`、`FULLTEXT`、`INVERTED` 或 `BLOOM`。
- `comment`：额外的索引元数据。目前为空字符串。
- `index_comment`：面向用户的索引注释。目前为空字符串。
- `is_visible`：索引是否可见。目前始终为 `YES`。
- `expression`：函数索引对应的表达式。目前为 `NULL`。
- `greptime_index_type`：GreptimeDB 内部索引类型标识，例如 `greptime-primary-key-v1` 或 `greptime-inverted-index-v1`。
