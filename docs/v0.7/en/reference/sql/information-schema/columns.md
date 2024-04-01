# COLUMNS

The `COLUMNS` provides detailed information about columns in tables.

```sql
USE INFORMATION_SCHEMA;
DESC COLUMNS;
```
The output is as follows:

```sql
+----------------+--------+------+------+---------+---------------+
| Column         | Type   | Key  | Null | Default | Semantic Type |
+----------------+--------+------+------+---------+---------------+
| table_catalog  | String |      | NO   |         | FIELD         |
| table_schema   | String |      | NO   |         | FIELD         |
| table_name     | String |      | NO   |         | FIELD         |
| column_name    | String |      | NO   |         | FIELD         |
| data_type      | String |      | NO   |         | FIELD         |
| semantic_type  | String |      | NO   |         | FIELD         |
| column_default | String |      | YES  |         | FIELD         |
| is_nullable    | String |      | NO   |         | FIELD         |
| column_type    | String |      | NO   |         | FIELD         |
| column_comment | String |      | YES  |         | FIELD         |
+----------------+--------+------+------+---------+---------------+
```
Create a table `public.t1` and query the information in the `COLUMNS` table:

```sql
CREATE TABLE public.t1 (h STRING, v FLOAT64, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX, PRIMARY KEY(h));
SELECT * FROM COLUMNS WHERE table_schema='public' AND TABLE_NAME='t1';
```

The output is as follows:

```sql
+---------------+--------------+------------+-------------+----------------------+---------------+---------------------+-------------+----------------------+----------------+
| table_catalog | table_schema | table_name | column_name | data_type            | semantic_type | column_default      | is_nullable | column_type          | column_comment |
+---------------+--------------+------------+-------------+----------------------+---------------+---------------------+-------------+----------------------+----------------+
| greptime      | public       | t1         | h           | String               | TAG           | NULL                | Yes         | String               | NULL           |
| greptime      | public       | t1         | v           | Float64              | FIELD         | NULL                | Yes         | Float64              | NULL           |
| greptime      | public       | t1         | ts          | TimestampMillisecond | TIMESTAMP     | current_timestamp() | No          | TimestampMillisecond | NULL           |
+---------------+--------------+------------+-------------+----------------------+---------------+---------------------+-------------+----------------------+----------------+
```

The description of columns in the `COLUMNS` table is as follows:

- `table_catalog`: The name of the catalog to which the table with the column belongs. The value is always `greptime`.
- `table_schema`: The name of the schema in which the table with the column is located.
- `table_name`: The name of the table with the column.
- `column_name`: The name of the column.
- `data_type`: The type of data in the column.
- `semantic_type`: The type of the column. It can be one of the following: `TAG`, `FIELD`, or `TIMESTAMP`.
- `column_default`: The default value of the column. If the explicit default value is `NULL`, or if the column definition does not include the `default` clause, this value is `NULL`.
- `is_nullable`: Whether the column is nullable. If the column can store null values, this value is `YES`; otherwise, it is `NO`.
- `column_type`: The data type of the column. It is the same as the `DATA_TYPE` column.
- `column_comment`: Comments contained in the column definition.

The corresponding `SHOW` statement is as follows:

```sql
SHOW COLUMNS FROM t1 FROM public;
```

The output is as follows:

```sql
+-------+----------------------+------+------------+---------------------+-------+
| Field | Type                 | Null | Key        | Default             | Extra |
+-------+----------------------+------+------------+---------------------+-------+
| h     | String               | Yes  | PRI        | NULL                |       |
| ts    | TimestampMillisecond | No   | TIME INDEX | current_timestamp() |       |
| v     | Float64              | Yes  |            | NULL                |       |
+-------+----------------------+------+------------+---------------------+-------+
3 rows in set (0.01 sec)
```
