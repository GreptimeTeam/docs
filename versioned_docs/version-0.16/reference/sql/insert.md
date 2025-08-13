---
keywords: [SQL INSERT, SQL syntax, SQL examples, inserting records, SQL data manipulation]
description: Describes the SQL INSERT statement for adding records to a table in GreptimeDB, including syntax, examples for inserting single and multiple records, default values, binary data, special numeric values, and the INSERT INTO SELECT statement.
---

# INSERT

The `INSERT` statement is used to insert one or more records into a table in the GreptimeDB.

## `INSERT INTO` Statement

### Syntax

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

The following types of values are supported:

- The `DEFAULT` keyword specifies that the default value for that column should be inserted.
This is useful when you do not want to explicitly specify values for some columns when inserting records.
It allows the column's default value, as defined in the table schema, to be used instead.
If no default value is defined for the column, the database's default value will be used (often NULL).
- Use hexadecimal literal to insert a literal binary.
- use the `{Value}::{Type}` syntax to cast the special numeric values `Infinity`, `-Infinity`, and `NaN` into the desired numeric type.

### Examples

#### Insert Data

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

#### Insert Data with Default Values

The following sql statement use `DEFAULT` keyword to insert the default value for the `cpu_util` column:

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES ("host1", "idc_a", DEFAULT, 10.3, 10.3, 1667446797460);
```

#### Insert Binary Data

When we want to insert binary data which their column datatypes are `blob` or `bytea`:

```sql
CREATE TABLE test(b BLOB, ts TIMESTAMP TIME INDEX);
```

Recommend using the prepared statement, JDBC for example:

```java
  PreparedStatement pstmt = conn.prepareStatement("insert into test values(?,?)");
  pstmt.setBytes(1, "hello".getBytes());
  pstmt.setInt(2, 1687867163);
  pstmt.addBatch();
  ......
  pstmt.executeBatch();
```

If we want to insert a literal binary, we can insert a hexadecimal literal:

```sql
INSERT INTO test VALUES(X'9fad5e9eefdfb449', 1687867163);
-- or --
INSERT INTO test VALUES(0x9fad5e9eefdfb449', 1687867163);
```

#### Insert Special Numeric Values

Use `{Value}::{Type}` to cast `Infinity`, `-Infinity`, and `NaN` into the desired numeric type:

```sql
INSERT INTO system_metrics (host, idc, cpu_util, memory_util, disk_util, ts)
VALUES ("host1", "idc_a", 66.6, 'NaN'::double, 'Infinity'::double, 1667446797460);
```

## `INSERT INTO SELECT` Statement

The statement copies data from one table and inserts it into another table.

### Syntax

The syntax for the `INSERT INTO SELECT` statement is as follows:

```sql
INSERT INTO table2 (column1, column2, ...)
SELECT column1, column2, ...
FROM table1;
```

In the above syntax, `table1` is the source table from which you want to copy data, and `table2` is the target table
into which the data will be inserted.
`table1` and `table2` should have the same names and data types for the columns that you want to copy.
The `SELECT` statement selects the columns you want to insert from the source
table. If you do not specify the column names in the `INSERT INTO` statement, then the data will be inserted into
all columns in the target table.

The `INSERT INTO SELECT` statement is useful when you want to copy data from one table to another, for example when
archiving or backing up data. It is more efficient than creating a backup of the entire database and restoring it.

### Examples

Here is an example of an `INSERT INTO SELECT` statement:

```sql
INSERT INTO system_metrics2 (host, idc, cpu_util, memory_util, disk_util, ts)
SELECT host, idc, cpu_util, memory_util, disk_util, ts
FROM system_metrics;
```
