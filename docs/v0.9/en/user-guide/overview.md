# Overview

Welcome to the user guide for GreptimeDB.

GreptimeDB is the unified time series database for metrics, events, and logs,
providing real-time insights from Edge to Cloud at any scale.
This guide will help you explore each powerful feature of GreptimeDB.

## SQL query example

Let's start with a SQL query example.

To monitor the performance and reliability of specific metrics,
engineers commonly analyze data over time at regular intervals using queries.
This often involves joining two data sources.
However, executing a query like the one below was previously impossible,
which is now possible with GreptimeDB.

```sql
SELECT
    host,
    approx_percentile_cont(latency, 0.95) RANGE '15s' as p95_latency,
    count(error) RANGE '15s' as num_errors,
FROM
    metrics INNER JOIN logs on metrics.host = logs.host
WHERE
    time > now() - INTERVAL '1 hour' AND
    matches(path, '/api/v1/avatar')
ALIGN '5s' BY (host) FILL PREV
```

This query analyzes the performance and errors of a specific API path (`/api/v1/avatar`) over the past hour.
It calculates the 95th percentile latency and the number of errors in 15-second intervals and aligns the results to 5-second intervals for continuity and readability.

Break down the query step by step:

1. SELECT clause:
    - `host`: Selects the host field.
    - `approx_percentile_cont(latency, 0.95) RANGE '15s' as p95_latency`: Calculates the 95th percentile of latency within a 15-second range and labels it as p95_latency.
    - `count(error) RANGE '15s' as num_errors`: Counts the number of errors within a 15-second range and labels it as num_errors.
2. FROM clause:
    - `metrics INNER JOIN logs on metrics.host = logs.host`: Joins the metrics and logs tables on the host field.
3. WHERE clause:
    - `time > now() - INTERVAL '1 hour'`: Filters the records to include only those from the past hour.
    - `matches(path, '/api/v1/avatar')`: Filters the records to include only those matching the path `/api/v1/avatar`.
4. ALIGN clause:
    - `ALIGN '5s' BY (host) FILL PREV`: Aligns the results to every 5 seconds and fills in missing values with the previous non-null value.

Next, let's analyze the key features of GreptimeDB demonstrated by this query example:

- **Unified Storage:** GreptimeDB is the time series database to store and analyze both metrics and [logs](/user-guide/logs/overview.md). The simplified architecture and data consistency enhances the ability to analyze and troubleshoot issues, and can lead to cost savings and improved system performance.
- **Unique Data Model:** The unique [data model](/user-guide/concepts/data-model.md) with time index and full-text index greatly improves query performance and has stood the test of large data sets. It not only supports metric [insertion](/user-guide/write-data/overview.md) and [query](/user-guide/query-data/overview.md), but also provides a very friendly way to [write](/user-guide/logs/write-logs.md) and [query](/user-guide/logs/query-logs.md) logs.
- **Range Queries:** GreptimeDB supports [range queries](/user-guide/query-data/sql#aggregate-data-by-time-window) to evaluate [expressions](/reference/sql/functions/overview.md) over time, providing insights into metric trends. You can also [continuously aggregate](/user-guide/continuous-aggregation/overview) data for further analysis.
- **SQL and Multiple Protocols:** GreptimeDB uses SQL as the main query language and supports [multiple protocols](/user-guide/clients/overview.md#protocols), which greatly reduces the learning curve and development cost. You can easily migrate from Prometheus or [Influxdb to GreptimeDB](/user-guide/migrate-to-greptimedb/migrate-from-influxdb), or just start with GreptimeDB.
- **JOIN Operations:** The data model of GreptimeDB's time series tables enables it to support [JOIN operations](/reference/sql/join.md) on metrics and logs.

Having understood these features, you can now go directly to exploring the features that interest you, or continue reading the next step in the sequence.

## Next steps

* [Concepts](./concepts/overview.md)
* [Clients](./clients/overview.md)
* [Table Management](./table-management.md)
* [Migrate to GreptimeDB](./migrate-to-greptimedb/migrate-from-influxdb.md)
* [Write data](./write-data/overview.md)
* [Query data](./query-data/overview.md)
* [Continuous Aggregation](./continuous-aggregation/overview.md)
* [Python Scripts](./python-scripts/overview.md)
* [Operations](./operations/overview.md)
* [Cluster](./cluster.md)
