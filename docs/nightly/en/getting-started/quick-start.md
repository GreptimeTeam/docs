# Quick Start

Before proceeding, please ensure you have [installed GreptimeDB](./installation/overview.md).

This guide will walk you through creating a metric table and a log table, highlighting the core features of GreptimeDB.


## Connect to GreptimeDB

If your GreptimeDB instance is running on` 127.0.0.1` with the default port `4000`,
you can connect to it using either a MySQL or PostgreSQL client:

```shell
mysql -h 127.0.0.1 -P 4002
```

Or

```shell
psql -h 127.0.0.1 -p 4003 -d public
```

## Create tables

Suppose you have a table named `grpc_metrics` that stores the gRPC latency of your application.
The table schema is as follows:

```sql
CREATE TABLE grpc_metrics (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    method_name STRING,
    latency DOUBLE,
    PRIMARY KEY (host, method_name)
);
```

- `ts`: The timestamp when the metric was collected. It is the time index column.
- `host`: The hostname of the application server. It is a tag column.
- `method_name`: The name of the RPC request method. It is a tag column.
- `latency`: The latency of the RPC request.

Additionally, there is a table `app_logs` for storing application logs:

```sql
CREATE TABLE app_logs (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    path STRING,
    error STRING FULLTEXT,
    PRIMARY KEY (host)
);
```

