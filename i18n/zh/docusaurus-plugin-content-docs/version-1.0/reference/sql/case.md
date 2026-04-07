---
keywords: [条件逻辑, CASE 语句, SQL CASE, 条件查询, 数据检索, SQL 语法]
description: CASE 语句允许在查询中执行条件逻辑，根据条件返回特定值。
---

# CASE

CASE 语句类似于编程语言中的 IF-THEN-ELSE 结构，允许你在查询中执行条件逻辑，
它使你能够根据条件返回特定值，从而使数据检索和操作更加动态。

## 语法

```sql
CASE
  WHEN condition1 THEN result1
  WHEN condition2 THEN result2
  ...
  ELSE result
END
```

- `condition1`，`condition2`，...：表达式的判断条件。
- `result1`，`result2`，...：满足相应条件时要返回的值。
- `result`：当没有条件满足时要返回的值（可选）。

## 示例

`CASE` 语句可以在各种子句中使用，例如 `SELECT`，`WHERE`，`ORDER BY` 和 `GROUP BY`。

### 在 `SELECT` 中使用 `CASE`

在 `SELECT` 子句中，你可以使用 `CASE` 语句根据条件创建新列。
请参阅查询数据指南中的[示例](/user-guide/query-data/sql.md#case)。

你还可以将 `CASE` 与 `SUM` 等函数一起使用，以有条件地聚合数据。
例如，你可以计算状态码为 200 和 404 的日志总数：

```sql
SELECT
  SUM(CASE WHEN status_code = '200' THEN 1 ELSE 0 END) AS status_200_count,
  SUM(CASE WHEN status_code = '404' THEN 1 ELSE 0 END) AS status_404_count
FROM nginx_logs;
```

### 在 `WHERE` 中使用 `CASE`

在 `WHERE` 子句中，你可以根据条件过滤行。
例如，以下查询根据 `ts` 条件从 `monitor` 表中检索数据：

```sql
SELECT * 
FROM monitor 
WHERE host = CASE 
          WHEN ts > '2023-12-13 02:05:46' THEN '127.0.0.1' 
          ELSE '127.0.0.2' 
        END;
```

### 在 `GROUP BY` 中使用 `CASE`

`CASE` 语句可以在 `GROUP BY` 子句中使用，以根据特定条件对数据进行分类。
例如，以下查询按 `host` 列分组，并将 `cpu` 列分类为三类：'high'，'medium' 和 'low'：

```sql
SELECT
  host,
  COUNT(*) AS count,
  CASE
    WHEN cpu > 0.5 THEN 'high'
    WHEN cpu > 0.3 THEN 'medium'
    ELSE 'low'
  END AS cpu_status
FROM monitor
GROUP BY 
  host, cpu_status;
```

### 在 `ORDER BY` 中使用 `CASE`

根据 GreptimeDB 的[数据模型](/user-guide/concepts/data-model.md)，
`Tag` 列拥有索引，可以在 `ORDER BY` 子句中使用以提高查询性能。
假如 `nginx_logs` 表中的 `status_code` 和 `http_method` 列是存储字符串值的 `Tag` 列，
你可以利用 `CASE` 语句根据这些列对数据进行排序，如下所示：

```sql
SELECT *
FROM nginx_logs
ORDER BY
  CASE
    WHEN status_code IS NOT NULL THEN status_code
    ELSE http_method
  END;
```

