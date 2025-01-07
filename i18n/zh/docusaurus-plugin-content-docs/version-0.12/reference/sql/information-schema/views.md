---
keywords: [视图, VIEWS 表, SQL 视图, 数据库视图, 视图定义, 视图字段]
description: VIEWS 表提供当前用户可见的视图列表及其字段描述。
---

# VIEWS

`VIEWS` 表提供了当前用户可见的视图（View）列表。

```sql
DESC TABLE INFORMATION_SCHEMA.VIEWS;
```

```sql
+----------------------+---------+------+------+---------+---------------+
| Column               | Type    | Key  | Null | Default | Semantic Type |
+----------------------+---------+------+------+---------+---------------+
| table_catalog        | String  |      | NO   |         | FIELD         |
| table_schema         | String  |      | NO   |         | FIELD         |
| table_name           | String  |      | NO   |         | FIELD         |
| view_definition      | String  |      | NO   |         | FIELD         |
| check_option         | String  |      | YES  |         | FIELD         |
| is_updatable         | Boolean |      | YES  |         | FIELD         |
| definer              | String  |      | YES  |         | FIELD         |
| security_type        | String  |      | YES  |         | FIELD         |
| character_set_client | String  |      | YES  |         | FIELD         |
| collation_connection | String  |      | YES  |         | FIELD         |
+----------------------+---------+------+------+---------+---------------+
```

表中的列：

* `table_catalog`: 视图所属 catalog 的名称。
* `table_schema`: 视图所属数据库的名称。
* `table_name`: 视图名称。
* `view_definition`: 视图的定义，即创建视图时的 `SELECT` 语句。
* `check_option`: 不支持，始终为 `NULL`。
* `is_updatable`: 视图是否可以进行 `UPDATE/INSERT/DELETE` 操作，始终为 `NO`。
* `definer`: 创建视图的用户的名称。
* `security_type`: 不支持，始终为 `NULL`。
* `character_set_client`: 创建视图时 `character_set_client` 会话变量的值，始终为 `utf8`。
* `collation_connection`: 创建视图时 `collation_connection` 会话变量的值，始终为 `utf8_bin`。
