# Quick Start

Before reading this guide,
you should have already [installed GreptimeDB](../installation/overview.md).

In this document, we will create a metric table and a log table to go through the core features of GreptimeDB.


## Connect to GreptimeDB

If your GreptimeDB is running at `127.0.0.1` and use the default port `4000`,
you can connect to it via MySQL Client or PostgreSQL Client:

```shell
mysql -h 127.0.0.1 -P 4002
```

Or

```shell
psql -h 127.0.0.1 -p 4003 -d public
```

## Create tables

Suppose you have a table named `app_metrics` that stores the RPC latency of your application.

```sql
create table app_metrics (
    ts timestamp time index,
    dc string,
    host string,
    latency double,
    primary key (dc, host)
);
```
The `ts` column is the time index column and the `dc` and `host` columns are tag columns that are specified by the `primary key` clause. The schema of the table is:

- `ts` is the metric timestamp when collected.
- `dc` is the datacenter name.
- `host` is the application server hostname.
- `latency` is the RPC request latency.

There is another table that stores the application logs.

```sql
create table app_logs (
    ts timestamp time index,
    host string,
    dc string,
    `path` string,
    `error` string FULLTEXT,
    primary key (dc, host)
);
```

The time index and tag columns are the same as the `app_metrics` table.
It is worth noting that the `error` column is specified with the `FULLTEXT` option, which creates a [full-text index](/user-guide/logs/query-logs.md#full-text-index-for-accelerated-search) for the column to accelerate log searching.

The schema of the table is:

- `ts`: the log timestamp
- `host`: the application server hostname, just like `app_metrics.host`
- `path`: the RPC request URL path
- `error`: the log error message, which enables the `FULLTEXT` option for log searching

## Write data

Let's mock some collected metrics per second and error logs.

The `host1` and `host2` are two application servers in the `dc1` datacenter.
Since `2024-07-11 20:00:10`, the `host1` latency of RPC requests has become problematic,
increasing from about 100ms to 1000ms or more.

The following image shows the unstable latencies of `host1`.

<img src="/unstable-latencies.png" alt="unstable latencies" width="600">

Use the following SQLs to insert the mocked data.

The hosts work normally before `2024-07-11 20:00:10`:

```sql
INSERT INTO app_metrics (ts, dc, host, latency) VALUES
('2024-07-11 20:00:06', 'dc1', 'host1', 103.0),
('2024-07-11 20:00:06', 'dc1', 'host2', 113.0),
('2024-07-11 20:00:07', 'dc1', 'host1', 103.5),
('2024-07-11 20:00:07', 'dc1', 'host2', 107.0),
('2024-07-11 20:00:08', 'dc1', 'host1', 104.0),
('2024-07-11 20:00:08', 'dc1', 'host2', 96.0),
('2024-07-11 20:00:09', 'dc1', 'host1', 104.5),
('2024-07-11 20:00:09', 'dc1', 'host2', 114.0);
```

The requested latency of `host1` is starting to become unstable and noticeably higher.

```sql
INSERT INTO app_metrics (ts, dc, host, latency) VALUES
('2024-07-11 20:00:10', 'dc1', 'host1', 150.0),
('2024-07-11 20:00:10', 'dc1', 'host2', 110.0),
('2024-07-11 20:00:11', 'dc1', 'host1', 200.0),
('2024-07-11 20:00:11', 'dc1', 'host2', 102.0),
('2024-07-11 20:00:12', 'dc1', 'host1', 1000.0),
('2024-07-11 20:00:12', 'dc1', 'host2', 108.0),
('2024-07-11 20:00:13', 'dc1', 'host1', 80.0),
('2024-07-11 20:00:13', 'dc1', 'host2', 111.0),
('2024-07-11 20:00:14', 'dc1', 'host1', 4200.0),
('2024-07-11 20:00:14', 'dc1', 'host2', 95.0),
('2024-07-11 20:00:15', 'dc1', 'host1', 90.0),
('2024-07-11 20:00:15', 'dc1', 'host2', 115.0),
('2024-07-11 20:00:16', 'dc1', 'host1', 3000.0),
('2024-07-11 20:00:16', 'dc1', 'host2', 95.0),
('2024-07-11 20:00:17', 'dc1', 'host1', 320.0),
('2024-07-11 20:00:17', 'dc1', 'host2', 115.0),
('2024-07-11 20:00:18', 'dc1', 'host1', 3500.0),
('2024-07-11 20:00:18', 'dc1', 'host2', 95.0),
('2024-07-11 20:00:19', 'dc1', 'host1', 100.0),
('2024-07-11 20:00:19', 'dc1', 'host2', 115.0),
('2024-07-11 20:00:20', 'dc1', 'host1', 2500.0),
('2024-07-11 20:00:20', 'dc1', 'host2', 95.0);
```

Some error logs were collected when the `host1` latency of RPC requests becomes problematic.

```sql
INSERT INTO app_logs (ts, dc, host, path, error) VALUES
('2024-07-11 20:00:10', 'dc1', 'host1', '/api/v1/resource', 'Error: Connection timeout'),
('2024-07-11 20:00:11', 'dc1', 'host1', '/api/v1/resource', 'Error: Database unavailable'),
('2024-07-11 20:00:12', 'dc1', 'host1', '/api/v1/resource', 'Error: Service overload'),
('2024-07-11 20:00:13', 'dc1', 'host1', '/api/v1/resource', 'Error: Connection reset'),
('2024-07-11 20:00:14', 'dc1', 'host1', '/api/v1/resource', 'Error: Timeout'),
('2024-07-11 20:00:15', 'dc1', 'host1', '/api/v1/resource', 'Error: Disk full'),
('2024-07-11 20:00:16', 'dc1', 'host1', '/api/v1/resource', 'Error: Network issue');
```

## Query data

### Filter by tags and time index

You can filter the data by use of the `WHERE` clause.
For example, to query the latency of `host1` in `dc1` after `2024-07-11 20:00:10`:

```sql
SELECT * FROM app_metrics WHERE dc = 'dc1' AND host = 'host1' AND ts >= '2024-07-11 20:00:10';
```

```sql
+---------------------+------+-------+---------+
| ts                  | dc   | host  | latency |
+---------------------+------+-------+---------+
| 2024-07-11 20:00:10 | dc1  | host1 |     150 |
| 2024-07-11 20:00:11 | dc1  | host1 |     200 |
| 2024-07-11 20:00:12 | dc1  | host1 |    1000 |
| 2024-07-11 20:00:13 | dc1  | host1 |      80 |
| 2024-07-11 20:00:14 | dc1  | host1 |    4200 |
| 2024-07-11 20:00:15 | dc1  | host1 |      90 |
| 2024-07-11 20:00:16 | dc1  | host1 |    3000 |
| 2024-07-11 20:00:17 | dc1  | host1 |     320 |
| 2024-07-11 20:00:18 | dc1  | host1 |    3500 |
| 2024-07-11 20:00:19 | dc1  | host1 |     100 |
| 2024-07-11 20:00:20 | dc1  | host1 |    2500 |
+---------------------+------+-------+---------+
11 rows in set (0.03 sec)
```

You can also use functions when filtering the data.
For example, use aggregate function `avg` and the `GROUP BY` clause to get the average latencies after `2024-07-11 20:00:10`:

```sql
SELECT avg(latency), host FROM app_metrics WHERE ts >= '2024-07-11 20:00:10' GROUP BY host;
```

```sql
+--------------------------+-------+
| AVG(app_metrics.latency) | host  |
+--------------------------+-------+
|       1376.3636363636363 | host1 |
|        105.0909090909091 | host2 |
+--------------------------+-------+
2 rows in set (0.01 sec)
```

### Range query

To monitor the latencies, it is better to use [Range Queries](/reference/sql/range#range-query) to get metrics in real times.
For example, calculate the p95 latency of requests using a 5-second time window:

```sql
SELECT 
  ts, 
  host, 
  approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency 
FROM 
  app_metrics
ALIGN '5s' FILL PREV;
```

```sql
+---------------------+-------+-------------+
| ts                  | host  | p95_latency |
+---------------------+-------+-------------+
| 2024-07-11 20:00:05 | host1 |       104.5 |
| 2024-07-11 20:00:10 | host1 |        4200 |
| 2024-07-11 20:00:15 | host1 |        3500 |
| 2024-07-11 20:00:20 | host1 |        2500 |
| 2024-07-11 20:00:05 | host2 |         114 |
| 2024-07-11 20:00:10 | host2 |         111 |
| 2024-07-11 20:00:15 | host2 |         115 |
| 2024-07-11 20:00:20 | host2 |          95 |
+---------------------+-------+-------------+
8 rows in set (0.20 sec)
```

### Full-text search

From the latency analysis above, we know that there may be some problems in `host1`.
Since we typically care about API `api/v1`,
we can use the full-text search `matches(path, 'api/v1')` to find the error logs related to the API:

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
2 rows in set (0.04 sec)
```

From the SQL result, we can see that the application was working well until `2024-07-11 20:00:10`, when an `Error: Connection timeout` occurred. Between `2024-07-11 20:00:10` and `2024-07-11 20:00:15`, there are 5 error logs.

### Correlation analysis for logs and metrics

By putting the data in two tables together, we can determine the failure time and the associated logs more easily and quickly:
The following SQL use `JOIN` operation to correlate the metrics and logs: 

```sql
WITH
  metrics AS (
    SELECT 
      ts, 
      host, 
      approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency 
    FROM 
      app_metrics 
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
8 rows in set (0.20 sec)
```

### Continues aggregation

For futher analysis or reduce the scan cost when aggregating data frequently, you can save the aggregation results to another tables. This can be implemented by using the continuous aggregation feature of GreptimeDB.

For example, we can sink data to two tables for the metrics and logs example in this document.
`metrics_5_seconds` and `logs_5_seconds` are the tables that store the 5-second aggregated data of the `app_metrics` and `app_logs` tables.

Create the `metrics_5_seconds` table:

```sql
CREATE TABLE metrics_5_seconds (
  ts TIMESTAMP TIME INDEX,
  host string,
  p95_latency double,
  PRIMARY KEY(host)
);
```

Create the `logs_5_seconds` table:

```sql
CREATE TABLE logs_5_seconds (
  ts TIMESTAMP TIME INDEX,
  host string,
  num_errors int,
  first_error string,
  last_error string,
  PRIMARY KEY(host)
);
```

Then create `Flow`s to sink the data to the tables.
Different from the range query syntax, you need to use the `date_bin()` function to specify the time window for the aggregation.

The following SQL creates a flow named `flow_metrics_5_seconds` to sink the 5-second aggregated data of the `app_metrics` table to the `metrics_5_seconds` table:

```sql
CREATE FLOW flow_metrics_5_seconds 
SINK TO metrics_5_seconds
AS
SELECT 
  date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond) AS ts, 
  host, 
  approx_percentile_cont(latency, 0.95) AS p95_latency 
FROM 
  app_metrics 
GROUP BY date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond);
```

The following SQL creates a flow named `flow_logs_5_seconds` to sink the 5-second aggregated data of the `app_logs` table to the `logs_5_seconds` table:

```sql
CREATE FLOW flow_logs_5_seconds
SINK TO logs_5_seconds
AS
SELECT 
  date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond) AS ts, 
  host,
  first_value(error) RANGE '5s' AS first_error,
  last_value(error) RANGE '5s' AS last_error, 
  count(error) RANGE '5s' AS num_errors
