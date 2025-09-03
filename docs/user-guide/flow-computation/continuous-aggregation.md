---
keywords: [continuous aggregation, real-time analytics, time-series data, Flow engine, log analysis, sensor monitoring]
description: Learn how to use GreptimeDB's continuous aggregation for real-time analytics. Master Flow engine basics, time-window calculations, and SQL queries through practical examples of log analysis and sensor monitoring.
---

# Continuous Aggregation

Continuous aggregation is a crucial aspect of processing time-series data to deliver real-time insights.
The Flow engine empowers developers to perform continuous aggregations,
such as calculating sums, averages, and other metrics, seamlessly.
It efficiently updates the aggregated data within specified time windows, making it an invaluable tool for analytics.

Following are three major usecase examples for continuous aggregation:

1. **Real-time Analytics**: A real-time analytics platform that continuously aggregates data from a stream of events, delivering immediate insights while optionally downsampling the data to a lower resolution. For instance, this system can compile data from a high-frequency stream of log events (e.g., occurring every millisecond) to provide up-to-the-minute insights such as the number of requests per minute, average response times, and error rates per minute.

2. **Real-time Monitoring**: A real-time monitoring system that continuously aggregates data from a stream of events and provides real-time alerts based on the aggregated data. For example, a system that aggregates data from a stream of sensor events and provides real-time alerts when the temperature exceeds a certain threshold.

3. **Real-time Dashboard**: A real-time dashboard that shows the number of requests per minute, the average response time, and the number of errors per minute. This dashboard can be used to monitor the health of the system and to detect any anomalies in the system.

In all these usecases, the continuous aggregation system continuously aggregates data from a stream of events and provides real-time insights and alerts based on the aggregated data. The system can also downsample the data to a lower resolution to reduce the amount of data stored and processed. This allows the system to provide real-time insights and alerts while keeping the data storage and processing costs low.


## Real-time Analytics Example

### Calculate the Log Statistics

This use case is to calculate the total number of logs, the minimum size, the maximum size, the average size, and the number of packets with the size greater than 550 for each status code in a 1-minute fixed window for access logs.
First, create a source table `ngx_access_log` and a sink table `ngx_statistics` with following clauses:

```sql
CREATE TABLE `ngx_access_log` (
  `client` STRING NULL,
  `ua_platform` STRING NULL,
  `referer` STRING NULL,
  `method` STRING NULL,
  `endpoint` STRING NULL,
  `trace_id` STRING NULL FULLTEXT INDEX,
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
  `high_size_count` BIGINT NULL,
  `time_window` TIMESTAMP time index,
  `update_at` TIMESTAMP NULL,
  PRIMARY KEY (`status`)
);
```

Then create the flow `ngx_aggregation` to aggregate a series of aggregate functions, including `count`, `min`, `max`, `avg` of the `size` column, and the sum of all packets of size great than 550. The aggregation is calculated in 1-minute fixed windows of `access_time` column and also grouped by the `status` column. So you can be made aware in real time the information about packet size and action upon it, i.e. if the `high_size_count` became too high at a certain point, you can further examine if anything goes wrong, or if the `max_size` column suddenly spike in a 1 minute time window, you can then trying to locate that packet and further inspect it.

