---
description: 介绍了 `SELECT` 语句的基本语法和用法，包括 `WHERE`、`LIMIT`、`JOIN` 和 `GROUP BY` 子句的示例。
---

# SELECT

`SELECT` 语句允许你从一个或多个表中选择列。

## Basic Syntax

`SELECT` 的基本语法如下：

```sql
SELECT column1, column2, ...
FROM table_name;
```

column1, column2 是要从中获取数据的列的名称，table_name 是要从中获取数据的表的名称。

该语句从 `FROM` 子句中指定的表中选择列。如果要从表中选择所有列，可以使用星号（*）通配符字符，而不是列出单个列名。

```sql
SELECT *
FROM table_name;
```

## 使用 WHERE 子句过滤 SELECT 语句

`WHERE` 子句用于根据指定条件过滤 `SELECT` 语句的结果，其语法如下：

```sql
SELECT column1, column2, ..., columnN
FROM table_name
WHERE condition;
```

其中 `condition` 是一个表达式，它的值为 `true` 或 `false`。只有满足条件的行才会包含在结果集中。

## WHERE 子句示例

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

## 在 SELECT 语句中使用 LIMIT

`LIMIT` 用于限制查询返回的行数。当处理大数据集时该子句特别有用，因为它通过减少需要处理的数据量来提高查询性能。

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

这里 `number_of_rows` 参数用于指定要返回的最大行数。

## LIMIT 子句示例

```sql
-- Select the first 10 rows from the system_metrics table
SELECT *
FROM system_metrics
LIMIT 10;
```

## 在 SELECT 语句中使用 JOIN

`JOIN` 用于组合两个或多个表中基于相关列的行，使用 `JOIN` 的语法如下：

```sql
SELECT column1, column2, ...
FROM table1
JOIN table2
ON table1.column = table2.column;
```

table1 和 table2 是要连接的表的名称，column 是两个表之间的相关列，请参考[JOIN](join.md) 获取更多信息。

## 在 SELECT 语句中使用 GROUP BY 子句

`GROUP BY` 语句用于对具有一个或多个列中的相同值的行进行分组，其基本语法如下：

```sql
SELECT column1, column2, ..., aggregate_function(column)
FROM table_name
GROUP BY column1, column2, ...;
```

这里 `aggregate_function` 是对一组值执行计算的函数，例如 AVG、COUNT、MAX、MIN 或 SUM。`column` 是要对数据进行分组的列。

## GROUP BY 子句示例

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

请参考[GROUP BY](group_by.md) 获取更多信息。

## RANGE 查询示例

```sql
SELECT 
    ts, 
    host, 
    min(cpu) RANGE '10s',
    max(cpu) RANGE '10s' FILL LINEAR 
FROM host_cpu 
ALIGN '5s' BY (host) FILL PREV;
```

请参考[RANGE QUERY](range.md) 获取更多信息。
