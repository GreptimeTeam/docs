---
keywords: [views, information schema, SQL, database views, view properties]
description: Provides a list of views that the current user has visibility of, including details about each view's catalog, schema, name, definition, and other properties.
---

# VIEWS

The `VIEWS` table provides a list of views that the current user has visibility of.

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

The columns in table:

* `table_catalog`: The name of the catalog to which the view belongs. 
* `table_schema`: The name of the database to which the view belongs.
* `table_name`: The view name.
* `view_definition`: The definition of view, which is made by the `SELECT` statement when the view is created.
* `check_option`: Doesn't support, is always `NULL`.
* `is_updatable`: Whether `UPDATE/INSERT/DELETE` is applicable to the view, always `NO`.
* `definer`: The name of the user who creates the view.
* `security_type`: Doesn't support, is always `NULL`.
* `character_set_client`: The value of the `character_set_client` session variable when the view is created, is always `utf8`.
* `collation_connection`: The value of the `collation_connection` session variable when the view is created, is always `utf8_bin`.
