---
keywords: [Trace, OpenTelemetry, Jaeger, Grafana]
description: Introduces additional features to generate more data insights from trace data
---

# Extending Trace Data

:::warning

This section currently in the experimental stage and may be adjusted in future versions.

:::

You can also generate derived data from trace. In this chapter, we will show you
some examples.

## Generate Aggregated Metrics from Trace

The span contains `duration_nano` field for span processing time. In this
example, we will create [Flow](/user-guide/flow-computation/overview.md) task to
generate latency metrics from trace data.

We will use OpenTelemetry Django instruments for source data. But the source
data doesn't really matter because fields used in this example are all generic
ones.

### Create sink table

First, we create a sink table which is a materialzed view in Flow. For latency
quantiles, we will use [uddsketch](https://arxiv.org/abs/2004.08604) for a quick
estimation of latency at given percentile.

```sql
CREATE TABLE "django_http_request_latency" (
    "span_name" STRING NULL,
    "latency_sketch" BINARY,
    "time_window" TIMESTAMP time index,
    PRIMARY KEY ("span_name")
);
```

This table contains 3 key columns:

- `span_name`: the type or name of span
- `latency_sketch`: the uddsketch data structure
- `time_window`: indicate the time window of current record

### Create flow

Next we create a flow task to generate uddsketch data for every 30s time
window. The example filters spans by the scope name, which is optional depends
on your data.

```sql
CREATE FLOW django_http_request_latency_flow
SINK TO django_http_request_latency
EXPIRE AFTER '30m'
COMMENT 'Aggregate latency using uddsketch'
AS
SELECT
    span_name,
    uddsketch_state(128, 0.01, "duration_nano") AS "latency_sketch",
    date_bin('30 seconds'::INTERVAL, "timestamp") as "time_window",
FROM web_trace_demo
WHERE
    scope_name = 'opentelemetry.instrumentation.django'
GROUP BY
    span_name,
    time_window;
```

### Query metrics

The sink table will be filled with aggregated data as trace data ingested. We
can use following SQL to get p90 latency of the each span.

```sql
SELECT
    span_name,
    time_window,
    uddsketch_calc(0.90, "latency_sketch") AS p90
FROM
    django_http_request_latency
ORDER BY
    time_window DESC
LIMIT 20;
```

The query will return results like:

```
      span_name      |        time_window         |        p90
---------------------+----------------------------+--------------------
 GET todos/          | 2025-05-09 02:38:00.000000 |  4034758.586053441
 POST todos/         | 2025-05-09 02:38:00.000000 | 22988738.680499777
 PUT todos/<int:pk>/ | 2025-05-09 02:38:00.000000 |  5338559.200101535
 GET todos/          | 2025-05-09 02:37:30.000000 |  4199425.807196321
 POST todos/         | 2025-05-09 02:37:30.000000 | 15104466.164886404
 PUT todos/<int:pk>/ | 2025-05-09 02:37:30.000000 | 16693072.385310777
 GET todos/          | 2025-05-09 02:37:00.000000 |  4370813.453648573
 POST todos/         | 2025-05-09 02:37:00.000000 | 30417369.407361753
 PUT todos/<int:pk>/ | 2025-05-09 02:37:00.000000 | 14512192.224492861
 GET todos/          | 2025-05-09 02:36:30.000000 |   3578495.53232116
 POST todos/         | 2025-05-09 02:36:30.000000 | 15409606.895490168
 PUT todos/<int:pk>/ | 2025-05-09 02:36:30.000000 | 15409606.895490168
 GET todos/          | 2025-05-09 02:36:00.000000 | 3507634.2346514342
 POST todos/         | 2025-05-09 02:36:00.000000 | 45377987.991290994
 PUT todos/<int:pk>/ | 2025-05-09 02:36:00.000000 | 14512192.224492861
 GET todos/          | 2025-05-09 02:35:30.000000 |   3237945.86410019
 POST todos/         | 2025-05-09 02:35:30.000000 | 15409606.895490168
 PUT todos/<int:pk>/ | 2025-05-09 02:35:30.000000 | 13131130.769316385
 GET todos/          | 2025-05-09 02:35:00.000000 |  3173828.124217018
 POST todos/         | 2025-05-09 02:35:00.000000 | 14512192.224492861
(20 rows)
```
