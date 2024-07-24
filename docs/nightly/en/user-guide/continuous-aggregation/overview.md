# Overview

GreptimeDB provides a continuous aggregation feature that allows you to aggregate data in real-time. This feature is useful when you need to calculate and query the sum, average, or other aggregations on the fly. The continuous aggregation feature is provided by the Flow engine. It continuously updates the aggregated data based on the incoming data and materialize it. So you can think of it as a clever materialized views that know when to update result view table and how to update it with 
minimal effort.

When you insert data into the source table, the data is also sent to and stored in the Flow engine.
The Flow engine calculate the aggregation by time windows and store the result in the sink table.
The entire process is illustrated in the following image:

![Continuous Aggregation](/flow-ani.svg)

## Quick start with an example

Here is a complete example of how a continuous aggregation query looks like.

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

Then create the flow `ngx_aggregation` to aggregate a series of aggregate functions, including `count`, `min`, `max`, `avg` of the `size` column, and the sum of all packets of size great than 550. The aggregation is calculated in 1-minute fixed windows of `access_time` column.

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
    date_bin(INTERVAL '1 minutes', access_time, '2024-01-01 00:00:00'::TimestampNanosecond) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window;
```
!!!!!!!!!!!!!!!!!!!TODO: insert example and explain output

To observe the outcome of the continuous aggregation in the `out_num_cnt` table, insert some data into the source table `numbers_input`.

```sql
INSERT INTO numbers_input 
VALUES
    (20, "2021-07-01 00:00:00.200"),
    (22, "2021-07-01 00:00:00.600");
```

The sum of the `number` column is 42 (20+22), so the sink table `out_num_cnt` should have the following data:

```sql
SELECT * FROM out_num_cnt;
```

```sql
 sum_number |        start_window        |         end_window         |         update_at          
------------+----------------------------+----------------------------+----------------------------
         42 | 2021-07-01 00:00:00.000000 | 2021-07-01 00:00:01.000000 | 2024-05-17 08:32:56.026000
(1 row)
```

Try to insert more data into the `numbers_input` table:

```sql
INSERT INTO numbers_input 
VALUES
    (23,"2021-07-01 00:00:01.000"),
    (24,"2021-07-01 00:00:01.500");
```

The sink table `out_num_cnt` now contains two rows: representing the sum data 42 and 47 (23+24) for the two respective 1-second windows.

```sql
SELECT * FROM out_num_cnt;
```

```sql
 sum_number |        start_window        |         end_window         |         update_at          
------------+----------------------------+----------------------------+----------------------------
         42 | 2021-07-01 00:00:00.000000 | 2021-07-01 00:00:01.000000 | 2024-05-17 08:32:56.026000
         47 | 2021-07-01 00:00:01.000000 | 2021-07-01 00:00:02.000000 | 2024-05-17 08:33:10.048000
(2 rows)
```

Here is the explanation of the columns in the `out_num_cnt` table:

- `sum_number`: the sum of the `number` column in the window.
- `start_window`: the start time of the window.
- `end_window`: the end time of the window.
- `update_at`: the time when the row data is updated.

The `start_window`, `end_window`, and `update_at` columns are automatically added by the time window functions of Flow engine.

## Next Steps

Congratulations you already have a preliminary understanding of the continuous aggregation feature.
Please refer to the following sections to learn more:

- [Manage Flows](./manage-flow.md) describes how to create, update, and delete a flow. Each of your continuous aggregation query is a flow.
- [Write a Query](./query.md) describes how to write a continuous aggregation query.
- [Define Time Window](./define-time-window.md) describes how to define the time window for the continuous aggregation. Time window is an important attribute of your continuous aggregation query. It defines the time interval for the aggregation.
- [Expression](./expression.md) is a reference of available expressions in the continuous aggregation query.
