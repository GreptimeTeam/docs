---
keywords: [公共表表达式, CTE, SQL 查询, WITH 关键字, SQL 示例]
description: 介绍了如何使用 `WITH` 关键字定义公共表表达式（CTE），包括基本语法和示例。
---

# WITH

使用 `WITH` 来指定一个公共表表达式（CTE）。

## 什么是公共表表达式（CTE）？

公共表表达式（CTE）是一个可以在 `SELECT`、`INSERT`、`UPDATE` 或 `DELETE` 语句中引用的临时结果集。CTE 有助于将复杂的查询分解成更易读的部分，并且可以在同一个查询中多次引用。

## CTE 的基本语法

CTE 通常使用 `WITH` 关键字定义。基本语法如下：

```sql
WITH cte_name [(column1, column2, ...)] AS (
    QUERY
)
SELECT ...
FROM cte_name;
```

## 示例

### 非递归 CTE

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

如果 CTE 名称后面有一个括起来的名称列表，这些名称就是 CTE 的列名，可以在查询里使用：

```sql
WITH cte (col1, col2) AS
(
  SELECT 1, 2
  UNION ALL
  SELECT 3, 4
)
SELECT col1, col2 FROM cte;
```

列表中的名称数量必须与结果集中的列数相同。

```sql
+------+------+
| col1 | col2 |
+------+------+
|    1 |    2 |
|    3 |    4 |
+------+------+
```

联合查询两个 CTE：

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

### 递归 CTE

递归 CTE 目前尚未实现。
