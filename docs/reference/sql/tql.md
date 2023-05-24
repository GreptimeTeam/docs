# TQL

The `TQL` keyword executes TQL language in SQL. The TQL is Time-Series Query Language, which is an extension for Prometheus's [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) in GreptimeDB.

## EVAL
### Syntax

```sql
TQL [EVAL | EVALUATE] (start, end, step) expr 
```

The `start`, `end` and `step` are the query parameters just like [Prometheus Query API](https://prometheus.io/docs/prometheus/latest/querying/api/):
-   `start`: `<rfc3339 | unix_timestamp>`: Start timestamp, inclusive.
-   `end`: `<rfc3339 | unix_timestamp>`: End timestamp, inclusive.
-   `step`: `<duration | float>`: Query resolution step width in `duration` format or float number of seconds.

The `expr` is the TQL expression query string.

### Examples

Return the per-second rate for all time series with the `http_requests_total` metric name, as measured over the last 5 minutes:

```sql
TQL eval (1677057993, 1677058993, '1m') rate(prometheus_http_requests_total{job="prometheus"}[5m]);
```

```text
TODO
```

## EXPLAIN

TODO
