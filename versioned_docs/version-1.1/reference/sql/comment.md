---
keywords: [SQL COMMENT, COMMENT ON TABLE, COMMENT ON COLUMN, COMMENT ON FLOW, SQL syntax, SQL examples]
description: Covers the SQL COMMENT statement for adding or removing comments on tables, columns, and flows in GreptimeDB, including syntax and examples.
---

# COMMENT

The `COMMENT` statement is used to add or remove comments on tables, columns, and flows. Comments provide descriptions that can help document the purpose and usage of database objects.

## COMMENT ON TABLE

`COMMENT ON TABLE` adds or removes a comment on a table.

### Syntax

```sql
COMMENT ON TABLE table_name IS { 'comment' | NULL }
```

- `table_name`: The name of the table to comment on.
- `'comment'`: A string literal containing the comment text.
- `NULL`: Removes the existing comment from the table.

### Examples

Add a comment to a table:

```sql
COMMENT ON TABLE system_metrics IS 'System monitoring metrics collected every minute';
```

Remove a comment from a table:

```sql
COMMENT ON TABLE system_metrics IS NULL;
```

View the table comment using `SHOW CREATE TABLE`:

```sql
SHOW CREATE TABLE system_metrics;
```

The comment can also be viewed through the `INFORMATION_SCHEMA.TABLES` table by querying the `table_comment` column.

## COMMENT ON COLUMN

`COMMENT ON COLUMN` adds or removes a comment on a specific column of a table.

### Syntax

```sql
COMMENT ON COLUMN table_name.column_name IS { 'comment' | NULL }
```

- `table_name`: The name of the table containing the column.
- `column_name`: The name of the column to comment on.
- `'comment'`: A string literal containing the comment text.
- `NULL`: Removes the existing comment from the column.

### Examples

Add a comment to a column:

```sql
COMMENT ON COLUMN system_metrics.cpu_usage IS 'CPU usage percentage (0-100)';
```

Add comments to multiple columns:

```sql
COMMENT ON COLUMN system_metrics.memory_usage IS 'Memory usage in bytes';
COMMENT ON COLUMN system_metrics.disk_usage IS 'Disk usage percentage';
```

Remove a comment from a column:

```sql
COMMENT ON COLUMN system_metrics.cpu_usage IS NULL;
```

View column comments using `SHOW CREATE TABLE`:

```sql
SHOW CREATE TABLE system_metrics;
```

Column comments can also be queried from the `INFORMATION_SCHEMA.COLUMNS` table by accessing the `column_comment` column.

## COMMENT ON FLOW

`COMMENT ON FLOW` adds or removes a comment on a flow.

### Syntax

```sql
COMMENT ON FLOW flow_name IS { 'comment' | NULL }
```

- `flow_name`: The name of the flow to comment on.
- `'comment'`: A string literal containing the comment text.
- `NULL`: Removes the existing comment from the flow.

### Examples

Add a comment to a flow:

```sql
COMMENT ON FLOW temperature_monitoring IS 'Monitors temperature sensors and alerts on high values';
```

Remove a comment from a flow:

```sql
COMMENT ON FLOW temperature_monitoring IS NULL;
```

View the flow comment using `SHOW CREATE FLOW`:

```sql
SHOW CREATE FLOW temperature_monitoring;
```

Flow comments can also be queried from the `INFORMATION_SCHEMA.FLOWS` table by accessing the `comment` column.

## Notes

- Comments are stored as metadata and do not affect the behavior or performance of tables, columns, or flows.
- Comments can be updated by issuing a new `COMMENT ON` statement with a different comment text.
- Setting a comment to `NULL` removes the existing comment but does not generate an error if no comment exists.
- Comments are particularly useful for documenting the purpose of database objects, especially in collaborative environments.
