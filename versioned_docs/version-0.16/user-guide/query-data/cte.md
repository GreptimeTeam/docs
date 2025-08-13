---
keywords: [Common Table Expressions, CTE, SQL queries, simplify queries, complex queries, temporary result set]
description: Explanation of Common Table Expressions (CTEs) in GreptimeDB, including syntax, examples, and how to use CTEs to simplify complex queries.
---

# Common Table Expression (CTE)

CTEs are similar to [Views](./view.md) in that they help you reduce the complexity of your queries, break down long and complex SQL statements, and improve readability and reusability.

You already read a CTE in the [quickstart](/getting-started/quick-start.md#correlate-metrics-and-logs) document.

## What is a Common Table Expression (CTE)?

A Common Table Expression (CTE) is a temporary result set that you can reference within a `SELECT`, `INSERT`, `UPDATE`, or `DELETE` statement. CTEs help to break down complex queries into more readable parts and can be referenced multiple times within the same query.

## Basic syntax of CTE

CTEs are typically defined using the `WITH` keyword. The basic syntax is as follows:

```sql
WITH cte_name [(column1, column2, ...)] AS (
    QUERY
)
SELECT ...
FROM cte_name;
```

## Example explanation

Next, we'll go through a complete example that demonstrates how to use CTEs, including data preparation, CTE creation, and usage.

### Step 1: Create example data

Let's assume we have the following two tables:

- `grpc_latencies`: Contains gRPC request latency data.
- `app_logs`: Contains application log information.

```sql
CREATE TABLE grpc_latencies (
    ts TIMESTAMP TIME INDEX,
    host VARCHAR(255),
    latency FLOAT,
    PRIMARY KEY(host),
);

INSERT INTO grpc_latencies VALUES 
('2023-10-01 10:00:00', 'host1', 120),
('2023-10-01 10:00:00', 'host2', 150),
('2023-10-01 10:00:05', 'host1', 130);

CREATE TABLE app_logs (
    ts TIMESTAMP TIME INDEX,
    host VARCHAR(255),
    log TEXT,
    log_level VARCHAR(50),
    PRIMARY KEY(host, log_level),
);

INSERT INTO app_logs VALUES 
('2023-10-01 10:00:00', 'host1', 'Error on service', 'ERROR'),
('2023-10-01 10:00:00', 'host2', 'All services OK', 'INFO'),
('2023-10-01 10:00:05', 'host1', 'Error connecting to DB', 'ERROR');
```

### Step 2: Define and use CTEs

We will create two CTEs to calculate the 95th percentile latency and the number of error logs, respectively.

```sql
WITH 
metrics AS (
    SELECT 
        ts, 
        host, 
        approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency
    FROM 
        grpc_latencies
    ALIGN '5s' FILL PREV
),
logs AS (
    SELECT 
        ts, 
        host,
        COUNT(log) RANGE '5s' AS num_errors
    FROM
        app_logs
    WHERE 
        log_level = 'ERROR'
    ALIGN '5s' BY (HOST)
)
SELECT 
    metrics.ts,
    metrics.host,
    metrics.p95_latency,
    COALESCE(logs.num_errors, 0) AS num_errors
FROM 
    metrics 
LEFT JOIN logs ON metrics.host = logs.host AND metrics.ts = logs.ts
ORDER BY 
    metrics.ts;
```

Output:

```sql
+---------------------+-------+-------------+------------+
| ts                  | host  | p95_latency | num_errors |
+---------------------+-------+-------------+------------+
| 2023-10-01 10:00:00 | host2 |         150 |          0 |
| 2023-10-01 10:00:00 | host1 |         120 |          1 |
| 2023-10-01 10:00:05 | host1 |         130 |          1 |
+---------------------+-------+-------------+------------+
```

## Detailed explanation

1. **Define CTEs**:
  - `metrics`: 
      ```sql
      WITH 
      metrics AS (
          SELECT 
            ts, 
            host, 
            approx_percentile_cont(latency, 0.95) RANGE '5s' AS p95_latency
          FROM 
            grpc_latencies
          ALIGN '5s' FILL PREV
      ),
      ```
     Here we use a [range query](/user-guide/query-data/sql.md#aggregate-data-by-time-window) to calculate the 95th percentile latency for each `host` within every 5-second window.
     
  - `logs`:
      ```sql
      logs AS (
        SELECT 
          ts, 
          host,
          COUNT(log) RANGE '5s' AS num_errors
        FROM
          app_logs
        WHERE 
          log_level = 'ERROR'
        ALIGN '5s' BY (HOST)
      )
      ```
      Similarly, we calculate the number of error logs for each `host` within every 5-second window.

2. **Use CTEs**:
    The final query part:
      ```sql
      SELECT
          metrics.ts,
          metrics.host,
          metrics.p95_latency,
          COALESCE(logs.num_errors, 0) AS num_errors
      FROM
          metrics
      LEFT JOIN logs ON metrics.host = logs.host AND metrics.ts =   logs.ts
      ORDER BY
          metrics.ts;
      ```
    We perform a left join on the two CTE result sets to get a comprehensive analysis result.

## Summary

With CTEs, you can break down complex SQL queries into more manageable and understandable parts. In this example, we created two CTEs to calculate the 95th percentile latency and the number of error logs separately and then merged them into the final query for analysis.  Read more [WITH](/reference/sql/with.md).