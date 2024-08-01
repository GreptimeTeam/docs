# Write a Query

This chapter describes how to write a continuous aggregation query in GreptimeDB. Query here should be a `SELECT` statement with either aggregating functions or non-aggregating functions (i.e., scalar function).

Generally speaking, the `SQL` part in the flow is just like a normal `SELECT` clause with a few difference.
The grammar of the query is like the following:

```sql
SELECT AGGR_FUNCTION(column1, column2,..) FROM <source_table> GROUP BY TIME_WINDOW_FUNCTION();
```

Only two kinds of expression are allowed after `SELECT` keyword:
- Aggregate functions: see the reference in [Expression](./expression.md) for detail.
- Scalar functions: like `col`, `to_lowercase(col)`, `col + 1`, etc. This part is the same as the normal `SELECT` clause in GreptimeDB.

The query should have a `FROM` clause to identify the source table. As the join clause is currently not supported, the query can only aggregate columns from a single table.

`GROUP BY` clause works as in a normal query. It groups the data by the specified columns. One special thing is the time window functions `hop()` and `tumble()` described in [Define Time Window](./define-time-window.md) part. They are used in the `GROUP BY` clause to define the time window for the aggregation. Other expressions in `GROUP BY` can be either literal, column or scalar expressions.

Others things like `ORDER BY`, `LIMIT`, `OFFSET` are not supported in the continuous aggregation query.

## Rewrite an existing query to a continuous aggregation query

Some of simple existing aggregation queries can be directly used as continuous aggregation queries. For example, the example in [overview](./overview.md) can be used to query both in standard SQL and continuous aggregation query, since it's also a valid SQL query without any flow-specific syntax or functions:

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

However, there are other types of queries that cannot be directly used as continuous aggregation queries. 
For example, a query that needs to compute percentiles would be unwise to repeatedly calculate the percentile for each time window everytime a new batch of data arrive. In this case, you can pre-aggregate the data into buckets of the desired size, and then calculate the percentile in the sink table using standard SQL when needed. The original SQL might be:
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
The above query can be rewritten to first aggregate the data into buckets of size 10, and then calculate the percentile in the sink table.
The flow query would be:
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

And then you can calculate the percentile in the sink table using standard SQL:
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

The SQL query groups the data by status, time_window, and bucket. The percentile column calculates the percentage within each group by taking the sum of all buckets not greater than the current bucket and dividing it by the total count of all logs. The result would be something like this:

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