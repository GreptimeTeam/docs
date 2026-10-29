---
keywords: [SQL REPLACE, SQL syntax, SQL examples, inserting records, SQL data manipulation]
description: Describes the SQL REPLACE statement for adding records to a table in GreptimeDB, including syntax, examples for inserting single and multiple records.
---

# REPLACE

The `REPLACE` statement is used to insert new records into a table. In GreptimeDB, this statement is exactly the same as the `INSERT` statement. Please refer to [`INSERT`](/reference/sql/insert.md) for more details.

## `REPLACE INTO` Statement

### Syntax

The syntax for the REPLACE INTO statement is as follows:

```sql
REPLACE INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```

### Examples

Here is an example of an `REPLACE INTO` statement that inserts a record into a table named `system_metrics`:

```sql
REPLACE INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797462);
```

Here is an example of an `REPLACE INTO` statement that inserts multiple records into the `system_metrics` table:

```sql
REPLACE INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797460),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797461),
    ("host1", "idc_c", 50.1, 66.8, 40.8, 1667446797463);
```
