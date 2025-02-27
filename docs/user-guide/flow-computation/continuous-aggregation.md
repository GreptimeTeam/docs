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
providing real-time insights into the distinct countries that are accessing the system. 

You can insert some data into the source table `ngx_access_log`:

```sql
INSERT INTO ngx_access_log VALUES
    ("client1", "US", "2022-01-01 01:00:00"),
    ("client2", "US", "2022-01-01 01:00:00"),
    ("client3", "UK", "2022-01-01 01:00:00"),
    ("client4", "UK", "2022-01-01 02:00:00"),
    ("client5", "CN", "2022-01-01 02:00:00"),
    ("client6", "CN", "2022-01-01 02:00:00"),
    ("client7", "JP", "2022-01-01 03:00:00"),
    ("client8", "JP", "2022-01-01 03:00:00"),
    ("client9", "KR", "2022-01-01 03:00:00"),
    ("client10", "KR", "2022-01-01 03:00:00");
```

Wait for one second for the Flow to write the result to the sink table and then query:

```sql
select * from ngx_country;
```

```sql
+---------+---------------------+----------------------------+
| country | time_window         | update_at                  |
+---------+---------------------+----------------------------+
| CN      | 2022-01-01 02:00:00 | 2024-10-22 08:17:47.906000 |
| JP      | 2022-01-01 03:00:00 | 2024-10-22 08:17:47.906000 |
| KR      | 2022-01-01 03:00:00 | 2024-10-22 08:17:47.906000 |
| UK      | 2022-01-01 01:00:00 | 2024-10-22 08:17:47.906000 |
| UK      | 2022-01-01 02:00:00 | 2024-10-22 08:17:47.906000 |
| US      | 2022-01-01 01:00:00 | 2024-10-22 08:17:47.906000 |
+---------+---------------------+----------------------------+
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
providing real-time alerts (in the form of new rows in the `temp_alerts` table) when the temperature exceeds the threshold.

Now that we have created the flow task, we can insert some data into the source table `temp_sensor_data`:

```sql

INSERT INTO temp_sensor_data VALUES
    (1, "room1", 98.5, "2022-01-01 00:00:00"),
    (2, "room2", 99.5, "2022-01-01 00:00:01");
```
table should be empty now, but still wait at least one second for flow to update results to sink table:

```sql
SELECT * FROM temp_alerts;
```

```sql
Empty set (0.00 sec)
```

Now insert some data that will trigger the alert:

```sql
INSERT INTO temp_sensor_data VALUES
    (1, "room1", 101.5, "2022-01-01 00:00:02"),
    (2, "room2", 102.5, "2022-01-01 00:00:03");
```

wait at least one second for flow to update results to sink table:

```sql
SELECT * FROM temp_alerts;
```

```sql
+-----------+-------+----------+---------------------+----------------------------+
| sensor_id | loc   | max_temp | time_window         | update_at                  |
+-----------+-------+----------+---------------------+----------------------------+
|         1 | room1 |    101.5 | 2022-01-01 00:00:00 | 2024-10-22 09:13:07.535000 |
|         2 | room2 |    102.5 | 2022-01-01 00:00:00 | 2024-10-22 09:13:07.535000 |
+-----------+-------+----------+---------------------+----------------------------+
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
CREATE FLOW calc_ngx_distribution SINK TO ngx_distribution AS
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
Consequently, the `ngx_distribution` table is continuously updated, offering real-time insights into the distribution of packet sizes per status code.

Now that we have created the flow task, we can insert some data into the source table `ngx_access_log`:

```sql
INSERT INTO ngx_access_log VALUES
    ("cli1", 200, 100, "2022-01-01 00:00:00"),
    ("cli2", 200, 104, "2022-01-01 00:00:01"),
    ("cli3", 200, 120, "2022-01-01 00:00:02"),
    ("cli4", 200, 124, "2022-01-01 00:00:03"),
    ("cli5", 200, 140, "2022-01-01 00:00:04"),
    ("cli6", 404, 144, "2022-01-01 00:00:05"),
    ("cli7", 404, 160, "2022-01-01 00:00:06"),
    ("cli8", 404, 164, "2022-01-01 00:00:07"),
    ("cli9", 404, 180, "2022-01-01 00:00:08"),
    ("cli10", 404, 184, "2022-01-01 00:00:09");
```
wait at least one second for flow to update results to sink table:

```sql
SELECT * FROM ngx_distribution;
```

```sql
+------+-------------+------------+---------------------+----------------------------+
| stat | bucket_size | total_logs | time_window         | update_at                  |
+------+-------------+------------+---------------------+----------------------------+
|  200 |         100 |          2 | 2022-01-01 00:00:00 | 2024-10-22 09:17:09.592000 |
|  200 |         120 |          2 | 2022-01-01 00:00:00 | 2024-10-22 09:17:09.592000 |
|  200 |         140 |          1 | 2022-01-01 00:00:00 | 2024-10-22 09:17:09.592000 |
|  404 |         140 |          1 | 2022-01-01 00:00:00 | 2024-10-22 09:17:09.592000 |
|  404 |         160 |          2 | 2022-01-01 00:00:00 | 2024-10-22 09:17:09.592000 |
|  404 |         180 |          2 | 2022-01-01 00:00:00 | 2024-10-22 09:17:09.592000 |
+------+-------------+------------+---------------------+----------------------------+
```

## Next Steps

- [Manage Flow](manage-flow.md): Gain insights into the mechanisms of the Flow engine and the SQL syntax for defining a Flow.
- [Expressions](expressions.md): Learn about the expressions supported by the Flow engine for data transformation.

