---
keywords: [SQL TRUNCATE, delete all data, TRUNCATE TABLE, SQL syntax, efficient deletion]
description: Describes the TRUNCATE TABLE statement for efficiently removing all rows while retaining the table definition.
---

# TRUNCATE

`TRUNCATE TABLE` removes all rows from a table while retaining its definition. It is much more efficient than `DELETE FROM table`.

## Syntax

```sql
TRUNCATE [TABLE] table_name [ WITH (WAIT = ..., TIMEOUT = '...') ]
```

`WAIT` and `TIMEOUT` are both optional and can be specified independently.

- `table_name`: The name of the table to truncate.
- `WAIT`: Whether to wait for completion. Defaults to `true`. When `true`, the statement waits for completion and reports zero affected rows. When `false`, it returns a result set with a single `Procedure ID` column after successful submission, and the operation continues in the background. Use the returned `procedure_id` with `ADMIN procedure_state(procedure_id)` to check its status (see [ADMIN](/reference/sql/admin.md)).
- `TIMEOUT`: The total time limit for metadata checks, submission, and, when `WAIT` is `true`, waiting for completion. Defaults to `'60s'`. It does not limit the execution time of the truncate operation itself. On timeout, the statement returns an error; an already-submitted operation is not canceled and continues in the background.

## Examples

Truncate the table `monitor` and wait for completion:

```sql
TRUNCATE TABLE monitor;
```

```sql
Query OK, 0 rows affected (0.02 sec)
```

Submit the operation without waiting for completion, with a 30-second timeout for metadata checks and submission:

```sql
TRUNCATE TABLE monitor WITH (WAIT = false, TIMEOUT = '30s');
```
