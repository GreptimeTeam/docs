# TABLES

`TABLES` 表提供数据库中表的信息：

```sql
USE INFORMATION_SCHEMA;
DESC TABLES;
```

结果如下：

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
- `engine`：该表使用的存储引擎。
