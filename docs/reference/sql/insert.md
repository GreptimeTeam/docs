# Inserting data into a table
The `INSERT INTO` statement is used to insert one or more records into a table in the GreptimeDB.

## Syntax
The syntax for the INSERT INTO statement is as follows:

```sql
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, value2, value3, ...);
```

In the above syntax, `table_name` is the name of the table into which you want to insert data,
and `column1`, `column2`, `column3`, etc. are the names of the columns in the table.
You can specify the columns in the `INSERT INTO` statement if you want to insert data into specific columns.
If you do not specify the columns, the values will be inserted into all the columns in the table.

The `VALUES` keyword is followed by a list of values that correspond to the columns in the `INSERT INTO`
statement. The values must be in the same order as the columns.

## Examples
Here is an example of an `INSERT INTO` statement that inserts a record into a table named `system_metrics`:

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797462);
```

This statement inserts a record with the host "host1", idc "idc_b", cpu_util 50.0, memory_util 66.7,
disk_util 40.6, ts 1667446797462 into the `system_metrics` table.

You can also use the `INSERT INTO` statement to insert multiple records into a table at the same time.
Here is an example of an `INSERT INTO` statement that inserts multiple records into the `system_metrics` table:

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797460),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797461),
    ("host1", "idc_c", 50.1, 66.8, 40.8, 1667446797463);
```

This statement inserts three records into the `system_metrics` table with the specified values for each column.

# Inserting data from another table
The `INSERT INTO SELECT` statement copies data from one table and inserts it into another table.

## Syntax
The syntax for the `INSERT INTO SELECT` statement is as follows:

```sql
INSERT INTO table2 (column1, column2, ...)
SELECT column1, column2, ...
FROM table1;
```

In the above syntax, `table1` is the source table from which you want to copy data, and `table2` is the target table
into which the data will be inserted. The `SELECT` statement selects the columns you want to insert from the source
table. If you do not specify the column names in the `INSERT INTO` statement, then the data will be inserted into
all columns in the target table.

The `INSERT INTO SELECT` statement is useful when you want to copy data from one table to another, for example when
archiving or backing up data. It is more efficient than creating a backup of the entire database and restoring it.

## Examples
Here is an example of an `INSERT INTO SELECT` statement:

```sql
INSERT INTO system_metrics2 (host, idc, cpu_util, memory_util, disk_util, ts)
SELECT host, idc, cpu_util, memory_util, disk_util, ts
FROM system_metrics;
```

# Inserting data with default values
This statement inserts a new record into the table and uses the DEFAULT values for some columns.

## Syntax

```sql
INSERT INTO table_name (column1, column2, column3, ...)
VALUES (value1, DEFAULT, value3, ...);
```

The DEFAULT keyword specifies that the default value for that column should be inserted.
This is useful when you do not want to explicitly specify values for some columns when inserting records.
It allows the column's default value, as defined in the table schema, to be used instead.
If no default value is defined for the column, the database's default value will be used (often NULL).

## Examples

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES ("host1", "idc_a", DEFAULT, 10.3, 10.3, 1667446797460);
```
