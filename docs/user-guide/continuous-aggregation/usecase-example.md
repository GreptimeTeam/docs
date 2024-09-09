# Usecase Examples
Following are three major usecase examples for continuous aggregation:

1. **Real-time Analytics**: A real-time analytics platform that continuously aggregates data from a stream of events, delivering immediate insights while optionally downsampling the data to a lower resolution. For instance, this system can compile data from a high-frequency stream of log events (e.g., occurring every millisecond) to provide up-to-the-minute insights such as the number of requests per minute, average response times, and error rates per minute.

2. **Real-time Monitoring**: A real-time monitoring system that continuously aggregates data from a stream of events and provides real-time alerts based on the aggregated data. For example, a system that aggregates data from a stream of sensor events and provides real-time alerts when the temperature exceeds a certain threshold.

3. **Real-time Dashboard**: A real-time dashboard that shows the number of requests per minute, the average response time, and the number of errors per minute. This dashboard can be used to monitor the health of the system and to detect any anomalies in the system.

In all these usecases, the continuous aggregation system continuously aggregates data from a stream of events and provides real-time insights and alerts based on the aggregated data. The system can also downsample the data to a lower resolution to reduce the amount of data stored and processed. This allows the system to provide real-time insights and alerts while keeping the data storage and processing costs low.

## Real-time analytics example

See [Overview](overview.md) for an example of real-time analytics. Which is to calculate the total number of logs, the minimum size, the maximum size, the average size, and the number of packets with the size greater than 550 for each status code in a 1-minute fixed window for access logs.

Another example of real-time analytics is to get all distinct country from the `ngx_access_log` table. The query for continuous aggregation would be:

```sql
/* input table */
CREATE TABLE ngx_access_log (
    client STRING,
    country STRING,
    access_time TIMESTAMP TIME INDEX
);

/* sink table */
CREATE TABLE ngx_country (
    country STRING,
    update_at TIMESTAMP,
    __ts_placeholder TIMESTAMP TIME INDEX, /* placeholder column for time index */
    PRIMARY KEY(country)
);

/* create flow task to calculate the distinct country */
CREATE FLOW calc_ngx_country
SINK TO ngx_country
AS
SELECT
    DISTINCT country,
FROM ngx_access_log;
```

now that we have created the flow task, we can insert some data into the source table `ngx_access_log`:

```sql
/* insert some data */
INSERT INTO ngx_access_log VALUES
    ("client1", "US", "2022-01-01 00:00:00"),
    ("client2", "US", "2022-01-01 00:00:01"),
    ("client3", "UK", "2022-01-01 00:00:02"),
    ("client4", "UK", "2022-01-01 00:00:03"),
    ("client5", "CN", "2022-01-01 00:00:04"),
    ("client6", "CN", "2022-01-01 00:00:05"),
    ("client7", "JP", "2022-01-01 00:00:06"),
    ("client8", "JP", "2022-01-01 00:00:07"),
    ("client9", "KR", "2022-01-01 00:00:08"),
    ("client10", "KR", "2022-01-01 00:00:09");

/* check the result */
select * from ngx_country;
```

or if you want to group the data by time window, you can use the following query:

```sql
/* input table create same as above */
/* sink table */
CREATE TABLE ngx_country (
    country STRING,
    time_window TIMESTAMP TIME INDEX,/* no need to use __ts_placeholder here since we have a time window column as time index */
    update_at TIMESTAMP,
    PRIMARY KEY(country)
);
CREATE FLOW calc_ngx_country
SINK TO ngx_country
AS
SELECT
    DISTINCT country,
    date_bin(INTERVAL '1 hour', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    country,
    time_window;
/* insert data using the same data as above */
```

The above query puts the data from the `ngx_access_log` table into the `ngx_country` table. It calculates the distinct country for each time window. The `date_bin` function is used to group the data into one-hour intervals. The `ngx_country` table will be continuously updated with the aggregated data, providing real-time insights into the distinct countries that are accessing the system. 

