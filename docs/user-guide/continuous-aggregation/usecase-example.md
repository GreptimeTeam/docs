# Usecase Example
Following are three major usecase examples for continuous aggregation:

1. **Real-time Analytics**: A real-time analytics platform that continuously aggregates data from a stream of events, delivering immediate insights while optionally downsampling the data to a lower resolution. For instance, this system can compile data from a high-frequency stream of log events (e.g., occurring every millisecond) to provide up-to-the-minute insights such as the number of requests per minute, average response times, and error rates per minute.

2. **Real-time Monitoring**: A real-time monitoring system that continuously aggregates data from a stream of events and provides real-time alerts based on the aggregated data. For example, a system that aggregates data from a stream of sensor events and provides real-time alerts when the temperature exceeds a certain threshold.

3. **Real-time Dashboard**: A real-time dashboard that shows the number of requests per minute, the average response time, and the number of errors per minute. This dashboard can be used to monitor the health of the system and to detect any anomalies in the system.

In all these usecases, the continuous aggregation system continuously aggregates data from a stream of events and provides real-time insights and alerts based on the aggregated data. The system can also downsample the data to a lower resolution to reduce the amount of data stored and processed. This allows the system to provide real-time insights and alerts while keeping the data storage and processing costs low.

## Real-time Analytics Example

Consider a usecase where you have a stream of log events from a web server that you want to analyze in real-time. The log events contain information such as the status of the request, the size of the response, the client IP address, and the timestamp of the request. You want to continuously aggregate this data to provide real-time analytics on the number of requests per minute, the min/max/average packet size, and the error rate per minute. Then the query for continuous aggregation would be:

```sql
CREATE FLOW ngx_aggregation
SINK TO ngx_statistics
AS 
SELECT 
    status,
    count(client) AS total_logs,
    sum(case when status >= 400 then 1 end) as error_logs,
    min(size) as min_size,
    max(size) as max_size,
    avg(size) as avg_size
FROM ngx_access_log 
GROUP BY
    status,
    date_bin(INTERVAL '1 minutes', access_time, '2024-01-01 00:00:00'::Timestamp);
```

The above query continuously aggregates the data from the `ngx_access_log` table into the `ngx_statistics` table. It calculates the total number of logs, the number of error logs, the min/max/average packet size, and the error rate per minute. The `date_bin` function is used to group the data into one-minute intervals. The `ngx_statistics` table will be continuously updated with the aggregated data, providing real-time insights into the web server's performance.

## Real-time Monitoring Example

Consider a usecase where you have a stream of sensor events from a network of temperature sensors that you want to monitor in real-time. The sensor events contain information such as the sensor ID, the temperature reading, the timestamp of the reading, and the location of the sensor. You want to continuously aggregate this data to provide real-time alerts when the temperature exceeds a certain threshold. Then the query for continuous aggregation would be:

```sql
CREATE TABLE temp_sensor_data (
    sensor_id INT,
    loc STRING,
    temperature DOUBLE,
    ts TIMESTAMP TIME INDEX
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

The above query continuously aggregates the data from the `temp_sensor_data` table into the `temp_alerts` table. It calculates the maximum temperature reading for each sensor and location and filters out the data where the maximum temperature exceeds 100 degrees. The `temp_alerts` table will be continuously updated with the aggregated data, providing real-time alerts (Which is a new row in the `temp_alerts` table) when the temperature exceeds the threshold.


## Real-time Dashboard

Consider a usecase in which you need a bar graph that show the distribution of packet sizes for each status code to monitor the health of the system. The query for continuous aggregation would be:

```sql
CREATE FLOW calc_ngx_distribution
SINK TO ngx_distribution
AS
SELECT
    status,
    trunc(size, -1) as bucket_size,
    count(client) AS total_logs,
    date_bin(INTERVAL '1 minutes', access_time) as time_window,
FROM ngx_access_log
GROUP BY
    status,
    time_window,
    bucket;
```

The above query put the data from the `ngx_access_log` table into the `ngx_distribution` table. It calculates the total number of logs for each status code and packet size bucket for each time window. The `date_bin` function is used to group the data into one-minute intervals. The `ngx_distribution` table will be continuously updated with the aggregated data, providing real-time insights into the distribution of packet sizes for each status code.

# Conclusion

Continuous aggregation is a powerful tool for real-time analytics, monitoring, and dashboarding. It allows you to continuously aggregate data from a stream of events and provide real-time insights and alerts based on the aggregated data. By downsampling the data to a lower resolution, you can reduce the amount of data stored and processed, making it easier to provide real-time insights and alerts while keeping the data storage and processing costs low. Continuous aggregation is a key component of any real-time data processing system and can be used in a wide range of usecases to provide real-time insights and alerts based on streaming data.