---
keywords: [SQL SELECT statement, data retrieval, filtering with WHERE, LIMIT clause, JOIN tables, GROUP BY clause]
description: Describes the SELECT statement in SQL for retrieving data from tables, including syntax, filtering with WHERE, limiting results with LIMIT, joining tables, and grouping results with GROUP BY.
---

# SELECT

The `SELECT` statement is the foundation of data retrieval in SQL and GreptimeDB. It allows you to extract specific columns or expressions from one or more tables:

## Basic Syntax

The basic syntax for a `SELECT` statement is as follows:

```sql
SELECT column1, column2, ...
FROM table_name
[WHERE condition]
[GROUP BY column]
[HAVING condition]
[ORDER BY column]
[LIMIT number] [OFFSET number]
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

## Conditional Filtering (WHERE clause)

The `WHERE` clause is used to filter the results of a `SELECT` statement based on a specified condition. The
syntax for using WHERE clause is as follows:

```sql
SELECT column1, column2, ..., columnN
FROM table_name
WHERE condition;
```

Here, the condition is an expression that evaluates to either true or false. Only the rows that satisfy the condition will be included in the result set.

Supported comparisons include:
* Logical operators: `AND`, `OR`, `NOT`
* Comparison operators: `=`, `!=`, `>`, `<`, `>=`, `<=`
* Pattern matching: `LIKE`, `IN`, `BETWEEN`

For example:
```sql
-- Select all rows from the system_metrics table where idc is 'idc0'
SELECT *
FROM system_metrics
WHERE idc = 'idc0';

-- Select all rows from the system_metrics table where the idc is 'idc0' or 'idc0'
SELECT *
FROM system_metrics
WHERE idc IN ('idc0', 'idc1');

-- Select all rows from the system_metrics table where the idc is 'idc0' or 'idc0' and the cpu utilization is greater than 60%
SELECT *
FROM system_metrics
WHERE idc IN ('idc0', 'idc1') AND cpu_util > 0.6;
```

Please refer to [WHERE](where.md) for more information.

## Order Results(ORDER BY clause)

The `ORDER BY` clause is used to order the data in ascending or descending order based on one or more columns in the SELECT statement.

For example:

```sql
--- Sort the results by cpu_util in ascending order
SELECT *
FROM system_metrics ORDER BY cpu_util ASC;

--- Sort the results by cpu_util in descending order
SELECT *
FROM system_metrics ORDER BY cpu_util DESC;
```

Please refer to [ORDER](order_by.md) for more information.

## Limiting Results (LIMIT clause)

The `LIMIT` clause is used to limit the number of rows returned by a SELECT statement. The syntax for using
`LIMIT` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

Here, the number_of_rows parameter specifies the maximum number of rows to return.

Here are some examples of using the `LIMIT` clause:

```sql
-- Select the top 10 high cpu rows from the system_metrics table
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10;
```

## Pagination Results (LIMIT and OFFSET)

The `OFFSET` clause specifies how many rows to skip before starting to return rows from the query. It's commonly used with LIMIT for paginating through large result sets.

For example:
```sql
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10
OFFSET 10;
```

It selects all columns from rows ranked 11th to 20th (by descending `cpu_util`)  from the `system_metrics` table.

Although combining `OFFSET` and `LIMIT` with an `ORDER BY` clause can achieve pagination, this approach is not very efficient. We recommend recording the time index (timestamp) of the last record returned on each page and using this value to filter and limit the data for subsequent pages. Please refer to [OFFSET](offset.md) for more information.

## Joining Tables (JOIN)

The `JOIN` clause is used to combine rows from two or more tables based on a related column between them. The syntax for using `JOIN` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table1
JOIN table2
ON table1.column = table2.column;
```

Here, the table1 and table2 are the names of the tables to be joined. The column is the related column between the two tables.

Please refer to [JOIN](join.md) for more information.

## Grouping and Aggregation (GROUP BY and Aggregate Functions)

Use `GROUP BY` to cluster data by one or more columns and perform calculations like counting or averaging within those groups. 

```sql
SELECT column1, column2, ..., aggregate_function(column)
FROM table_name
GROUP BY column1, column2, ...;
```

Common aggregate functions supported:
* COUNT
* SUM
* AVG
* MAX
* MIN

For more functions, see [Aggregate Functions](/reference/sql/functions/df-functions.md#aggregate-functions) and [Window Functions](/reference/sql/functions/df-functions.md#window-functions).

For example:
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

## Filtering Groups (HAVING clause)

The `HAVING` clause allows you to filter grouped (aggregated) results—it works like `WHERE`, but after grouping has taken place.

Example:
```sql
SELECT
  DATE_TRUNC('day', event_time) AS log_date,
  COUNT(*) AS error_count
FROM application_logs
WHERE log_level = 'ERROR'
GROUP BY log_date
HAVING error_count > 10;
```

Explanation:
* Groups logs by day and counts occurrences where the log level is `'ERROR'`.
* Only dates where the number of errors exceeds 10 are returned.

Please refer to [HAVING](having.md) for more information.

## RANGE query

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