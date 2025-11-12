---
keywords: [slow queries, greptime private]
description: The slow queries table in the `greptime_private` database.
---

# slow_queries

The `slow_queries` table contains the slow queries of GreptimeDB:

```sql
USE greptime_private;

SELECT * FROM slow_queries;
```

The output is as follows:

```sql
+------+-----------+---------------------------------------------+-----------+----------------------------+--------------+-------------+---------------------+---------------------+
| cost | threshold | query                                       | is_promql | timestamp                  | promql_range | promql_step | promql_start        | promql_end          |
+------+-----------+---------------------------------------------+-----------+----------------------------+--------------+-------------+---------------------+---------------------+
|    2 |         0 | irate(process_cpu_seconds_total[1h])        |         1 | 2025-05-14 13:59:36.368575 |     86400000 |     3600000 | 2024-11-24 00:00:00 | 2024-11-25 00:00:00 |
|   22 |         0 | SELECT * FROM greptime_private.slow_queries |         0 | 2025-05-14 13:59:44.844201 |            0 |           0 | 1970-01-01 00:00:00 | 1970-01-01 00:00:00 |
+------+-----------+---------------------------------------------+-----------+----------------------------+--------------+-------------+---------------------+---------------------+
```

- `cost`: The cost of the query in milliseconds.
- `threshold`: The threshold of the query in milliseconds.
- `query`: The query string. It can be SQL or PromQL.
- `is_promql`: Whether the query is a PromQL query.
- `timestamp`: The timestamp of the query.
- `promql_range`: The range of the query. Only used when is_promql is true.
- `promql_step`: The step of the query. Only used when is_promql is true.
- `promql_start`: The start time of the query. Only used when is_promql is true.
- `promql_end`: The end time of the query. Only used when is_promql is true.

You can refer to the [Slow Query](/user-guide/deployments-administration/monitoring/slow-query.md) documentation for more details.
