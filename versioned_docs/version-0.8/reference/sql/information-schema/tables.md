# TABLES

The `TABLES` table provides information about tables in databases:

```sql
USE INFORMATION_SCHEMA;
DESC TABLES;
```

The output is as follows:

```sql
+---------------+--------+------+------+---------+---------------+
| Column        | Type   | Key  | Null | Default | Semantic Type |
+---------------+--------+------+------+---------+---------------+
| table_catalog | String |      | NO   |         | FIELD         |
| table_schema  | String |      | NO   |         | FIELD         |
| table_name    | String |      | NO   |         | FIELD         |
| table_type    | String |      | NO   |         | FIELD         |
| table_id      | UInt32 |      | YES  |         | FIELD         |
| engine        | String |      | YES  |         | FIELD         |
+---------------+--------+------+------+---------+---------------+
6 rows in set (0.00 sec)
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
     table_id: 1025
       engine: mito
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
- `engine`: The storage engine of the table used.
