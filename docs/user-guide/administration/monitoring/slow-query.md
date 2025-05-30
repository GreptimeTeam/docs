---
keywords: [GreptimeDB slow query, slow query log, slow query monitoring, slow query configuration]
description: Guide on configuring and using slow query logging in GreptimeDB for monitoring. 
---

# Slow Query (Experimental)

GreptimeDB provides a slow query log to help you find and fix slow queries. By default, the slow queries are output to the system table `greptime_private.slow_queries` with `30s` threshold and `1.0` sample ratio with `30d` TTL.

The schema of the `greptime_private.slow_queries` table is as follows:

```sql
+--------------+----------------------+------+------+---------+---------------+
| Column       | Type                 | Key  | Null | Default | Semantic Type |
+--------------+----------------------+------+------+---------+---------------+
| cost         | UInt64               |      | NO   |         | FIELD         |
| threshold    | UInt64               |      | NO   |         | FIELD         |
| query        | String               |      | NO   |         | FIELD         |
| is_promql    | Boolean              |      | NO   |         | FIELD         |
| timestamp    | TimestampNanosecond  | PRI  | NO   |         | TIMESTAMP     |
| promql_range | UInt64               |      | NO   |         | FIELD         |
| promql_step  | UInt64               |      | NO   |         | FIELD         |
| promql_start | TimestampMillisecond |      | NO   |         | FIELD         |
| promql_end   | TimestampMillisecond |      | NO   |         | FIELD         |
+--------------+----------------------+------+------+---------+---------------+
```

- `cost`: The cost of the query in milliseconds.
- `threshold`: The threshold of the query in milliseconds.
- `query`: The query string.
- `is_promql`: Whether the query is a PromQL query.
- `timestamp`: The timestamp of the query.
- `promql_range`: The range of the query. Only used when `is_promql` is `true`.
- `promql_step`: The step of the query. Only used when `is_promql` is `true`.
- `promql_start`: The start time of the query. Only used when `is_promql` is `true`.
- `promql_end`: The end time of the query. Only used when `is_promql` is `true`.

In cluster mode, you can configure the slow query in frontend configs (same as in standalone mode), for example:

```toml
[slow_query]
## Whether to enable slow query log.
enable = true

## The record type of slow queries. It can be `system_table` or `log`.
## If `system_table` is selected, the slow queries will be recorded in a system table `greptime_private.slow_queries`.
## If `log` is selected, the slow queries will be logged in a log file `greptimedb-slow-queries.*`.
record_type = "system_table"

## The threshold of slow query. It can be human readable time string, for example: `10s`, `100ms`, `1s`.
threshold = "30s"

## The sampling ratio of slow query log. The value should be in the range of (0, 1]. For example, `0.1` means 10% of the slow queries will be logged and `1.0` means all slow queries will be logged.
sample_ratio = 1.0

## The TTL of the `slow_queries` system table. Default is `30d` when `record_type` is `system_table`.
ttl = "30d"
```

If you use the Helm chart to deploy GreptimeDB, you can configure the slow query in the `values.yaml` file, for example:

```yaml
slowQuery:
  enable: true
  recordType: "system_table"
  threshold: "30s"
  sampleRatio: "1.0"
  ttl: "30d"
```

If you use `log` as the record type, the slow queries will be logged in a log file `greptimedb-slow-queries.*`. By default, the log file is located in the `${data_home}/logs` directory.
