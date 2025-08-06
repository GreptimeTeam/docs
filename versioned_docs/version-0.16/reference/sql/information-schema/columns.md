---
keywords: [table schema, column attributes, SQL information schema, column details]
description: Provides detailed information about columns in tables, including column names, data types, default values, and other attributes.
---

# COLUMNS

The `COLUMNS` provides detailed information about columns in tables.

```sql
USE INFORMATION_SCHEMA;
DESC COLUMNS;
```
The output is as follows:

```sql
+--------------------------+--------+------+------+---------+---------------+
| Column                   | Type   | Key  | Null | Default | Semantic Type |
+--------------------------+--------+------+------+---------+---------------+
| table_catalog            | String |      | NO   |         | FIELD         |
| table_schema             | String |      | NO   |         | FIELD         |
| table_name               | String |      | NO   |         | FIELD         |
| column_name              | String |      | NO   |         | FIELD         |
| ordinal_position         | Int64  |      | NO   |         | FIELD         |
| character_maximum_length | Int64  | YES  |         | FIELD         |
| character_octet_length   | Int64  | YES  |         | FIELD         |
| numeric_precision        | Int64  | YES  |         | FIELD         |
| numeric_scale            | Int64  | YES  |         | FIELD         |
| datetime_precision       | Int64  | YES  |         | FIELD         |
| character_set_name       | String |      | YES  |         | FIELD         |
| collation_name           | String |      | YES  |         | FIELD         |
| column_key               | String |      | NO   |         | FIELD         |
| extra                    | String |      | NO   |         | FIELD         |
| privileges               | String |      | NO   |         | FIELD         |
| generation_expression    | String |      | NO   |         | FIELD         |
| greptime_data_type       | String |      | NO   |         | FIELD         |
| data_type                | String |      | NO   |         | FIELD         |
| semantic_type            | String |      | NO   |         | FIELD         |
| column_default           | String |      | YES  |         | FIELD         |
| is_nullable              | String |      | NO   |         | FIELD         |
| column_type              | String |      | NO   |         | FIELD         |
| column_comment           | String |      | YES  |         | FIELD         |
| srs_id                   | Int64  |      | YES  |         | FIELD         |
+--------------------------+--------+------+------+---------+---------------+
24 rows in set (0.00 sec)
```
Create a table `public.t1` and query the information in the `COLUMNS` table:

```sql
CREATE TABLE public.t1 (h STRING, v FLOAT64, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX, PRIMARY KEY(h));
SELECT * FROM COLUMNS WHERE table_schema='public' AND TABLE_NAME='t1'\G
```

The output is as follows:

```sql
*************************** 1. row ***************************
           table_catalog: greptime
            table_schema: public
              table_name: t1
             column_name: h
        ordinal_position: 1
character_maximum_length: 2147483647
  character_octet_length: 2147483647
       numeric_precision: NULL
           numeric_scale: NULL
      datetime_precision: NULL
      character_set_name: utf8
          collation_name: utf8_bin
              column_key: PRI
                   extra:
              privileges: select,insert
   generation_expression:
      greptime_data_type: String
               data_type: string
           semantic_type: TAG
          column_default: NULL
             is_nullable: Yes
             column_type: string
          column_comment: NULL
                  srs_id: NULL
*************************** 2. row ***************************
           table_catalog: greptime
            table_schema: public
              table_name: t1
             column_name: v
        ordinal_position: 2
character_maximum_length: NULL
  character_octet_length: NULL
       numeric_precision: 22
           numeric_scale: NULL
      datetime_precision: NULL
      character_set_name: NULL
          collation_name: NULL
              column_key:
                   extra:
              privileges: select,insert
   generation_expression:
      greptime_data_type: Float64
               data_type: double
           semantic_type: FIELD
          column_default: NULL
             is_nullable: Yes
             column_type: double
          column_comment: NULL
                  srs_id: NULL
*************************** 3. row ***************************
           table_catalog: greptime
            table_schema: public
              table_name: t1
             column_name: ts
        ordinal_position: 3
character_maximum_length: NULL
  character_octet_length: NULL
       numeric_precision: NULL
           numeric_scale: NULL
      datetime_precision: 3
      character_set_name: NULL
          collation_name: NULL
              column_key: TIME INDEX
                   extra:
              privileges: select,insert
   generation_expression:
      greptime_data_type: TimestampMillisecond
               data_type: timestamp(3)
           semantic_type: TIMESTAMP
          column_default: current_timestamp()
             is_nullable: No
             column_type: timestamp(3)
          column_comment: NULL
                  srs_id: NULL
3 rows in set (0.03 sec)
```

The description of columns in the `COLUMNS` table is as follows:

- `table_catalog`: The name of the catalog to which the table with the column belongs. The value is always `greptime` in OSS project.
- `table_schema`: The name of the database in which the table with the column is located.
- `table_name`: The name of the table with the column.
- `column_name`: The name of the column.
- `ordinal_position`: The position of the column in the table.
- `character_maximum_length`: For string columns, the maximum length in characters.
- `character_octet_length`: For string columns, the maximum length in bytes.
- `numeric_precision`: The precision of the column for numeric data types.
- `numeric_scale`: The scale of the column for numeric data types.
- `datetime_precision`: The fractional seconds precision of the column for datetime data types.
- `character_set_name`: The name of the character set of a string column.
- `collation_name`: The name of the collation of a string column.
- `column_key`: The key type of the column. It can be one of the following: `PRI`, `TIME INDEX`, or an empty string.
- `extra`: Additional information about the column.
- `privileges`: The privilege that the current user has on this column.
- `generation_expression`: For generated columns, this value displays the expression used to calculate the column value. For non-generated columns, the value is empty.
- `greptime_data_type`: The GreptimeDB [data type](/reference/sql/data-types.md) of the column.
- `data_type`: The type of data in the column.
- `semantic_type`: The type of the column. It can be one of the following: `TAG`, `FIELD`, or `TIMESTAMP`.
- `column_default`: The default value of the column. If the explicit default value is `NULL`, or if the column definition does not include the `default` clause, this value is `NULL`.
- `is_nullable`: Whether the column is nullable. If the column can store null values, this value is `YES`; otherwise, it is `NO`.
- `column_type`: The data type of the column. It is the same as the `DATA_TYPE` column.
- `column_comment`: Comments contained in the column definition.
- `srs_id`: The ID of the spatial reference system (SRS) of the column.

The corresponding `SHOW` statement is as follows:

```sql
SHOW COLUMNS FROM t1 FROM public;
```

The output is as follows:

```sql
+-------+--------------+------+------------+---------------------+-------+----------------------+
| Field | Type         | Null | Key        | Default             | Extra | Greptime_type        |
+-------+--------------+------+------------+---------------------+-------+----------------------+
| h     | string       | Yes  | PRI        | NULL                |       | String               |
| ts    | timestamp(3) | No   | TIME INDEX | current_timestamp() |       | TimestampMillisecond |
| v     | double       | Yes  |            | NULL                |       | Float64              |
+-------+--------------+------+------------+---------------------+-------+----------------------+
3 rows in set (0.01 sec)
```
