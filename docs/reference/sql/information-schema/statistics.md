---
keywords: [statistics, indexes, show index, information schema, MySQL compatibility]
description: Provides index metadata in a MySQL-compatible shape, including primary keys, time indexes, and secondary indexes.
---

# STATISTICS

The `STATISTICS` table provides index metadata in a MySQL-compatible shape. It powers `SHOW INDEX` and returns one row per indexed column for primary keys, time indexes, inverted indexes, fulltext indexes, and skipping indexes.

```sql
USE INFORMATION_SCHEMA;
DESC STATISTICS;
```

The output is as follows:

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

Create tables with different index types and query the metadata:

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

The output is as follows:

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

The following statements are equivalent:

```sql
SELECT table_name, non_unique, index_name, seq_in_index, column_name
FROM information_schema.statistics
WHERE table_schema = '<db_name>' AND table_name = '<table_name>';

SHOW INDEX FROM <table_name> IN <db_name>;
```

The description of columns in the `STATISTICS` table is as follows:

- `table_catalog`: The catalog of the table. The value is always `def`.
- `table_schema`: The database of the table.
- `table_name`: The name of the table.
- `non_unique`: Whether the index can contain duplicate values. `0` means unique, `1` means non-unique.
- `index_schema`: The database that contains the index metadata. It is the same as `table_schema`.
- `index_name`: The index name, such as `PRIMARY`, `TIME INDEX`, `INVERTED INDEX`, `FULLTEXT INDEX`, or `SKIPPING INDEX`.
- `seq_in_index`: The position of the column inside the index. The position number starts from `1`.
- `column_name`: The indexed column name.
- `collation`: The column sort direction in the index. The value is currently always `A`.
- `cardinality`: The estimated number of unique values in the index. Currently `NULL`.
- `sub_part`: The indexed prefix length. Currently `NULL`.
- `packed`: How the key is packed. Currently `NULL`.
- `nullable`: Whether the indexed column can be `NULL`. The value is `YES` or an empty string.
- `index_type`: The MySQL-style index category, such as `BTREE`, `FULLTEXT`, `INVERTED`, or `BLOOM`.
- `comment`: Additional index metadata. Currently an empty string.
- `index_comment`: User-facing index comments. Currently an empty string.
- `is_visible`: Whether the index is visible. The value is currently always `YES`.
- `expression`: The indexed expression for functional indexes. Currently `NULL`.
- `greptime_index_type`: The GreptimeDB internal index type identifier, such as `greptime-primary-key-v1` or `greptime-inverted-index-v1`.
