# COLUMNS

`COLUMNS` 提供了关于表中每列的详细信息。

```sql
USE INFORMATION_SCHEMA;
DESC COLUMNS;
```

结果如下：

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

创建表 `public.t1` 并查询其在 `COLUMNS` 中的信息：

```sql
CREATE TABLE public.t1 (h STRING, v FLOAT64, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX, PRIMARY KEY(h));
SELECT * FROM COLUMNS WHERE table_schema='public' AND TABLE_NAME='t1'\G
```

结果如下：

```sql
*************************** 1. row ***************************
 table_catalog: greptime
  table_schema: public
    table_name: t1
   column_name: h
     data_type: String
 semantic_type: TAG
column_default: NULL
   is_nullable: Yes
   column_type: String
column_comment: NULL
*************************** 2. row ***************************
 table_catalog: greptime
  table_schema: public
    table_name: t1
   column_name: v
     data_type: Float64
 semantic_type: FIELD
column_default: NULL
   is_nullable: Yes
   column_type: Float64
column_comment: NULL
*************************** 3. row ***************************
 table_catalog: greptime
  table_schema: public
    table_name: t1
   column_name: ts
     data_type: TimestampMillisecond
 semantic_type: TIMESTAMP
column_default: current_timestamp()
   is_nullable: No
   column_type: TimestampMillisecond
column_comment: NULL
3 rows in set (0.01 sec)
```

`COLUMNS` 表中列的描述如下：

- `table_catalog`：列所属的目录的名称。该值始终为 `greptime`。
- `table_schema`：包含列的表所属的数据库的名称。
- `table_name`：包含列的表的名称。
- `column_name`：列的名称。
- `data_type`：列中的数据类型。
- `semantic_type`：列的类型。可以是以下之一：`TAG`、`FIELD` 或 `TIMESTAMP`。
- `column_default`：列的默认值。如果默认值被明确设定为 `NULL`，或者列定义中不包含 `default` 子句，则该值为 `NULL`。
- `is_nullable`：列是否可为空。如果列可以存储空值，则该值为 `YES`；否则，为 `NO`。
- `column_type`：列的数据类型。与 `DATA_TYPE` 列相同。
- `column_comment`：列定义中包含的注释。

相应的 `SHOW` 语句如下：

```sql
SHOW COLUMNS FROM t1 FROM public;
```

结果如下：

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
