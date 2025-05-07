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

```
SELECT
    span_name,
    time_window,
    uddsketch_calc(0.90, "latency_sketch") AS p90
FROM
    django_http_request_latency
ORDER BY
    time_window DESC
LIMIT 100;
```
