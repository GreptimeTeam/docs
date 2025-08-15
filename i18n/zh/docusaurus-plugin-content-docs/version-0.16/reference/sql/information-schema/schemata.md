---
keywords: [数据库信息, SCHEMATA 表, SHOW DATABASES, 字段描述, 数据库目录]
description: SCHEMATA 表提供数据库的相关信息及其字段描述。
---

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
| options                    | String |      | YES  |         | FIELD         |
+----------------------------+--------+------+------+---------+---------------+
```

```sql
SELECT * FROM SCHEMATA;
```

```sql
+--------------+--------------------+----------------------------+------------------------+----------+-------------+
| catalog_name | schema_name        | default_character_set_name | default_collation_name | sql_path | options     |
+--------------+--------------------+----------------------------+------------------------+----------+-------------+
| greptime     | greptime_private   | utf8                       | utf8_bin               | NULL     |             |
| greptime     | information_schema | utf8                       | utf8_bin               | NULL     |             |
| greptime     | public             | utf8                       | utf8_bin               | NULL     |             |
| greptime     | test               | utf8                       | utf8_bin               | NULL     | ttl='7days' |
+--------------+--------------------+----------------------------+------------------------+----------+-------------+
```

`SCHEMATA` 表中的字段描述如下：

- `catalog_name`：数据库所属的目录。
- `schema_name`：数据库的名称。
- `default_character_set_name`：数据库的默认字符集。
- `default_collation_name`：数据库的默认排序规则。
- `sql_path`：该项的值始终为 `NULL`。
- `options`: GreptimeDB 扩展字段，数据库的配置参数。
