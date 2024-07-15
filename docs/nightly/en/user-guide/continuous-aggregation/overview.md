# Overview

GreptimeDB provides a continuous aggregation feature that allows you to aggregate data in real-time. This feature is useful when you need to calculate and query the sum, average, or other aggregations on the fly. The continuous aggregation feature is provided by the Flow engine. It continuously updates the aggregated data based on the incoming data and materialize it.

When you insert data into the source table, the data is also sent to and stored in the Flow engine.
The Flow engine calculate the aggregation by time windows and store the result in the sink table.
The entire process is illustrated in the following image:

![Continuous Aggregation](/flow-ani.svg)

## Quick start with an example

Here is a complete example of how a continuous aggregation query looks like.

First, create a source table `numbers_input` and a sink table `out_num_cnt` with following clauses:

```sql
CREATE TABLE numbers_input (
    number INT,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(number),
    TIME INDEX(ts)
);
```

```sql
CREATE TABLE out_num_cnt (
    sum_number BIGINT,
    start_window TIMESTAMP TIME INDEX,
    end_window TIMESTAMP,
    update_at TIMESTAMP,
);
```

Then create the flow `test_numbers` to aggregate the sum of `number` column in `numbers_input` table. The aggregation is calculated in 1-second fixed windows.

```sql
CREATE FLOW test_numbers 
SINK TO out_num_cnt
AS 
SELECT date_bin(ts, '1 second', '2021-07-01 00:00:00'), sum(number) FROM numbers_input GROUP BY date_bin(ts, '1 second', '2021-07-01 00:00:00');
```

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
