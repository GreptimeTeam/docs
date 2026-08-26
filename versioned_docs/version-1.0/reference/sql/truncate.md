---
keywords: [SQL TRUNCATE, delete all data, TRUNCATE TABLE, SQL syntax, efficient deletion]
description: Describes the TRUNCATE TABLE statement for efficiently removing all rows while retaining the table definition.
---

# TRUNCATE

`TRUNCATE TABLE` removes all rows from a table while retaining its definition. It is much more efficient than `DELETE FROM table`.

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```
