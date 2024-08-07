# SCHEMATA

`SCHEMATA` 表提供数据库的相关信息。表数据等同于 `SHOW DATABASES` 语句的结果。

```sql
USE INFORMATION_SCHEMA;
DESC SCHEMATA;
```

结果如下：

```sql
+----------------------------+--------+------+------+---------+---------------+
| Column                     | Type   | Key  | Null | Default | Semantic Type |
+----------------------------+--------+------+------+---------+---------------+
| catalog_name               | String |      | NO   |         | FIELD         |
| schema_name                | String |      | NO   |         | FIELD         |
| default_character_set_name | String |      | NO   |         | FIELD         |
| default_collation_name     | String |      | NO   |         | FIELD         |
| sql_path                   | String |      | YES  |         | FIELD         |
+----------------------------+--------+------+------+---------+---------------+
5 rows in set (0.00 sec)
```

```sql
SELECT * FROM SCHEMATA;
```

```sql
+--------------+--------------------+----------------------------+------------------------+----------+
| catalog_name | schema_name        | default_character_set_name | default_collation_name | sql_path |
+--------------+--------------------+----------------------------+------------------------+----------+
| greptime     | greptime_private   | utf8                       | utf8_bin               | NULL     |
| greptime     | information_schema | utf8                       | utf8_bin               | NULL     |
| greptime     | public             | utf8                       | utf8_bin               | NULL     |
+--------------+--------------------+----------------------------+------------------------+----------+
3 rows in set (0.01 sec)
```

`SCHEMATA` 表中的字段描述如下：

- `catalog_name`：数据库所属的目录。
- `schema_name`：数据库的名称。
- `default_character_set_name`：数据库的默认字符集。
- `default_collation_name`：数据库的默认排序规则。
- `sql_path`：该项的值始终为 `NULL`。