FROM
  app_logs
WHERE
  matches(path, 'api/v1')
GROUP BY date_bin(INTERVAL '5 seconds', ts, '1970-01-01 00:00:00'::TimestampNanosecond);
```

After creating the flows, when there is new data inserted into the `app_metrics` and `app_logs` tables, the data will be automatically aggregated and stored in the `metrics_5_seconds` and `logs_5_seconds` tables.

For example, insert more metrics to the tables respectively:

```sql
INSERT INTO app_metrics (ts, dc, host, latency) VALUES
('2024-07-11 20:00:21', 'dc1', 'host1', 1500.0),
('2024-07-11 20:00:21', 'dc1', 'host2', 110.0);
```

```sql
INSERT INTO app_logs (ts, dc, host, path, error) VALUES
('2024-07-11 20:00:17', 'dc1', 'host1', '/api/v1/resource', 'Error: Network issue');
```

After the data is inserted, the `metrics_5_seconds` and `logs_5_seconds` tables will be updated with the new data.

```sql
select * from metrics_5_seconds;
```

```sql
select * from logs_5_seconds;
```

### Create a View

Use a View to save the result for `JOIN` operations on the `metrics_5_seconds` and `logs_5_seconds` tables to correlate the metrics and logs.

```sql
CREATE VIEW cor_metrics_logs AS
  SELECT 
    metrics_5_seconds.ts,
    metrics_5_seconds.p95_latency, 
    coalesce(logs_5_seconds.num_errors, 0) as num_errors,
    logs_5_seconds.first_error,
    logs_5_seconds.last_error,
    metrics_5_seconds.host
  FROM 
    metrics_5_seconds 
    LEFT JOIN logs_5_seconds ON metrics_5_seconds.host = logs_5_seconds.host 
    AND metrics_5_seconds.ts = logs_5_seconds.ts 
