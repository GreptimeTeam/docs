# 编写查询语句

本章节描述如何在 GreptimeDB 中编写连续聚合查询。
查询语句应该是一个带有聚合函数或非聚合函数（即 scalar 函数）的 `SELECT` 语句。

一般来说，Flow 的 `SQL` 部分就像一个普通的 `SELECT` 子句，只是稍微有一些不同。
具体语法如下：

```sql
SELECT AGGR_FUNCTION(column1, column2,..) FROM <source_table> GROUP BY TIME_WINDOW_FUNCTION();
```

`SELECT` 关键字后只允许两种表达式：
- 聚合函数：详细信息请参考 [表达式](./expression.md) 部分。
- 标量函数：如 `col`、`to_lowercase(col)`、`col + 1` 等。这部分与 GreptimeDB 中的普通 `SELECT` 子句相同。

查询应该有一个 `FROM` 子句来标识 source 表。由于不支持 join 子句，目前只能从单个表中聚合列。

`GROUP BY` 子句与普通查询中的工作方式相同。
它根据指定的列对数据进行分组。
`GROUP BY` 子句中使用的时间窗口函数 `hop()` 和 `tumble()` 在 [定义时间窗口](./define-time-window.md) 部分中有描述。
它们用于在聚合中定义时间窗口。
`GROUP BY` 中的其他表达式可以是 literal、列名或 scalar 表达式。

连续聚合查询不支持 `ORDER BY`、`LIMIT`、`OFFSET` 等其他操作。


## 将现有查询重写为连续聚合查询

一些简单的现有聚合查询可以直接用作连续聚合查询。例如，[概述](./overview.md) 部分中的示例可以用于标准 SQL 查询和连续聚合查询，因为它也是一个有效的 SQL 查询，没有任何特定于流的语法或函数：

```sql
SELECT
    status,
    count(client) AS total_logs,
    min(size) as min_size,
    max(size) as max_size,
    avg(size) as avg_size,
    sum(case when `size` > 550::double then 1::double else 0::double end) as high_size_count,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window;
```

然而，还有其他类型的查询不能直接用作连续聚合查询。
例如，需要计算百分位数的查询不应该在每次新数据到达时重复计算每个时间窗口的百分位数。
在这种情况下，您可以将数据预聚合到所需大小的桶中，然后在需要时使用标准 SQL 在 sink 表中计算百分位数。原始 SQL 可能是：

```sql
SELECT
    status,
    percentile_approx(size, 0.5) as median_size,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window;
```
上述查询可以重写为首先将数据聚合到大小为 10 的桶中，然后在 sink 表中计算百分位数。
流查询将是：

```sql
CREATE FLOW calc_ngx_distribution
SINK TO ngx_distribution
AS
SELECT
    status,
    trunc(size, -1) as bucket,
    count(client) AS total_logs,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window,
    bucket;
```
接下来，您可以使用标准 SQL 在 sink 表中计算百分位数：
```sql
SELECT
    outer.status,
    outer.time_window,
    outer.bucket,
    SUM(case when in1.bucket <= outer.bucket then in1.total_logs else 0 end) * 100 / SUM(in1.total_logs) AS percentile
FROM ngx_distribution AS outer
JOIN ngx_distribution AS in1
ON in1.status = outer.status 
AND in1.time_window = outer.time_window
GROUP BY
    status,
    time_window,
    bucket
ORDER BY status, time_window, bucket;
```

上述 SQL 查询按 status、time_window 和 bucket 对数据进行分组。percentile 列通过计算小于或等于当前 bucket 的所有 bucket 的总和，并将其除以所有日志的总数来计算每个组内的百分比。结果可能如下所示：

```sql
 status |        time_window         | bucket | percentile 
--------+----------------------------+--------+------------
    404 | 1970-01-01 00:00:00.000000 |      0 |         22
    404 | 1970-01-01 00:00:00.000000 |      1 |         55
    404 | 1970-01-01 00:00:00.000000 |      2 |         66
    404 | 1970-01-01 00:00:00.000000 |      3 |        100
(4 rows)
```

<!-- 
TODO(discord9): add example for percentile query
TODO(discord9): add example for tumble and hop once we support window table function
Another example that require rewrite is for query that needs overlapping timewindow, hence `hop()` function is needed. 
-->