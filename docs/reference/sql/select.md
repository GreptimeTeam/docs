---
description: Describes the SELECT statement in SQL for retrieving data from tables, including syntax, filtering with WHERE, limiting results with LIMIT, joining tables, and grouping results with GROUP BY.
---

# SELECT

The `SELECT` statement allows you to specify a list of columns and expressions to be selected from
one or more tables.

## Basic Syntax

The basic syntax for a `SELECT` statement is as follows:

```sql
SELECT column1, column2, ...
FROM table_name;
```

Here, column1, column2, etc. refer to the names of the columns from which we want to retrieve data,
and table_name refers to the name of the table from which we want to retrieve the data.

This statement selects all the columns from the table specified in the
`FROM` clause. If you want to select all columns from the table, you can use the asterisk (*) wildcard
character instead of listing individual columns.

```sql
SELECT *
FROM table_name;
```

## Filtering SELECT Statements with WHERE Clause

The WHERE clause is used to filter the results of a `SELECT` statement based on a specified condition. The
syntax for using WHERE clause is as follows:

```sql
SELECT column1, column2, ..., columnN
FROM table_name
WHERE condition;
```

Here, the condition is an expression that evaluates to either true or false. Only the rows that satisfy the condition will be included in the result set.

## Examples of WHERE Clause

```sql
-- Select all rows from the system_metrics table where idc is 'idc0'
SELECT *
FROM system_metrics
WHERE idc = 'idc0';

-- Select all rows from the system_metrics table where the idc is 'idc0' or 'idc0'
SELECT *
FROM system_metrics
WHERE idc IN ('idc0', 'idc1');
```

## SELECT Statements with LIMIT Clause

The `LIMIT` clause is used to limit the number of rows returned by a SELECT statement. The syntax for using
`LIMIT` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

Here, the number_of_rows parameter specifies the maximum number of rows to return.

## Examples of LIMIT Clause

Here are some examples of using the `LIMIT` clause:

```sql
-- Select the first 10 rows from the system_metrics table
SELECT *
FROM system_metrics
LIMIT 10;
```

## Joining Tables with SELECT Statements

The `JOIN` clause is used to combine rows from two or more tables based on a related column between them. The syntax for using `JOIN` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table1
JOIN table2
ON table1.column = table2.column;
```

Here, the table1 and table2 are the names of the tables to be joined. The column is the related column between the two tables.

Please refer to [JOIN](join.md) for more information.

## Grouping SELECT Statements with GROUP BY Clause

The `GROUP BY` clause is used to group the rows in a `SELECT` statement based on one or more columns. The syntax for using `GROUP BY` clause is as follows:

```sql
SELECT column1, column2, ..., aggregate_function(column)
FROM table_name
GROUP BY column1, column2, ...;
```

Here, the aggregate_function is a function that performs a calculation on a set of values, such as AVG, COUNT, MAX, MIN, or SUM. The column is the column to group the data by.

## Examples of GROUP BY Clause

```sql
-- Select the total number of idc for each idc
SELECT idc, COUNT(host) as host_mun
FROM system_metrics
GROUP BY idc;

-- Select the idc's average cpu_util
SELECT idc, AVG(cpu_util) as cpu_avg
FROM system_metrics
GROUP BY idc;
```

Please refer to [GROUP BY](group_by.md) for more information.

## Example of RANGE query

```sql
SELECT
     ts,
     host,
     min(cpu) RANGE '10s',
     max(cpu) RANGE '10s' FILL LINEAR
FROM host_cpu
ALIGN '5s' BY (host) FILL PREV;
```

Please refer to [RANGE QUERY](range.md) for more information.