- `ts`: The timestamp of the log entry. It is the time index column.
- `host`: The hostname of the application server. It is a tag column.
- `path`: The URL path of the RPC request.
- `error`: The error message, [indexed with `FULLTEXT`](/user-guide/logs/query-logs.md#full-text-index-for-accelerated-search) for accelerated search.

## Write data

Let's insert some mocked data to simulate collected metrics and error logs.

Two application servers, `host1` and `host2`,
have been recording RPC latencies. Starting from `2024-07-11 20:00:10`,
`host1` experienced a significant increase in latency.

The following image shows the unstable latencies of `host1`.

<img src="/unstable-latencies.png" alt="unstable latencies" width="600">

The following SQL statements insert the mocked data.

Before `2024-07-11 20:00:10`, the hosts were functioning normally:

```sql
INSERT INTO grpc_metrics (ts, host, method_name, latency) VALUES
('2024-07-11 20:00:06', 'host1', 'GetUser', 103.0),
('2024-07-11 20:00:06', 'host2', 'GetUser', 113.0),
('2024-07-11 20:00:07', 'host1', 'GetUser', 103.5),
('2024-07-11 20:00:07', 'host2', 'GetUser', 107.0),
('2024-07-11 20:00:08', 'host1', 'GetUser', 104.0),
('2024-07-11 20:00:08', 'host2', 'GetUser', 96.0),
('2024-07-11 20:00:09', 'host1', 'GetUser', 104.5),
('2024-07-11 20:00:09', 'host2', 'GetUser', 114.0);
```

After `2024-07-11 20:00:10`, `host1`'s latency becomes unstable:

```sql
INSERT INTO grpc_metrics (ts, host, method_name, latency) VALUES
('2024-07-11 20:00:10', 'host1', 'GetUser', 150.0),
('2024-07-11 20:00:10', 'host2', 'GetUser', 110.0),
('2024-07-11 20:00:11', 'host1', 'GetUser', 200.0),
('2024-07-11 20:00:11', 'host2', 'GetUser', 102.0),
('2024-07-11 20:00:12', 'host1', 'GetUser', 1000.0),
('2024-07-11 20:00:12', 'host2', 'GetUser', 108.0),
('2024-07-11 20:00:13', 'host1', 'GetUser', 80.0),
('2024-07-11 20:00:13', 'host2', 'GetUser', 111.0),
('2024-07-11 20:00:14', 'host1', 'GetUser', 4200.0),
('2024-07-11 20:00:14', 'host2', 'GetUser', 95.0),
('2024-07-11 20:00:15', 'host1', 'GetUser', 90.0),
('2024-07-11 20:00:15', 'host2', 'GetUser', 115.0),
('2024-07-11 20:00:16', 'host1', 'GetUser', 3000.0),
('2024-07-11 20:00:16', 'host2', 'GetUser', 95.0),
('2024-07-11 20:00:17', 'host1', 'GetUser', 320.0),
('2024-07-11 20:00:17', 'host2', 'GetUser', 115.0),
('2024-07-11 20:00:18', 'host1', 'GetUser', 3500.0),
('2024-07-11 20:00:18', 'host2', 'GetUser', 95.0),
('2024-07-11 20:00:19', 'host1', 'GetUser', 100.0),
('2024-07-11 20:00:19', 'host2', 'GetUser', 115.0),
('2024-07-11 20:00:20', 'host1', 'GetUser', 2500.0),
('2024-07-11 20:00:20', 'host2', 'GetUser', 95.0);
```

Some error logs were collected when the `host1` latency of RPC requests encounter latency issues.

```sql
INSERT INTO app_logs (ts, host, path, error) VALUES
('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'Error: Connection timeout'),
('2024-07-11 20:00:11', 'host1', '/api/v1/resource', 'Error: Database unavailable'),
('2024-07-11 20:00:12', 'host1', '/api/v1/resource', 'Error: Service overload'),
('2024-07-11 20:00:13', 'host1', '/api/v1/resource', 'Error: Connection reset'),
('2024-07-11 20:00:14', 'host1', '/api/v1/resource', 'Error: Timeout'),
('2024-07-11 20:00:15', 'host1', '/api/v1/resource', 'Error: Disk full'),
('2024-07-11 20:00:16', 'host1', '/api/v1/resource', 'Error: Network issue');
```

## Query data

### Filter by tags and time index

You can filter data using the WHERE clause.
For example, to query the latency of `host1` after `2024-07-11 20:00:15`:

```sql
SELECT * FROM grpc_metrics WHERE host = 'host1' AND ts > '2024-07-11 20:00:15';
```

```sql
+---------------------+-------+-------------+---------+
| ts                  | host  | method_name | latency |
+---------------------+-------+-------------+---------+
| 2024-07-11 20:00:16 | host1 | GetUser     |    3000 |
| 2024-07-11 20:00:17 | host1 | GetUser     |     320 |
| 2024-07-11 20:00:18 | host1 | GetUser     |    3500 |
| 2024-07-11 20:00:19 | host1 | GetUser     |     100 |
| 2024-07-11 20:00:20 | host1 | GetUser     |    2500 |
+---------------------+-------+-------------+---------+
5 rows in set (0.01 sec)
```

You can also use functions when filtering the data.
For example, you can use `approx_percentile_cont` to calculate the 95th percentile of the latency grouped by the host:

```sql
SELECT approx_percentile_cont(latency, 0.95) AS p95_latency, host FROM grpc_metrics WHERE ts >= '2024-07-11 20:00:10' GROUP BY host;
```

```sql
+-------------------+-------+
| p95_latency       | host  |
+-------------------+-------+
| 4164.999999999999 | host1 |
|               115 | host2 |
+-------------------+-------+
2 rows in set (0.02 sec)
```

### Range query

You can use [range queries](/reference/sql/range#range-query) to monitor latencies in real-time.
For example, to calculate the p95 latency of requests using a 5-second window:

```sql
SELECT 
  ts, 
  host, 
  approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency 
FROM 
  grpc_metrics
ALIGN '5s' FILL PREV;
```

```sql
+---------------------+-------+-------------+
| ts                  | host  | p95_latency |
+---------------------+-------+-------------+
| 2024-07-11 20:00:05 | host2 |         114 |
| 2024-07-11 20:00:10 | host2 |         111 |
| 2024-07-11 20:00:15 | host2 |         115 |
| 2024-07-11 20:00:20 | host2 |          95 |
| 2024-07-11 20:00:05 | host1 |       104.5 |
| 2024-07-11 20:00:10 | host1 |        4200 |
| 2024-07-11 20:00:15 | host1 |        3500 |
| 2024-07-11 20:00:20 | host1 |        2500 |
+---------------------+-------+-------------+
8 rows in set (0.15 sec)
```

### Full-text search

The latency analysis above indicates that `host1` may be experiencing some issues.
You can utilize the full-text search `matches(path, 'api/v1')` to identify error logs associated with the specific API `api/v1`:

```sql
SELECT 
  ts, 
  count(error) RANGE '5s' AS num_errors,
  first_value(error) RANGE '5s' AS first_error, 
  last_value(error) RANGE '5s' AS last_error,
  host
FROM
  app_logs
WHERE
  matches(path, 'api/v1')
ALIGN '5s';
```

```sql
+---------------------+------------+---------------------------+----------------------+-------+
| ts                  | num_errors | first_error               | last_error           | host  |
+---------------------+------------+---------------------------+----------------------+-------+
| 2024-07-11 20:00:10 |          5 | Error: Connection timeout | Error: Timeout       | host1 |
| 2024-07-11 20:00:15 |          2 | Error: Disk full          | Error: Network issue | host1 |
+---------------------+------------+---------------------------+----------------------+-------+
2 rows in set (0.08 sec)
```

The SQL result shows that the application was functioning properly until `2024-07-11 20:00:10`,
when an `Error: Connection timeout` occurred.
Between `2024-07-11 20:00:10` and `2024-07-11 20:00:15`, there were 5 error logs.

### Correlate Metrics and Logs

By combining the data from the two tables,
you can easily and quickly determine the time of failure and the corresponding logs.
The following SQL query uses the `JOIN` operation to correlate the metrics and logs:

```sql
WITH
  metrics AS (
    SELECT 
      ts, 
      host, 
      approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency 
    FROM 
      grpc_metrics 
    ALIGN '5s' FILL PREV
  ), 
  logs AS (
    SELECT 
      ts, 
      host,
      first_value(error) RANGE '5s' AS first_error,
      last_value(error) RANGE '5s' AS last_error, 
      count(error) RANGE '5s' AS num_errors, 
    FROM 
      app_logs 
    WHERE 
      matches(path, 'api/v1') 
    ALIGN '5s'
) 
--- Analyze and correlate metrics and logs ---
SELECT 
  metrics.ts,
  p95_latency, 
  coalesce(num_errors, 0) as num_errors,
  logs.first_error,
  logs.last_error,
  metrics.host
FROM 
  metrics 
  LEFT JOIN logs ON metrics.host = logs.host 
  AND metrics.ts = logs.ts 
ORDER BY 
  metrics.ts;
```


```sql
+---------------------+-------------+------------+---------------------------+----------------------+-------+
| ts                  | p95_latency | num_errors | first_error               | last_error           | host  |
+---------------------+-------------+------------+---------------------------+----------------------+-------+
| 2024-07-11 20:00:05 |       104.5 |          0 | NULL                      | NULL                 | host1 |
| 2024-07-11 20:00:05 |         114 |          0 | NULL                      | NULL                 | host2 |
| 2024-07-11 20:00:10 |        4200 |          5 | Error: Connection timeout | Error: Timeout       | host1 |
| 2024-07-11 20:00:10 |         111 |          0 | NULL                      | NULL                 | host2 |
| 2024-07-11 20:00:15 |         115 |          0 | NULL                      | NULL                 | host2 |
| 2024-07-11 20:00:15 |        3500 |          2 | Error: Disk full          | Error: Network issue | host1 |
| 2024-07-11 20:00:20 |          95 |          0 | NULL                      | NULL                 | host2 |
| 2024-07-11 20:00:20 |        2500 |          0 | NULL                      | NULL                 | host1 |
+---------------------+-------------+------------+---------------------------+----------------------+-------+
8 rows in set (0.08 sec)
```

<!-- TODO need to fix bug

### Continuous aggregation

For further analysis or reduce the scan cost when aggregating data frequently, you can save the aggregation results to another tables. This can be implemented by using the [continuous aggregation](/user-guide/continuous-aggregation/overview.md) feature of GreptimeDB.

For example, aggregate the API error number by 5-second and save the data to table `api_error_count`.

Create the `api_error_count` table:

```sql
CREATE TABLE api_error_count (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  num_errors int, 
  PRIMARY KEY(host)
);
```

Then, create a Flow to aggregate the error number by 5-second:

```sql
CREATE FLOW flow_api_error_count 
SINK TO api_error_count
AS
SELECT 
  date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond) AS ts,
  host,
  count(error) RANGE '5s' AS num_errors
FROM 
  app_logs 
GROUP BY date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond);
``` -->

## GreptimeDB Dashboard

GreptimeDB offers a [dashboard](./installation/greptimedb-dashboard.md) for data exploration and management.

### Explore data

Once GreptimeDB is started as mentioned in the [installation section](./installation/overview.md), you can access the dashboard through the HTTP endpoint `http://localhost:4000/dashboard`.

To add a new query, click on the `+` button, write your SQL command in the command text, and then click on `Run All`. This will retrieve all the data from the `grpc_metrics` table.

```sql
SELECT * FROM grpc_metrics;
```

Then click on the `Chart` button in the result panel to visualize the data.

![select gRPC metrics](/select-grpc-metrics.png)

<!-- TODO: need to fix API bug

### Ingest data by InfluxDB Line Protocol

Besides SQL, GreptimeDB also supports multiple protocols, one of the most popular is InfluxDB Line Protocol.
By click `Ingest` icon in the dashboard, you can upload data in InfluxDB Line Protocol format.

For example, choose `Miliseconds` in the input panel, and paste the following data into the input box:

```txt
grpc_metrics,host=host1,method_name=GetUser latency=100 1720728021000
grpc_metrics,host=host2,method_name=GetUser latency=110 1720728021000
``` -->

## Next steps

You have now experienced the core features of GreptimeDB.
To further explore and utilize GreptimeDB:

- [Visualize data using Grafana](/user-guide/clients/grafana.md)
- [Explore more demos of GreptimeDB](https://github.com/GreptimeTeam/demo-scene/)
- [Read the user guide document to learn more details about GreptimeDB](/user-guide/overview.md)
