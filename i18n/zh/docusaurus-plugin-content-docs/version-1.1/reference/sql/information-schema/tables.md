---
keywords: [表信息, TABLES 表, SQL 表, 数据库表, 表字段, 表描述]
description: TABLES 表提供数据库中表的信息及其字段描述。
---

# TABLES

`TABLES` 表提供数据库中表的信息：

```sql
USE INFORMATION_SCHEMA;
DESC TABLES;
```

结果如下：

```sql
+------------------+----------+------+------+---------+---------------+
| Column           | Type     | Key  | Null | Default | Semantic Type |
+------------------+----------+------+------+---------+---------------+
| table_catalog    | String   |      | NO   |         | FIELD         |
| table_schema     | String   |      | NO   |         | FIELD         |
| table_name       | String   |      | NO   |         | FIELD         |
| table_type       | String   |      | NO   |         | FIELD         |
| table_id         | UInt32   |      | YES  |         | FIELD         |
| data_length      | UInt64   |      | YES  |         | FIELD         |
| max_data_length  | UInt64   |      | YES  |         | FIELD         |
| index_length     | UInt64   |      | YES  |         | FIELD         |
| max_index_length | UInt64   |      | YES  |         | FIELD         |
| avg_row_length   | UInt64   |      | YES  |         | FIELD         |
| engine           | String   |      | YES  |         | FIELD         |
| version          | UInt64   |      | YES  |         | FIELD         |
| row_format       | String   |      | YES  |         | FIELD         |
| table_rows       | UInt64   |      | YES  |         | FIELD         |
| data_free        | UInt64   |      | YES  |         | FIELD         |
| auto_increment   | UInt64   |      | YES  |         | FIELD         |
| create_time      | TimestampSecond |      | YES  |         | FIELD         |
| update_time      | TimestampSecond |      | YES  |         | FIELD         |
| check_time       | TimestampSecond |      | YES  |         | FIELD         |
| table_collation  | String   |      | YES  |         | FIELD         |
| checksum         | UInt64   |      | YES  |         | FIELD         |
| create_options   | String   |      | YES  |         | FIELD         |
| table_comment    | String   |      | YES  |         | FIELD         |
| temporary        | String   |      | YES  |         | FIELD         |
+------------------+----------+------+------+---------+---------------+
```

```sql
SELECT * FROM tables WHERE table_schema='public' AND table_name='monitor'\G
```

```sql
*************************** 1. row ***************************
   table_catalog: greptime
    table_schema: public
      table_name: monitor
      table_type: BASE TABLE
        table_id: 1054
     data_length: 0
 max_data_length: 0
    index_length: 0
max_index_length: 0
  avg_row_length: 0
          engine: mito
         version: 11
      row_format: Fixed
      table_rows: 0
       data_free: 0
  auto_increment: 0
     create_time: 2024-07-24 22:06:18.085000
     update_time: NULL
      check_time: NULL
 table_collation: NULL
        checksum: 0
  create_options:
   table_comment: NULL
       temporary: N
1 row in set (0.01 sec)
```


下方的语句是等价的：

```sql
SELECT table_name FROM INFORMATION_SCHEMA.TABLES
  WHERE table_schema = '<db_name>'
  [AND table_name LIKE 'monitor']

SHOW TABLES
  FROM db_name
  [LIKE 'monitor']
```

`TABLES` 表的字段描述如下：

- `table_catalog`：表所属的目录。该值始终为 `greptime`。
- `table_schema`：表所属的数据库。
- `table_name`：表的名称。
- `table_type`：表的类型。
  - `BASE TABLE`：基础表
  - `TEMPORARY`：临时结果集
  - `VIEW`：视图表
- `table_id`：表 ID。
- `data_length`: 表大小，即表中 SST 文件的总长度（以字节为单位），近似值。
- `index_length`: 表索引大小，即表中索引文件的总长度（以字节为单位），近似值。
- `table_rows`: 表中总的记录行数，近似值。
- `avg_row_length`: 表中记录的平均大小（以字节为单位），近似值。
- `engine`：该表使用的存储引擎。
- `version`: 版本。固定值为 `11`。
- `create_time`: 表创建的时间戳。
- `table_comment`: 表的注释。
- 其他列如 `table_rows`， `row_format` 等不支持，仅用于兼容 MySQL。GreptimeDB 未来可能会支持其中的一些列。


