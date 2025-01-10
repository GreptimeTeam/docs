---
keywords: [databases, catalog, schema, character set, collation, options]
description: Provides information about databases, including details about each database's catalog, schema name, default character set, collation, and options.
---

# SCHEMATA

The `SCHEMATA` table provides information about databases. The table data is equivalent to the result of the `SHOW DATABASES` statement.

```sql
USE INFORMATION_SCHEMA;
DESC SCHEMATA;
```

The output is as follows:

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

Fields in the `SCHEMATA` table are described as follows:

- `catalog_name`: The catalog to which the database belongs.
- `schema_name`: The name of the database.
- `default_character_set_name`: The default character set of the database.
- `default_collation_name`: The default collation of the database.
- `sql_path`: The value of this item is always `NULL`.
- `options`:  Extending column in GreptimeDB. The database options.
