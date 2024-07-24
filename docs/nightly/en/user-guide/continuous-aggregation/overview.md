# Overview

GreptimeDB provides a continuous aggregation feature that allows you to aggregate data in real-time. This feature is useful when you need to calculate and query the sum, average, or other aggregations on the fly. The continuous aggregation feature is provided by the Flow engine. It continuously updates the aggregated data based on the incoming data and materialize it. So you can think of it as a clever materialized views that know when to update result view table and how to update it with 
minimal effort.

When you insert data into the source table, the data is also sent to and stored in the Flow engine.
The Flow engine calculate the aggregation by time windows and store the result in the sink table.
The entire process is illustrated in the following image:

![Continuous Aggregation](/flow-ani.svg)

## Quick start with an example

Here is a complete example of how a continuous aggregation query looks like.

This use case is to calculate the total number of logs, the minimum size, the maximum size, the average size, and the number of packets with the size greater than 550 for each status code in a 1-minute fixed window for access logs.
First, create a source table `ngx_access_log` and a sink table `ngx_statistics` with following clauses:

```sql
CREATE TABLE `ngx_access_log` (
  `client` STRING NULL,
  `ua_platform` STRING NULL,
  `referer` STRING NULL,
  `method` STRING NULL,
  `endpoint` STRING NULL,
  `trace_id` STRING NULL FULLTEXT,
  `protocol` STRING NULL,
  `status` SMALLINT UNSIGNED NULL,
  `size` DOUBLE NULL,
  `agent` STRING NULL,
  `access_time` TIMESTAMP(3) NOT NULL,
  TIME INDEX (`access_time`)
)
WITH(
  append_mode = 'true'
);
```

```sql
CREATE TABLE `ngx_statistics` (
  `status` SMALLINT UNSIGNED NULL,
  `total_logs` BIGINT NULL,
  `min_size` DOUBLE NULL,
  `max_size` DOUBLE NULL,
  `avg_size` DOUBLE NULL,
  `high_size_count` DOUBLE NULL,
  `time_window` TIMESTAMP time index,
  `update_at` TIMESTAMP NULL,
  PRIMARY KEY (`status`)
);
```

Then create the flow `ngx_aggregation` to aggregate a series of aggregate functions, including `count`, `min`, `max`, `avg` of the `size` column, and the sum of all packets of size great than 550. The aggregation is calculated in 1-minute fixed windows of `access_time` column and also grouped by the `status` column.

```sql
CREATE FLOW ngx_aggregation
SINK TO ngx_statistics
AS
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
!!!!!!!!!!!!!!!!!!!TODO: insert example and explain output

To observe the outcome of the continuous aggregation in the `ngx_statistics` table, insert some data into the source table `ngx_access_log`.

```sql
INSERT INTO ngx_access_log 
VALUES
    ("android", "Android", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 1000, "agent", "2021-07-01 00:00:01.000"),
    ("ios", "iOS", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 500, "agent", "2021-07-01 00:00:30.500"),
    ("android", "Android", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 600, "agent", "2021-07-01 00:01:01.000"),
    ("ios", "iOS", "referer", "GET", "/api/v1", "trace_id", "HTTP", 404, 700, "agent", "2021-07-01 00:01:01.500");
```

Then the sink table `ngx_statistics` will be incremental updated and contain the following data:

```sql
SELECT * FROM ngx_statistics;
```

```sql
 status | total_logs | min_size | max_size | avg_size | high_size_count |        time_window         |         update_at          
--------+------------+----------+----------+----------+-----------------+----------------------------+----------------------------
    200 |          2 |      500 |     1000 |      750 |               1 | 2021-07-01 00:00:00.000000 | 2024-07-24 08:36:17.439000
    200 |          1 |      600 |      600 |      600 |               1 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:17.439000
    404 |          1 |      700 |      700 |      700 |               1 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:17.439000
(3 rows)
```

Try to insert more data into the `ngx_access_log` table:

```sql
INSERT INTO ngx_access_log 
VALUES
    ("android", "Android", "referer", "GET", "/api/v1", "trace_id", "HTTP", 200, 500, "agent", "2021-07-01 00:01:01.000"),
    ("ios", "iOS", "referer", "GET", "/api/v1", "trace_id", "HTTP", 404, 800, "agent", "2021-07-01 00:01:01.500");
```

The sink table `ngx_statistics` now have corresponding rows updated, notes how `max_size`, `avg_size` and `high_size_count` are updated:

```sql
SELECT * FROM ngx_statistics;
```

```sql
 status | total_logs | min_size | max_size | avg_size | high_size_count |        time_window         |         update_at          
--------+------------+----------+----------+----------+-----------------+----------------------------+----------------------------
    200 |          2 |      500 |     1000 |      750 |               1 | 2021-07-01 00:00:00.000000 | 2024-07-24 08:36:17.439000
    200 |          2 |      500 |      600 |      550 |               1 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:46.495000
    404 |          2 |      700 |      800 |      750 |               2 | 2021-07-01 00:01:00.000000 | 2024-07-24 08:36:46.495000
(3 rows)
```

Here is the explanation of the columns in the `out_num_cnt` table:

- `status`: The status code of the HTTP response.
- `total_logs`: The total number of logs with the same status code.
- `min_size`: The minimum size of the packets with the same status code.
- `max_size`: The maximum size of the packets with the same status code.
- `avg_size`: The average size of the packets with the same status code.
- `high_size_count`: The number of packets with the size greater than 550.
- `time_window`: The time window of the aggregation.
- `update_at`: The time when the aggregation is updated.

## Next Steps

Congratulations you already have a preliminary understanding of the continuous aggregation feature.
Please refer to the following sections to learn more:

- [Manage Flows](./manage-flow.md) describes how to create, update, and delete a flow. Each of your continuous aggregation query is a flow.
- [Write a Query](./query.md) describes how to write a continuous aggregation query.
- [Define Time Window](./define-time-window.md) describes how to define the time window for the continuous aggregation. Time window is an important attribute of your continuous aggregation query. It defines the time interval for the aggregation.
- [Expression](./expression.md) is a reference of available expressions in the continuous aggregation query.
