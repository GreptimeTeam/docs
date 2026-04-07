---
keywords: [TQL, Time-Series Query Language, PromQL extension, EVAL command, EXPLAIN command, ANALYZE command]
description: Covers the TQL keyword for executing Time-Series Query Language in SQL, including EVAL, EXPLAIN, and ANALYZE commands with syntax and examples.
---

# TQL

The `TQL` keyword executes TQL language in SQL. The TQL is Telemetry Query Language, which is an extension for Prometheus's [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) in GreptimeDB.

## EVAL

### Syntax

```sql
TQL [EVAL | EVALUATE] (start, end, step, [lookback]) expr [AS alias]
```

The `start`, `end` and `step` are the query parameters just like [Prometheus Query API](https://prometheus.io/docs/prometheus/latest/querying/api/):

- `start`: `<rfc3339 | unix_timestamp | expression>`: The start timestamp of the query; the range is inclusive of this value.
- `end`: `<rfc3339 | unix_timestamp | expression>`: The end timestamp of the query; the range is inclusive of this value.
- `step`: `<duration | float>`: The query resolution step, specified as a `duration` or a floating-point number of seconds.
- `lookback`: `<duration | float>`: The maximum lookback duration for evaluation, default is 5 minutes and optional.

`expr` is the TQL (PromQL) query string.

The optional `AS alias` clause allows you to specify a custom name for the value column in the result. This is useful for:
- Giving meaningful names to query results
- Using TQL results in SQL queries (e.g., CTEs, JOINs)
- Improving readability of complex queries

**Note**: Value aliasing currently supports single-field results only.

### Examples

Return the per-second rate for all time series with the `http_requests_total` metric name, as measured over the last 5 minutes:

```sql
TQL eval (1677057993, 1677058993, '1m') rate(prometheus_http_requests_total{job="prometheus"}[5m]);
```

will get a result just like other normal SQL queries.

Using value aliasing to give a custom name to the result:

```sql
TQL EVAL (0, 30, '10s') http_requests_total AS requests;
```

This will return results with the value column named `requests` instead of the default field name.

Value aliasing with aggregation:

```sql
TQL EVAL (0, 10, '5s') count by (k) (test) AS count_value;
```

This query counts values grouped by `k` and names the result column `count_value`.

`start` and `end` can also be time expressions that evaluate to constants. For example, to query the past 3 hours:

```sql
TQL EVAL (now() - interval '3' hours, now(), '1m')
  sum by (namespace, pod) (
    increase(kube_pod_container_status_restarts_total[10m:30s])
  );
```

To query data for the past day:

```sql
TQL EVAL (
  date_trunc('day', now() - interval '1' day),
  date_trunc('day', now()),
  '1m'
)
  sum by (namespace) (
    rate(http_requests_total[5m:30s])
  );
```

### Using TQL in CTEs

TQL `EVAL` can be used within Common Table Expressions (CTEs) to combine PromQL-style queries with SQL processing. For detailed examples and usage guidelines, see [Using TQL in CTEs](/user-guide/query-data/cte.md#using-tql-in-ctes).

## EXPLAIN

`EXPLAIN` displays both the logical plan and execution plan for a given PromQL query. The syntax is as follows:

```
TQL EXPLAIN [VERBOSE] [FORMAT format] [(start, end, step, [lookback])] expr [AS alias];
```

For example, to explain the PromQL `sum by (instance) (rate(node_disk_written_bytes_total[2m])) > 50`, we can use

```
TQL EXPLAIN sum by (instance) (rate(node_disk_written_bytes_total[2m])) > 50;
```

Notice that since the given query won't be actually executed, the triple `(start, end, step, [lookback])` is not necessary. But you can still provide it like in `TQL EVAL`:

```
TQL EXPLAIN (0, 100, '10s') sum by (instance) (rate(node_disk_written_bytes_total[2m])) > 50;
```

You can also use value aliasing with EXPLAIN:

```
TQL EXPLAIN (0, 10, '5s') test AS series;
```

The result should be like the following:

```txt
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type     | plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| logical_plan  | Sort: node_disk_written_bytes_total.instance ASC NULLS LAST, node_disk_written_bytes_total.ts ASC NULLS LAST
  Filter: SUM(prom_rate(ts_range,field,ts)) > Float64(50)
    Aggregate: groupBy=[[node_disk_written_bytes_total.instance, node_disk_written_bytes_total.ts]], aggr=[[SUM(prom_rate(ts_range,field,ts))]]
      Projection: node_disk_written_bytes_total.ts, prom_rate(ts_range, field, node_disk_written_bytes_total.ts) AS prom_rate(ts_range,field,ts), node_disk_written_bytes_total.instance
        Filter: prom_rate(ts_range, field, node_disk_written_bytes_total.ts) IS NOT NULL
          Projection: node_disk_written_bytes_total.ts, node_disk_written_bytes_total.instance, field, ts_range
            PromRangeManipulate: req range=[0..0], interval=[300000], eval range=[120000], time index=[ts], values=["field"]
              PromSeriesNormalize: offset=[0], time index=[ts], filter NaN: [true]
                PromSeriesDivide: tags=["instance"]
                  Sort: node_disk_written_bytes_total.instance DESC NULLS LAST, node_disk_written_bytes_total.ts DESC NULLS LAST
                    TableScan: node_disk_written_bytes_total projection=[ts, instance, field], partial_filters=[ts >= TimestampMillisecond(-420000, None), ts <= TimestampMillisecond(300000, None)] |
| physical_plan | SortPreservingMergeExec: [instance@0 ASC NULLS LAST,ts@1 ASC NULLS LAST]
  SortExec: expr=[instance@0 ASC NULLS LAST,ts@1 ASC NULLS LAST]
    CoalesceBatchesExec: target_batch_size=8192
      FilterExec: SUM(prom_rate(ts_range,field,ts))@2 > 50
        AggregateExec: mode=FinalPartitioned, gby=[instance@0 as instance, ts@1 as ts], aggr=[SUM(prom_rate(ts_range,field,ts))]
          CoalesceBatchesExec: target_batch_size=8192
            RepartitionExec: partitioning=Hash([Column { name: "instance", index: 0 }, Column { name: "ts", index: 1 }], 32), input_partitions=32
              AggregateExec: mode=Partial, gby=[instance@2 as instance, ts@0 as ts], aggr=[SUM(prom_rate(ts_range,field,ts))]
                ProjectionExec: expr=[ts@0 as ts, prom_rate(ts_range@3, field@2, ts@0) as prom_rate(ts_range,field,ts), instance@1 as instance]
                  CoalesceBatchesExec: target_batch_size=8192
                    FilterExec: prom_rate(ts_range@3, field@2, ts@0) IS NOT NULL
                      ProjectionExec: expr=[ts@0 as ts, instance@1 as instance, field@2 as field, ts_range@3 as ts_range]
                        PromInstantManipulateExec: req range=[0..0], interval=[300000], eval range=[120000], time index=[ts]
                          PromSeriesNormalizeExec: offset=[0], time index=[ts], filter NaN: [true]
                            PromSeriesDivideExec: tags=["instance"]
                              RepartitionExec: partitioning=RoundRobinBatch(32), input_partitions=1
                                ExecutionPlan(PlaceHolder)
 |
+---------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

## ANALYZE

TQL also supports `ANALYZE` keyword to analyze the given PromQL query's execution. The syntax is as follows:

```
TQL ANALYZE [VERBOSE] [FORMAT format] (start, end, step, [lookback]) expr [AS alias];
```

For example:

```
TQL ANALYZE (0, 10, '5s') test;
```

will get a result like

```
+-------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| plan_type         | plan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
+-------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Plan with Metrics | CoalescePartitionsExec, metrics=[output_rows=0, elapsed_compute=14.99µs]
  PromInstantManipulateExec: range=[0..10000], lookback=[300000], interval=[5000], time index=[j], metrics=[output_rows=0, elapsed_compute=1.08µs]
    PromSeriesNormalizeExec: offset=[0], time index=[j], filter NaN: [false], metrics=[output_rows=0, elapsed_compute=1.11µs]
      PromSeriesDivideExec: tags=["k"], metrics=[output_rows=0, elapsed_compute=1.3µs]
        RepartitionExec: partitioning=RoundRobinBatch(32), input_partitions=32, metrics=[send_time=32ns, repart_time=32ns, fetch_time=11.578016ms]
          RepartitionExec: partitioning=RoundRobinBatch(32), input_partitions=1, metrics=[send_time=1ns, repart_time=1ns, fetch_time=21.07µs]
            ExecutionPlan(PlaceHolder), metrics=[]
      |
+-------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

Using `TQL ANALYZE VERBOSE` will get a verbose result of the execution.

```
TQL ANALYZE VERBOSE (0, 10, '5s') test;
```