The `EXPIRE AFTER '6h'` in the following SQL ensures that the flow computation only uses source data from the last 6 hours. Data older than 6 hours in the sink table will not be modified by this flow. For more details, see [manage-flow](manage-flow.md#expire-after).

```sql
CREATE FLOW ngx_aggregation
SINK TO ngx_statistics
EXPIRE AFTER '6h'
COMMENT 'aggregate nginx access logs'
AS
SELECT
    status,
    count(client) AS total_logs,
    min(size) as min_size,
    max(size) as max_size,
    avg(size) as avg_size,
    sum(case when `size` > 550 then 1 else 0 end) as high_size_count,
    date_bin('1 minutes'::INTERVAL, access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window;
```

To observe the outcome of the continuous aggregation in the `ngx_statistics` table, insert some data into the source table `ngx_access_log`.

```sql
INSERT INTO ngx_access_log
VALUES
    ('android', 'Android', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 1000, 'agent', now() - INTERVAL '1' minute),
    ('ios', 'iOS', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 500, 'agent', now() - INTERVAL '1' minute),
    ('android', 'Android', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 600, 'agent', now()),
    ('ios', 'iOS', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 404, 700, 'agent', now());
```

Then the sink table `ngx_statistics` will be incremental updated and contain the following data:

```sql
SELECT * FROM ngx_statistics;
```

```sql
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
| status | total_logs | min_size | max_size | avg_size | high_size_count | time_window         | update_at                  |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
|    200 |          2 |      500 |     1000 |      750 |               1 | 2025-04-24 06:46:00 | 2025-04-24 06:47:06.680000 |
|    200 |          1 |      600 |      600 |      600 |               1 | 2025-04-24 06:47:00 | 2025-04-24 06:47:06.680000 |
|    404 |          1 |      700 |      700 |      700 |               1 | 2025-04-24 06:47:00 | 2025-04-24 06:47:06.680000 |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
3 rows in set (0.01 sec)
```

Try to insert more data into the `ngx_access_log` table:

```sql
INSERT INTO ngx_access_log
VALUES
    ('android', 'Android', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 200, 500, 'agent', now()),
    ('ios', 'iOS', 'referer', 'GET', '/api/v1', 'trace_id', 'HTTP', 404, 800, 'agent', now());
```

The sink table `ngx_statistics` now have corresponding rows updated, notes how `max_size`, `avg_size` and `high_size_count` are updated:

```sql
SELECT * FROM ngx_statistics;
```

```sql
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
| status | total_logs | min_size | max_size | avg_size | high_size_count | time_window         | update_at                  |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
|    200 |          2 |      500 |     1000 |      750 |               1 | 2025-04-24 06:46:00 | 2025-04-24 06:47:06.680000 |
|    200 |          2 |      500 |      600 |      550 |               1 | 2025-04-24 06:47:00 | 2025-04-24 06:47:21.720000 |
|    404 |          2 |      700 |      800 |      750 |               2 | 2025-04-24 06:47:00 | 2025-04-24 06:47:21.720000 |
+--------+------------+----------+----------+----------+-----------------+---------------------+----------------------------+
3 rows in set (0.01 sec)
```

Here is the explanation of the columns in the `ngx_statistics` table:

- `status`: The status code of the HTTP response.
- `total_logs`: The total number of logs with the same status code.
- `min_size`: The minimum size of the packets with the same status code.
- `max_size`: The maximum size of the packets with the same status code.
- `avg_size`: The average size of the packets with the same status code.
- `high_size_count`: The number of packets with the size greater than 550.
- `time_window`: The time window of the aggregation.
- `update_at`: The time when the aggregation is updated.

### Retrieve Distinct Countries by Time Window

Another example of real-time analytics is to retrieve all distinct countries from the `ngx_access_log` table.
You can use the following query to group countries by time window:

```sql
/* input table */
CREATE TABLE ngx_access_log (
    client STRING,
    country STRING,
    access_time TIMESTAMP TIME INDEX,
    PRIMARY KEY(client)
)
WITH(
  append_mode = 'true'
);

/* sink table */
CREATE TABLE ngx_country (
    country STRING,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP,
    PRIMARY KEY(country)
);

/* create flow task to calculate the distinct country */
CREATE FLOW calc_ngx_country
SINK TO ngx_country
EXPIRE AFTER '7days'::INTERVAL
COMMENT 'aggregate for distinct country'
AS
SELECT
    DISTINCT country,
    date_bin('1 hour'::INTERVAL, access_time) as time_window,
FROM ngx_access_log
GROUP BY
    country,
    time_window;
```

The above query puts the data from the `ngx_access_log` table into the `ngx_country` table.
It calculates the distinct country for each time window.
The `date_bin` function is used to group the data into one-hour intervals.
The `ngx_country` table will be continuously updated with the aggregated data,
providing real-time insights into the distinct countries that are accessing the system. The `EXPIRE AFTER` make flow ignore data with `access_time` older than 7 days and no longer calculate them anymore, see more explain in [manage-flow](manage-flow.md#expire-after).

You can insert some data into the source table `ngx_access_log`:

```sql
INSERT INTO ngx_access_log VALUES
    ('client1', 'US', now() - '2 hour'::INTERVAL),
    ('client2', 'US', now() - '2 hour'::INTERVAL),
    ('client3', 'UK', now() - '2 hour'::INTERVAL),
    ('client4', 'UK', now() - '1 hour'::INTERVAL),
    ('client5', 'CN', now() - '1 hour'::INTERVAL),
    ('client6', 'CN', now() - '1 hour'::INTERVAL),
    ('client7', 'JP', now()),
    ('client8', 'JP', now()),
    ('client9', 'KR', now()),
    ('client10', 'KR', now());
```

Wait for few seconds for the Flow to write the result to the sink table and then query:

```sql
select * from ngx_country;
```

```sql
+---------+---------------------+----------------------------+
| country | time_window         | update_at                  |
+---------+---------------------+----------------------------+
| CN      | 2025-04-24 05:00:00 | 2025-04-24 06:55:17.217000 |
| JP      | 2025-04-24 06:00:00 | 2025-04-24 06:55:17.217000 |
| KR      | 2025-04-24 06:00:00 | 2025-04-24 06:55:17.217000 |
| UK      | 2025-04-24 04:00:00 | 2025-04-24 06:55:17.217000 |
| UK      | 2025-04-24 05:00:00 | 2025-04-24 06:55:17.217000 |
| US      | 2025-04-24 04:00:00 | 2025-04-24 06:55:17.217000 |
+---------+---------------------+----------------------------+
6 rows in set (0.00 sec)
```

## Real-Time Monitoring Example

Consider a usecase where you have a stream of sensor events from a network of temperature sensors that you want to monitor in real-time. The sensor events contain information such as the sensor ID, the temperature reading, the timestamp of the reading, and the location of the sensor. You want to continuously aggregate this data to provide real-time alerts when the temperature exceeds a certain threshold. Then the query for continuous aggregation would be:

```sql
/* create input table */
CREATE TABLE temp_sensor_data (
    sensor_id INT,
    loc STRING,
    temperature DOUBLE,
    ts TIMESTAMP TIME INDEX,
    PRIMARY KEY(sensor_id, loc)
)
WITH(
  append_mode = 'true'
);

/* create sink table */
CREATE TABLE temp_alerts (
    sensor_id INT,
    loc STRING,
    max_temp DOUBLE,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP,
    PRIMARY KEY(sensor_id, loc)
);

CREATE FLOW temp_monitoring
SINK TO temp_alerts
EXPIRE AFTER '1h'
AS
SELECT
    sensor_id,
    loc,
    max(temperature) as max_temp,
    date_bin('10 seconds'::INTERVAL, ts) as time_window,
FROM temp_sensor_data
GROUP BY
    sensor_id,
    loc,
    time_window
HAVING max_temp > 100;
```

The above query continuously aggregates data from the `temp_sensor_data` table into the `temp_alerts` table.
It calculates the maximum temperature reading for each sensor and location,
filtering out data where the maximum temperature exceeds 100 degrees.
The `temp_alerts` table will be continuously updated with the aggregated data,
providing real-time alerts (in the form of new rows in the `temp_alerts` table) when the temperature exceeds the threshold. The `EXPIRE AFTER '1h'` makes flow only calculate source data with `ts` in `(now - 1h, now)` range, see more explain in [manage-flow](manage-flow.md#expire-after).

Now that we have created the flow task, we can insert some data into the source table `temp_sensor_data`:

```sql

INSERT INTO temp_sensor_data VALUES
    (1, 'room1', 98.5, now() - '10 second'::INTERVAL),
    (2, 'room2', 99.5, now());
```
table should be empty now, but still wait at least few seconds for flow to update results to sink table:

```sql
SELECT * FROM temp_alerts;
```

```sql
Empty set (0.00 sec)
```

Now insert some data that will trigger the alert:

```sql
INSERT INTO temp_sensor_data VALUES
    (1, 'room1', 101.5, now()),
    (2, 'room2', 102.5, now());
```

wait at least few seconds for flow to update results to sink table:

```sql
SELECT * FROM temp_alerts;
```

```sql
+-----------+-------+----------+---------------------+----------------------------+
| sensor_id | loc   | max_temp | time_window         | update_at                  |
+-----------+-------+----------+---------------------+----------------------------+
|         1 | room1 |    101.5 | 2025-04-24 06:58:20 | 2025-04-24 06:58:32.379000 |
|         2 | room2 |    102.5 | 2025-04-24 06:58:20 | 2025-04-24 06:58:32.379000 |
+-----------+-------+----------+---------------------+----------------------------+
2 rows in set (0.01 sec)
```

## Real-Time Dashboard

Consider a usecase in which you need a bar graph that show the distribution of packet sizes for each status code to monitor the health of the system. The query for continuous aggregation would be:

```sql
/* create input table */
CREATE TABLE ngx_access_log (
    client STRING,
    stat INT,
    size INT,
    access_time TIMESTAMP TIME INDEX
)
WITH(
  append_mode = 'true'
);
/* create sink table */
CREATE TABLE ngx_distribution (
    stat INT,
    bucket_size INT,
    total_logs BIGINT,
    time_window TIMESTAMP TIME INDEX,
    update_at TIMESTAMP,
    PRIMARY KEY(stat, bucket_size)
);
/* create flow task to calculate the distribution of packet sizes for each status code */
CREATE FLOW calc_ngx_distribution SINK TO ngx_distribution
EXPIRE AFTER '6h'
AS
SELECT
    stat,
    trunc(size, -1)::INT as bucket_size,
    count(client) AS total_logs,
    date_bin('1 minutes'::INTERVAL, access_time) as time_window,
FROM
    ngx_access_log
GROUP BY
    stat,
    time_window,
    bucket_size;
```

The query aggregates data from the `ngx_access_log` table into the `ngx_distribution` table.
It computes the total number of logs for each status code and packet size bucket (bucket size of 10, as specified by `trunc` with a second argument of -1) within each time window.
The `date_bin` function groups the data into one-minute intervals.
The `EXPIRE AFTER '6h'` ensures that the flow computation only uses source data from the last 6 hours. See more details in [manage-flow](manage-flow.md#expire-after).
Consequently, the `ngx_distribution` table is continuously updated, offering real-time insights into the distribution of packet sizes per status code.

Now that we have created the flow task, we can insert some data into the source table `ngx_access_log`:

```sql
INSERT INTO ngx_access_log VALUES
    ('cli1', 200, 100, now()),
    ('cli2', 200, 104, now()),
    ('cli3', 200, 120, now()),
    ('cli4', 200, 124, now()),
    ('cli5', 200, 140, now()),
    ('cli6', 404, 144, now()),
    ('cli7', 404, 160, now()),
    ('cli8', 404, 164, now()),
    ('cli9', 404, 180, now()),
    ('cli10', 404, 184, now());
```
wait at least few seconds for flow to update results to sink table:

```sql
SELECT * FROM ngx_distribution;
```

```sql
+------+-------------+------------+---------------------+----------------------------+
| stat | bucket_size | total_logs | time_window         | update_at                  |
+------+-------------+------------+---------------------+----------------------------+
|  200 |         100 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  200 |         120 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  200 |         140 |          1 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  404 |         140 |          1 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  404 |         160 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
|  404 |         180 |          2 | 2025-04-24 07:05:00 | 2025-04-24 07:05:56.308000 |
+------+-------------+------------+---------------------+----------------------------+
6 rows in set (0.00 sec)
```

## Using TQL with Flow for Advanced Time-Series Analysis

:::warning Experimental Feature
This experimental feature may contain unexpected behavior and have its functionality change in the future.
:::

TQL (Time Query Language) can be seamlessly integrated with Flow to perform advanced time-series computations like rate calculations, moving averages, and other complex time-window operations. This combination allows you to create continuous aggregation flows that leverage TQL's powerful analytical functions for real-time insights.


### Understanding TQL Flow Components

The TQL integration with Flow provides several advantages:

1. **Time Range Specification**: The `EVAL (start_time, end_time, step)` syntax allows precise control over the evaluation window, see [TQL](/reference/sql/tql.md).
2. **Automatic Schema Generation**: GreptimeDB creates appropriate sink tables based on TQL function outputs
3. **Continuous Processing**: Combined with Flow's scheduling, TQL functions run continuously on incoming data
4. **Advanced Analytics**: Access to sophisticated time-series functions like `rate()`, `increase()`, and statistical aggregations

### Setting Up the Source Table

First, let's create a source table to store HTTP request metrics:

```sql
CREATE TABLE http_requests_total (
    host STRING,
    job STRING,
    instance STRING,
    byte DOUBLE,
    ts TIMESTAMP TIME INDEX,
    PRIMARY KEY (host, job, instance)
);
```

This table will serve as the data source for our TQL-based Flow computations. The `ts` column acts as the time index, while `byte` represents the metric values we want to analyze.

### Creating a Rate Calculation Flow

Now we'll create a Flow that uses TQL to calculate the rate of `byte` over time:

```sql
CREATE FLOW calc_rate 
SINK TO rate_reqs 
EVAL INTERVAL '1m' AS
TQL EVAL (now() - '1m'::interval, now(), '30s') rate(http_requests_total{job="my_service"}[1m]);
```

This Flow definition includes several key components:
- **TQL EVAL**: Specifies the time range for evaluation from 1 minute ago to now, see [TQL](/reference/sql/tql.md).
- **rate()**: TQL function that calculates the rate of change
- **[1m]**: Defines a 1-minute lookback window for the rate calculation
- **EVAL INTERVAL '1m'**: Executes the Flow every minute for continuous updates

### Examining the Generated Sink Table

You can inspect the automatically created sink table structure:

```sql
SHOW CREATE TABLE rate_reqs;
```

```sql
+-----------+-------------------------------------+
| Table     | Create Table                        |
+-----------+-------------------------------------+
| rate_reqs | CREATE TABLE IF NOT EXISTS `rate_reqs` (
  `ts` TIMESTAMP(3) NOT NULL,
  `prom_rate(ts_range,byte,ts,Int64(60000))` DOUBLE NULL,
  `host` STRING NULL,
  `job` STRING NULL,
  `instance` STRING NULL,
  TIME INDEX (`ts`),
  PRIMARY KEY (`host`, `job`, `instance`)
)

ENGINE=mito
 |
+-----------+-------------------------------------+
```

This shows how GreptimeDB automatically generates the appropriate schema for storing TQL computation results, creating a table with the same structure as the prom ql query result.

### Testing with Sample Data

Let's insert some test data to see the Flow in action:

```sql
INSERT INTO TABLE http_requests_total VALUES
    ('localhost', 'my_service', 'instance1', 100, now() - INTERVAL '2' minute),
    ('localhost', 'my_service', 'instance1', 200, now() - INTERVAL '1' minute),
    ('remotehost', 'my_service', 'instance1', 300, now() - INTERVAL '30' second),
    ('remotehost', 'their_service', 'instance1', 300, now() - INTERVAL '30' second),
    ('localhost', 'my_service', 'instance1', 400, now());
```

This creates a simple increasing sequence of values over time, which will produce a measurable rate when processed by our TQL Flow.

### Triggering Flow Execution

To manually trigger the Flow computation and see immediate results:

```sql
ADMIN FLUSH_FLOW('calc_rate');
```

This command forces the Flow to process all available data immediately, rather than waiting for the next scheduled interval.

### Verifying Results

Finally, verify that the Flow has successfully processed the data:

```sql
SELECT count(*) > 0 FROM rate_reqs;
```

```sql
+---------------------+
| count(*) > Int64(0) |
+---------------------+
| true                |
+---------------------+
```

This query confirms that the rate calculation has produced results and populated the sink table with computed rate values.

You can also examine the actual computed rate values:

```sql
SELECT * FROM rate_reqs;
```

```sql
+---------------------+------------------------------------------+-----------+------------+-----------+
| ts                  | prom_rate(ts_range,byte,ts,Int64(60000)) | host      | job        | instance  |
+---------------------+------------------------------------------+-----------+------------+-----------+
| 2025-09-01 13:14:34 |                        4.166666666666666 | localhost | my_service | instance1 |
| 2025-09-01 13:15:04 |                        4.444444444444444 | localhost | my_service | instance1 |
+---------------------+------------------------------------------+-----------+------------+-----------+
2 rows in set (0.03 sec)
```

Note that the timestamps and exact rate values may vary depending on when you run the example, but you should see similar rate calculations based on the input data pattern.

### Cleanup

When you're done experimenting, clean up the resources:

```sql
DROP FLOW calc_rate;
DROP TABLE http_requests;
DROP TABLE rate_reqs;
```

This approach demonstrates how TQL and Flow work together to enable sophisticated continuous aggregation scenarios, providing real-time analytical capabilities for time-series data processing.
## Next Steps

- [Manage Flow](manage-flow.md): Gain insights into the mechanisms of the Flow engine and the SQL syntax for defining a Flow.
- [Expressions](expressions.md): Learn about the expressions supported by the Flow engine for data transformation.
