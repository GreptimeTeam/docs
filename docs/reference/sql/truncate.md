---
keywords: [SQL TRUNCATE, delete all data, TRUNCATE TABLE, SQL syntax, efficient deletion]
description: Describes the TRUNCATE TABLE statement for efficiently removing all rows while retaining the table definition.
---

# TRUNCATE

`TRUNCATE TABLE` removes all rows from a table while retaining its definition. It is much more efficient than `DELETE FROM table`.

By default, `TRUNCATE TABLE` waits for the operation to complete and times out after 60 seconds. Use `WITH` to set the `wait` and `timeout` options:

```sql
TRUNCATE TABLE monitor WITH (wait = false, timeout = '30s');
```

- `wait` defaults to `true`. When `true`, the statement waits for completion and returns `Affected Rows: 0`. When `false`, it returns a Procedure ID after the operation is submitted successfully; the operation continues in the background.
- `timeout` sets the time limit for metadata checks, submission, and, when `wait` is `true`, waiting for completion. It defaults to `60s`. A timeout returns an error; if the operation has already been submitted, it is not canceled and continues in the background.

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```
