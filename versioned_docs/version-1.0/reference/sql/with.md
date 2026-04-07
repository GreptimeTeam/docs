---
keywords: [CTE, Common Table Expression, SQL WITH clause, non-recursive CTE, SQL syntax]
description: Describes the usage of the WITH clause to define Common Table Expressions (CTEs) in SQL, including syntax, examples of non-recursive CTEs, and notes on recursive CTEs.
---

# WITH

Use `WITH` to specify a Common Table Expression.

## What is a Common Table Expression (CTE)?

A Common Table Expression (CTE) is a temporary result set that you can reference within a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs help to break down complex queries into more readable parts and can be referenced multiple times within the same query.

## Basic syntax of CTE

CTEs are typically defined using the `WITH` keyword. The basic syntax is as follows:

```sql
WITH cte_name [(column1, column2, ...)] AS (
    QUERY
)
SELECT ...
FROM cte_name;
```

## Examples

### Non-recursive CTE

```sql
WITH cte AS (SELECT number FROM numbers LIMIT 2) SELECT * FROM cte t1, cte t2;
```

```sql
+--------+--------+
| number | number |
+--------+--------+
|      0 |      0 |
|      0 |      1 |
|      1 |      0 |
|      1 |      1 |
+--------+--------+
```

If a parenthesized list of names follows the CTE name, those names are the column names:

```sql
WITH cte (col1, col2) AS
(
  SELECT 1, 2
  UNION ALL
  SELECT 3, 4
)
SELECT col1, col2 FROM cte;
```

The number of names in the list must be the same as the number of columns in the result set.

```sql
+------+------+
| col1 | col2 |
+------+------+
|    1 |    2 |
|    3 |    4 |
+------+------+
```

Join two CTEs:
```sql
WITH
  cte1 AS (SELECT number AS a FROM NUMBERS LIMIT 2),
  cte2 AS (SELECT number AS b FROM NUMBERS LIMIT 2)
SELECT * FROM cte1 JOIN cte2
ON cte1.a = cte2.b;
```

```sql
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    0 |    0 |
+------+------+
```


### Recursive CTE

Recursive CTE is not implemented currently.