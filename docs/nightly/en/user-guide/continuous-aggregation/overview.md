# Overview

GreptimeDB provides a continuous aggregation feature that allows you to aggregate data in real-time. This feature is useful when you need to calculate and query the sum, average, or other aggregations on the fly. The continuous aggregation feature is provided by our `Flow` engine. It continuously updates the aggregated data based on the incoming data and materialize it.

- [Manage Flow](./manage-flow.md) describes how to create, update, and delete a flow. Each of your continuous aggregation query is a flow.
- [Define Time Window](./define-time-window.md) describes how to define the time window for the continuous aggregation. Time window is an important attribute of your continuous aggregation query. It defines the time interval for the aggregation.
- [Query](./query.md) describes how to write a continuous aggregation query.
- [Expression](./expression.md) is a reference of available expressions in the continuous aggregation query.

![Continuous Aggregation](/flow-ani.svg)

## Example

Here is a complete example of how a continuous aggregation query looks like.

First, we create a source table `numbers_input` and a sink table `out_num_cnt` with following clauses:

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

Then create our flow `test_numbers` to aggregate the sum of `number` column in `numbers_input` table. The aggregation is calculated in 1-second fixed windows.

```sql
CREATE FLOW test_numbers 
SINK TO out_num_cnt
AS 
SELECT sum(number) FROM numbers_input GROUP BY tumble(ts, '1 second');
```

Now we can insert some data into `numbers_input` table and see the result in `out_num_cnt` table.

```sql
INSERT INTO numbers_input 
VALUES
    (20,1625097600000),
    (22,1625097600500);
```

The output table `out_num_cnt` should have the following data:

```sql
SELECT * FROM out_num_cnt;
```

```sql
 sum_number |        start_window        |         end_window         |         update_at          
------------+----------------------------+----------------------------+----------------------------
         42 | 2021-07-01 00:00:00.000000 | 2021-07-01 00:00:01.000000 | 2024-05-17 08:32:56.026000
(1 row)
```

Let's try to insert more data into `numbers_input` table.

```sql
public=> INSERT INTO numbers_input 
VALUES
    (23,1625097601000),
    (24,1625097601500);
```

Now the output table `out_num_cnt` should have the following data:

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
