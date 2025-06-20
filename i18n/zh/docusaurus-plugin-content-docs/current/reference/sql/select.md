---
keywords: [SELECT 语句, SQL 查询, WHERE 子句, LIMIT 子句, JOIN 子句, GROUP BY 子句]
description: 介绍了 `SELECT` 语句的基本语法和用法，包括 `WHERE`、`LIMIT`、`JOIN` 和 `GROUP BY` 子句的示例。
---

# SELECT

`SELECT` 语句是 SQL 和 GreptimeDB 中数据检索的基础。它允许你从一个或多个表中提取特定的列或表达式：

## Basic Syntax

`SELECT` 的基本语法如下：

```sql
SELECT column1, column2, ...
FROM table_name
[WHERE condition]
[GROUP BY column]
[HAVING condition]
[ORDER BY column]
[LIMIT number] [OFFSET number]
```

column1, column2 是要从中获取数据的列的名称，table_name 是要从中获取数据的表的名称。

该语句从 `FROM` 子句中指定的表中选择列。如果要从表中选择所有列，可以使用星号（*）通配符字符，而不是列出单个列名。

```sql
SELECT *
FROM table_name;
```

## 条件过滤 (WHERE 子句)

`WHERE` 子句用于根据指定条件过滤 `SELECT` 语句的结果，其语法如下：

```sql
SELECT column1, column2, ..., columnN
FROM table_name
WHERE condition;
```

其中 `condition` 是一个表达式，它的值为 `true` 或 `false`。只有满足条件的行才会包含在结果集中。

支持的比较运算包括：
* 逻辑运算符：`AND`、`OR`、`NOT`
* 比较运算符：`=`、`!=`、`>`、`<`、`>=`、`<=`
* 模式匹配：`LIKE`、`IN`、`BETWEEN`

```sql
-- 从 system_metrics 表中选择所有 idc 为 'idc0' 的行
SELECT *
FROM system_metrics
WHERE idc = 'idc0';

-- 从 system_metrics 表中选择所有 idc 为 'idc0' 或 'idc0' 的行
SELECT *
FROM system_metrics
WHERE idc IN ('idc0', 'idc1');

-- 从 system_metrics 表中选择所有idc为'idc0'或'idc0'且CPU利用率大于60%的行
SELECT *
FROM system_metrics
WHERE idc IN ('idc0', 'idc1') AND cpu_util > 0.6;
```

请参考 [WHERE](where.md) 获取更多信息。

## 排序结果（ORDER BY 子句）

`ORDER BY` 子句用于根据 SELECT 语句中的一个或多个列，以升序或降序对数据进行排序。

例如：

```sql
--- 按 cpu_util 升序排序结果
SELECT *
FROM system_metrics ORDER BY cpu_util ASC;

--- 按 cpu_util 降序排序结果
SELECT *
FROM system_metrics ORDER BY cpu_util DESC;
```

更多信息请参阅 [ORDER](order_by.md)。

## 限制结果（LIMIT 子句）

`LIMIT` 用于限制查询返回的行数。当处理大数据集时该子句特别有用，因为它通过减少需要处理的数据量来提高查询性能。

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT number_of_rows;
```

这里 `number_of_rows` 参数用于指定要返回的最大行数。

```sql
-- 从 system_metrics 表中选择 CPU 使用率最高的 10 行。
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10;
```


## 分页结果 (LIMIT 和 OFFSET)

`OFFSET` 子句指定在开始返回查询结果行之前要跳过多少行。它通常与 `LIMIT` 一起使用，用于对大型结果集进行分页。

例如：
```sql
SELECT *
FROM system_metrics
ORDER BY cpu_util DESC
LIMIT 10
OFFSET 10;
```

它从 `system_metrics` 表中选择按 `cpu_util` 降序排列的第 11 行到第 20 行的所有列。

虽然将 `OFFSET` 和 `LIMIT` 与 `ORDER BY` 子句结合使用可以实现分页，但这种方法效率不高。 我们建议记录每页返回的最后一条记录的时间索引（时间戳），并使用此值来过滤和限制后续页面的数据。 请参阅 [OFFSET](offset.md) 以获取更多信息。

## 连接表（JOIN）

`JOIN` 用于组合两个或多个表中基于相关列的行，使用 `JOIN` 的语法如下：

```sql
SELECT column1, column2, ...
FROM table1
JOIN table2
ON table1.column = table2.column;
```

table1 和 table2 是要连接的表的名称，column 是两个表之间的相关列，请参考[JOIN](join.md) 获取更多信息。

## 分组和聚合 (GROUP BY 和聚合函数)

使用 `GROUP BY` 可以根据一个或多个列对数据进行分组，并在这些组内执行诸如计数或求平均值之类的计算，其基本语法如下：

```sql
SELECT column1, column2, ..., aggregate_function(column)
FROM table_name
GROUP BY column1, column2, ...;
```

常见支持的聚合函数：
* COUNT
* SUM
* AVG
* MAX
* MIN

更多函数，请参阅 [聚合函数](/reference/sql/functions/df-functions.md#aggregate-functions) 和 [窗口函数](/reference/sql/functions/df-functions.md#window-functions)。

示例：
```sql
-- 查询每个 idc 的 idc 总数
SELECT idc, COUNT(host) as host_num
FROM system_metrics
GROUP BY idc;

-- 查询每个 idc 的平均 cpu 利用率
SELECT idc, AVG(cpu_util) as cpu_avg
FROM system_metrics
GROUP BY idc;
```

请参考 [GROUP BY](group_by.md) 获取更多信息。

## 过滤分组 (HAVING 子句)

`HAVING` 子句允许您过滤分组（聚合）后的结果——它的作用类似于 `WHERE`，但发生在分组之后。

示例：
```sql
SELECT
  DATE_TRUNC('day', event_time) AS log_date,
  COUNT(*) AS error_count
FROM application_logs
WHERE log_level = 'ERROR'
GROUP BY log_date
HAVING error_count > 10;
```

解释如下：
* 按日期分组日志，并统计日志级别为 `'ERROR'` 的事件数量。
* 仅返回错误数量超过 10 的日期。

请参考 [HAVING](having.md) 获取更多信息。

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

请参考 [RANGE QUERY](range.md) 获取更多信息。
