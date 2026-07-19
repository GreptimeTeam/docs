---
keywords: [SQL DROP, DROP DATABASE, DROP TABLE, DROP VIEW, SQL syntax, SQL examples]
description: Covers the SQL DROP statement for removing databases, tables, flows, and views in GreptimeDB, including syntax, examples.
---

# DROP

## DROP DATABASE

`DROP DATABASE` drops a database. It removes the catalog entries for the database and deletes the directory containing the data.

:::danger Danger

`DROP DATABASE` cannot be undone. Use it with care!

:::

### Syntax

```sql
DROP DATABASE [ IF EXISTS ] db_name
```

- `IF EXISTS`: Do not throw an error if the database does not exist.
- `db_name`: The name of the database to remove.

### Examples

To drop a database named `test`:

```sql
DROP DATABASE test;
```


## DROP TABLE

`DROP TABLE` removes tables from the database. It will remove the table definition and all table data, indexes, rules, and constraints for that table. If [soft-drop](/user-guide/deployments-administration/manage-data/soft-drop.md) is enabled in a distributed cluster, supported tables are moved to the recycle bin and can be restored before the retention deadline.

:::danger Danger

Without soft-drop, `DROP TABLE` cannot be undone. Use it with care!

:::

### Syntax

```sql
DROP TABLE [ IF EXISTS ] table_name
```

- `IF EXISTS`: Do not throw an error if the table does not exist.
- `table_name`: The name of the table to remove.


### Examples

Drop the table `monitor` in the current database:
  
```sql
DROP TABLE monitor;
```

## UNDROP TABLE

`UNDROP TABLE` restores a soft-dropped table from the recycle bin.

### Syntax

```sql
UNDROP TABLE table_name
```

- `table_name`: The unqualified, schema-qualified, or fully qualified name of the table to restore.

`UNDROP TABLE` fails if a live table with the same full name already exists.

### Examples

Restore the table `monitor` in the current database:

```sql
UNDROP TABLE monitor;
```

Restore a table by its fully qualified name:

```sql
UNDROP TABLE greptime.public.monitor;
```


## DROP FLOW

```sql
DROP FLOW [ IF EXISTS ] flow_name;
```

- `IF EXISTS`: Do not throw an error if the flow does not exist.
- `flow_name`: The name of the flow to destroy.

```sql
DROP FLOW IF EXISTS test_flow;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## DROP VIEW

```sql
DROP VIEW [ IF EXISTS ] view_name;
```

- `IF EXISTS`: Do not throw an error if the view does not exist.
- `view_name`: The name of the view to remove.

```sql
DROP VIEW IF EXISTS test_view;
```

```
Query OK, 0 rows affected (0.00 sec)
```

## DROP TRIGGER

Please refer to the [Trigger syntax](/reference/sql/trigger-syntax.md#drop-trigger) documentation.

