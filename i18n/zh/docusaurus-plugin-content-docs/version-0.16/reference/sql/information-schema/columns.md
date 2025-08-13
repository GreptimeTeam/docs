---
keywords: [COLUMNS 表, 列信息, SQL查询, 数据库列, 表结构]
description: COLUMNS 表提供关于表中每列的详细信息。
---

# COLUMNS

`COLUMNS` 提供了关于表中每列的详细信息。

```sql
USE INFORMATION_SCHEMA;
DESC COLUMNS;
```

结果如下：

```sql
+--------------------------+--------+------+------+---------+---------------+
| Column                   | Type   | Key  | Null | Default | Semantic Type |
+--------------------------+--------+------+------+---------+---------------+
| table_catalog            | String |      | NO   |         | FIELD         |
| table_schema             | String |      | NO   |         | FIELD         |
| table_name               | String |      | NO   |         | FIELD         |
| column_name              | String |      | NO   |         | FIELD         |
| ordinal_position         | Int64  |      | NO   |         | FIELD         |
| character_maximum_length | Int64  |      | YES  |         | FIELD         |
| character_octet_length   | Int64  |      | YES  |         | FIELD         |
| numeric_precision        | Int64  |      | YES  |         | FIELD         |
| numeric_scale            | Int64  |      | YES  |         | FIELD         |
| datetime_precision       | Int64  |      | YES  |         | FIELD         |
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

`COLUMNS` 表中列的描述如下：

- `table_catalog`：列所属的目录的名称。在 OSS 项目中该值始终为 `greptime`。
- `table_schema`：包含列的表所属的数据库的名称。
- `table_name`：包含列的表的名称。
- `column_name`：列的名称。
- `ordinal_position`：列在表中的位置。
- `character_maximum_length`：对于字符串列，以字符为单位的最大长度。
- `character_octet_length`：对于字符串列，以字节为单位的最大长度。
- `numeric_precision`：对于数值数据类型，列的精度。
- `numeric_scale`：对于数值数据类型，列的标度。
- `datetime_precision`：对于日期时间数据类型，列的小数秒精度。
- `character_set_name`：字符串列的字符集的名称。
- `collation_name`：字符串列的排序规则的名称。
- `column_key`：列的键类型。可以是以下之一：`PRI`、`TIME INDEX` 或空字符串。
- `extra`：关于列的附加信息。
- `privileges`：当前用户对该列的权限。
- `generation_expression`：对于生成的列，此值显示用于计算列值的表达式。对于非生成的列，该值为空。
- `greptime_data_type`：列的 GreptimeDB [数据类型](/reference/sql/data-types.md)。
- `data_type`：列中的数据类型。
- `semantic_type`：列的类型。可以是以下之一：`TAG`、`FIELD` 或 `TIMESTAMP`。
- `column_default`：列的默认值。如果默认值被明确设定为 `NULL`，或者列定义中不包含 `default` 子句，则该值为 `NULL`。
- `is_nullable`：列是否可为空。如果列可以存储空值，则该值为 `YES`；否则，为 `NO`。
- `column_type`：列的数据类型。与 `DATA_TYPE` 列相同。
- `column_comment`：列定义中包含的注释。
- `srs_id`：列的空间参考系统（SRS）的 ID。

相应的 `SHOW` 语句如下：

```sql
SHOW COLUMNS FROM t1 FROM public;
```

结果如下：

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
