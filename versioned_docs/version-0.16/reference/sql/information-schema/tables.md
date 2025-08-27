---
keywords: [tables, information schema, SQL, database tables, table properties]
description: Provides information about tables in databases, including details about each table's catalog, schema, name, type, and other properties.
---

# TABLES

The `TABLES` table provides information about tables in databases:

```sql
USE INFORMATION_SCHEMA;
DESC TABLES;
```

The output is as follows:

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
| create_time      | DateTime |      | YES  |         | FIELD         |
| update_time      | DateTime |      | YES  |         | FIELD         |
| check_time       | DateTime |      | YES  |         | FIELD         |
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

The following statements are equivalent:

```sql
SELECT table_name FROM INFORMATION_SCHEMA.TABLES
  WHERE table_schema = '<db_name>'
  [AND table_name LIKE 'monitor']

SHOW TABLES
  FROM db_name
  [LIKE 'monitor']
```

The description of columns in the `TABLES` table is as follows:

- `table_catalog`: The catalog to which the table belongs. The value is always `greptime`.
- `table_schema`: The database to which the table belongs.
- `table_name`: The name of the table.
- `table_type`: The type of the table.
  - `BASE TABLE`  for a table.
  - `TEMPORARY` for a temporary result set.
  - `VIEW`  for a view.
- `table_id`: The ID of the table.
- `data_length`: The table size, representing the total length of the table's SST files in bytes. This is an approximate value.
- `index_length`: The total length of the table's index files in bytes, which is an approximate value.
- `table_rows`: The table's total row number, which is an approximate value.
- `avg_row_length`: The average row length in bytes, which is an approximate value.
- `engine`: The storage engine of the table used.
- `version`:  Version. The value is `11` by default.
- `create_time`: The table created timestamp.
- `table_comment`: The table comment.
- Other columns such as `auto_increment`, `row_format` etc. are not supported, just for compatibility with MySQL. GreptimeDB may support some of them in the future.
