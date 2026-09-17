---
keywords: [CTE, Common Table Expression, SQL WITH clause, non-recursive CTE, recursive CTE, WITH RECURSIVE, SQL syntax]
description: Describes the usage of the WITH clause to define Common Table Expressions (CTEs) in SQL, including syntax and examples of non-recursive and recursive CTEs.
---

# WITH

Use `WITH` to specify a Common Table Expression.

## What is a Common Table Expression (CTE)?

A Common Table Expression (CTE) is a temporary result set defined by a `WITH` clause. The query that follows the clause can reference the CTE multiple times.

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
WITH cte AS (SELECT 0 AS number UNION ALL SELECT 1) SELECT * FROM cte t1, cte t2;
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
  cte1 AS (SELECT 0 AS a UNION ALL SELECT 1),
  cte2 AS (SELECT 0 AS b UNION ALL SELECT 1)
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

A recursive CTE is declared with `WITH RECURSIVE`. It takes an anchor term, then a recursive term that references the CTE by name:

```sql
WITH RECURSIVE counter(n) AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM counter WHERE n < 5
)
SELECT n FROM counter;
```

```sql
+---+
| n |
+---+
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
+---+
```

The recursion stops when an iteration produces no rows. There is no iteration limit and no cycle detection, so a recursive term that keeps producing rows runs until the query is cancelled.
