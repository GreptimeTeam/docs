---
description: Discover how GreptimeDB's Flow engine enables real-time computation of data streams for ETL processes and on-the-fly calculations. Learn about its programming model, use cases, and a quick start example for calculating user agent statistics from nginx logs.
---

# Overview

GreptimeDB's Flow engine enables real-time computation of data streams.
It is particularly beneficial for Extract-Transform-Load (ETL) processes or for performing on-the-fly calculations and queries such as sum, average, and other aggregations.
The Flow engine ensures that data is processed incrementally and continuously,
updating the final results as new streaming data arrives.
It functions similarly to materialized views,
determining when and how to update the result view table with minimal effort.

Use cases include:

- Real-time analytics that deliver actionable insights almost instantaneously.
- Downsampling data points, such as using average pooling, to reduce the volume of data for storage and analysis.

## Programming Model

Upon data insertion into the source table,
the data is concurrently ingested to the Flow engine.
At each trigger interval (one second),
the Flow engine executes the specified computations and updates the sink table with the results.
Both the source and sink tables are time-series tables within GreptimeDB.
Before creating a Flow,
it is crucial to define the schemas for these tables and design the Flow to specify the computation logic.
This process is visually represented in the following image:

![Continuous Aggregation](/flow-ani.svg)

## Quick Start Example

To illustrate the capabilities of GreptimeDB's Flow engine,
consider the task of calculating user agent statistics from nginx logs.
The source table is `nginx_access_log`,
and the sink table is `user_agent_statistics`.

First, create the source table `nginx_access_log`.
To optimize performance for counting the `user_agent` field,
specify it as a `TAG` column type using the `PRIMARY KEY` keyword.

```sql
CREATE TABLE ngx_access_log (
  ip_address STRING,
  http_method STRING,
  request STRING,
  status_code INT16,
  body_bytes_sent INT32,
  user_agent STRING,
  response_size INT32,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY (ip_address, http_method, user_agent, status_code)
) WITH ('append_mode'='true');
```

Next, create the sink table `user_agent_statistics`.
Note that all tables in GreptimeDB are time-series tables,
hence the inclusion of the `__ts_placeholder` column as a timestamp placeholder.

```sql
CREATE TABLE user_agent_statistics (
  user_agent STRING,
  total_count INT32,
  __ts_placeholder TIMESTAMP TIME INDEX,
  update_at TIMESTAMP,
  PRIMARY KEY (user_agent)
);
```

Finally, create the Flow `user_agent_flow` to count the occurrences of each user agent in the `nginx_access_log` table.

```sql
CREATE FLOW user_agent_flow
SINK TO user_agent_statistics
AS
SELECT
  user_agent,
  COUNT(user_agent) AS total_count
FROM
  ngx_access_log
GROUP BY
  user_agent;
```

Once the Flow is created,
the Flow engine will continuously process data from the `ngx_access_log` table and update the `user_agent_statistics` table with the computed results.

To observe the continuous aggregation results,
insert sample data into the `ngx_access_log` table.

```sql
INSERT INTO ngx_access_log
VALUES
  ('192.168.1.1', 'GET', '/index.html', 200, 512, 'Mozilla/5.0', 1024, '2023-10-01T10:00:00Z'),
  ('192.168.1.2', 'POST', '/submit', 201, 256, 'curl/7.68.0', 512, '2023-10-01T10:01:00Z'),
  ('192.168.1.1', 'GET', '/about.html', 200, 128, 'Mozilla/5.0', 256, '2023-10-01T10:02:00Z'),
  ('192.168.1.3', 'GET', '/contact', 404, 64, 'curl/7.68.0', 128, '2023-10-01T10:03:00Z');
```

After inserting the data,
query the `user_agent_statistics` table to view the results.

```sql
SELECT * FROM user_agent_statistics;
```

The query results will display the total count of each user agent in the `user_agent_statistics` table.

```sql
+-----------------+-------------+
| user_agent      | total_count |
+-----------------+-------------+
| Mozilla/5.0     | 2           |
| curl/7.68.0     | 2           |
+-----------------+-------------+
```

## Next Steps

- [Continuous Aggregation](./continuous-aggregation.md): Explore the primary scenario in time-series data processing, with three common use cases for continuous aggregation.
- [Manage Flow](manage-flow.md): Gain insights into the mechanisms of the Flow engine and the SQL syntax for defining a Flow.
- [Expressions](expressions.md): Learn about the expressions supported by the Flow engine for data transformation.