Note that there is currently no persistent storage for flow's internal state, internal state refer to intermediate state used in computing incremental query result, like accumulator's value for a aggregation query(i.e. `count(col)`'s accumulator record current count number), there is persistent storage for the sink table data however.
so it's recommended to use appropriate time window(i.e. hourly if you can tolerate loss one hour of data when rebooting) to miniminize data loss, because if the internal state is lost, related time window data will be lost as well.

## Real-time monitoring example

Consider a usecase where you have a stream of sensor events from a network of temperature sensors that you want to monitor in real-time. The sensor events contain information such as the sensor ID, the temperature reading, the timestamp of the reading, and the location of the sensor. You want to continuously aggregate this data to provide real-time alerts when the temperature exceeds a certain threshold. Then the query for continuous aggregation would be:

```sql
/* create input table */
CREATE TABLE temp_sensor_data (
    sensor_id INT,
    loc STRING,
    temperature DOUBLE,
    ts TIMESTAMP TIME INDEX
);

/* create sink table */
CREATE TABLE temp_alerts (
    sensor_id INT,
    loc STRING,
    max_temp DOUBLE,
    update_at TIMESTAMP TIME INDEX,
    PRIMARY KEY(sensor_id, loc)
);

CREATE FLOW temp_monitoring
SINK TO temp_alerts
AS
SELECT
    sensor_id,
    loc,
    max(temperature) as max_temp,
FROM temp_sensor_data
GROUP BY
    sensor_id,
    loc
HAVING max_temp > 100;
```

Now that we have created the flow task, we can insert some data into the source table `temp_sensor_data`:

```sql

INSERT INTO temp_sensor_data VALUES
    (1, "room1", 98.5, "2022-01-01 00:00:00"),
    (2, "room2", 99.5, "2022-01-01 00:00:01");

/* You may want to flush the flow task to see the result */
ADMIN FLUSH_FLOW('temp_monitoring');

/* for now sink table will be empty */
SELECT * FROM temp_alerts;

INSERT INTO temp_sensor_data VALUES
    (1, "room1", 101.5, "2022-01-01 00:00:02"),
    (2, "room2", 102.5, "2022-01-01 00:00:03");

/* You may want to flush the flow task to see the result */
ADMIN FLUSH_FLOW('temp_monitoring');

/* now sink table will have the max temperature data */
SELECT * FROM temp_alerts;
```

The above query continuously aggregates the data from the `temp_sensor_data` table into the `temp_alerts` table. It calculates the maximum temperature reading for each sensor and location and filters out the data where the maximum temperature exceeds 100 degrees. The `temp_alerts` table will be continuously updated with the aggregated data, providing real-time alerts (Which is a new row in the `temp_alerts` table) when the temperature exceeds the threshold.


## Real-time dashboard

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
    update_at TIMESTAMP, /* auto generated column to store the last update time */
    PRIMARY KEY(stat, bucket_size)
);
/* create flow task to calculate the distribution of packet sizes for each status code */
CREATE FLOW calc_ngx_distribution SINK TO ngx_distribution AS
SELECT
    stat,
    trunc(size, -1)::INT as bucket_size,
    count(client) AS total_logs,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM
    ngx_access_log
GROUP BY
    stat,
    time_window,
    bucket_size;
```

Now that we have created the flow task, we can insert some data into the source table `ngx_access_log`:

```sql

INSERT INTO ngx_access_log VALUES
    ("cli1", 200, 100, "2022-01-01 00:00:00"),
    ("cli2", 200, 110, "2022-01-01 00:00:01"),
    ("cli3", 200, 120, "2022-01-01 00:00:02"),
    ("cli4", 200, 130, "2022-01-01 00:00:03"),
    ("cli5", 200, 140, "2022-01-01 00:00:04"),
    ("cli6", 404, 150, "2022-01-01 00:00:05"),
    ("cli7", 404, 160, "2022-01-01 00:00:06"),
    ("cli8", 404, 170, "2022-01-01 00:00:07"),
    ("cli9", 404, 180, "2022-01-01 00:00:08"),
    ("cli10", 404, 190, "2022-01-01 00:00:09");

SELECT * FROM ngx_distribution;
```

The above query puts the data from the `ngx_access_log` table into the `ngx_distribution` table. It calculates the total number of logs for each status code and packet size bucket (in this case, since `trunc`'s second argument is -1, meaning a bucket size of 10) for each time window. The `date_bin` function is used to group the data into one-minute intervals. The `ngx_distribution` table will be continuously updated with the aggregated data, providing real-time insights into the distribution of packet sizes for each status code.

## Conclusion

Continuous aggregation is a powerful tool for real-time analytics, monitoring, and dashboarding. It allows you to continuously aggregate data from a stream of events and provide real-time insights and alerts based on the aggregated data. By downsampling the data to a lower resolution, you can reduce the amount of data stored and processed, making it easier to provide real-time insights and alerts while keeping the data storage and processing costs low. Continuous aggregation is a key component of any real-time data processing system and can be used in a wide range of usecases to provide real-time insights and alerts based on streaming data.