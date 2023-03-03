The `SELECT` statement allows you to specify a list of columns and expressions to be selected from
one or more tables.

# Basic SELECT Statement Syntax
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

# Filtering SELECT Statements with WHERE Clause
The WHERE clause is used to filter the results of a SELECT statement based on specified criteria. The
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

# Sorting SELECT Statements with ORDER BY Clause
The `LIMIT` clause is used to limit the number of rows returned by a SELECT statement. The syntax for using
`LIMIT` clause is as follows:

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

Here, the number_of_rows parameter specifies the maximum number of rows to return. 

## Examples of LIMIT Clause
Here are some examples of using the LIMIT clause:

```sql
-- Select the first 10 rows from the system_metrics table
SELECT *
FROM system_metrics
LIMIT 10;
```

# Joining Tables with SELECT Statements
The JOIN clause is used to combine rows from two or more tables based on a related column between them. The syntax for using JOIN clause is as follows:

```sql
SELECT column1, column2, ...
FROM table1
JOIN table2
ON table1.column = table2.column;
```

Here, the table1 and table2 are the names of the tables to be joined. The column is the related column between the two tables.

## Types of JOIN Clauses
There are several types of JOIN clauses:

- INNER JOIN: Returns only the rows that have matching values in both tables.
- LEFT JOIN: Returns all the rows from the left table and the matching rows from the right table.
- RIGHT JOIN: Returns all the rows from the right table and the matching rows from the left table.
- FULL OUTER JOIN: Returns all the rows from both tables.

## Examples of JOIN Clauses
Here are some examples of using JOIN clauses:

```sql
-- Select all rows from the system_metrics table and idc_info table where the idc_id matches
SELECT a.*
FROM system_metrics a
JOIN idc_info b
ON a.idc = b.idc_id;

-- Select all rows from the idc_info table and system_metrics table where the idc_id matches, and include null values for idc_info without any matching system_metrics
SELECT a.*
FROM idc_info a
LEFT JOIN system_metrics b
ON a.idc_id = b.idc;

-- Select all rows from the system_metrics table and idc_info table where the idc_id matches, and include null values for idc_info without any matching system_metrics
SELECT b.*
FROM system_metrics a
RIGHT JOIN idc_info b
ON a.idc = b.idc_id;
```

# Grouping SELECT Statements with GROUP BY Clause
The GROUP BY clause is used to group the rows in a SELECT statement based on one or more columns. The syntax for using GROUP BY clause is as follows:

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