```

```sql
select * from cor_metrics_logs
```

## Visualize data

### GreptimeDB Dashboard

GreptimeDB provides a user-friendly [dashboard](../installation/greptimedb-dashboard.md) to assist you in exploring data.
Once GreptimeDB is started as mentioned in the Prerequisites section, you can access the dashboard through the HTTP endpoint `http://localhost:4000/dashboard`.

Write SQL into the command text, then click `Run All`. We'll got all data in system_metrics table.

```
SELECT * FROM system_metrics;
```

![dashboard-select](/dashboard-select.png)


### Grafana

#### Add Data Source

You can access Grafana at `http://localhost:3000`.
Use `admin` as both the username and password to log in.

GreptimeDB can be configured as a MySQL data source in Grafana.
Click the `Add data source` button and select MySQL as the type.

![add-mysql-data-source](/add-mysql-data-source.jpg)

Fill in the following information:

* Name: `GreptimeDB`
* Host: `greptimedb:4002`. The host `greptimedb` is the name of GreptimeDB container
* Database: `public`
* SessionTimezone: `UTC`

![grafana-mysql-config](/grafana-mysql-config.jpg)

Click `Save & Test` button to test the connection.

For more information on using MySQL as a data source for GreptimeDB,
please refer to [Grafana-MySQL](/user-guide/clients/grafana.md#mysql).

#### Create a Dashboard

To create a new dashboard in Grafana, click the `Create your first dashboard` button on the home page.
Then, click `Add visualization` and select `GreptimeDB` as the data source.

In the `Query` section, ensure that you select `GreptimeDB` as the data source, choose `Time series` as the format,
switch to the `Code` tab, and write the following SQL statement. Note that we are using `ts` as the time column.

```sql
SELECT ts AS "time", idle_cpu, sys_cpu FROM public.monitor
```

![grafana-mysql-query-code](/grafana-mysql-query-code.jpg)

Click `Run query` to view the metric data.

![grafana-mysql-run-query](/grafana-mysql-run-query.jpg)

