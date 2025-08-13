---
keywords: [SQL TRUNCATE, delete all data, TRUNCATE TABLE, SQL syntax, efficient deletion]
description: Details the TRUNCATE TABLE statement in SQL, used for efficiently deleting all data from a table, with syntax and example.
---

# TRUNCATE

The `TRUNCATE TABLE table` statement is used to delete all data from a table. It's much more efficient than `DELETE FROM table`.

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```

