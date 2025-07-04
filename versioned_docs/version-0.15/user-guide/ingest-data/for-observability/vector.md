---
keywords: [Vector, integration, configuration, data model, metrics]
description: Instructions for integrating Vector with GreptimeDB, including configuration, data model mapping, and example configurations.
---

# Vector

Vector is [a high performance observability data
pipeline](https://vector.dev). It has native support for GreptimeDB metrics data
sink. With vector, you can ingest metrics data from various sources, including
Prometheus, OpenTelemetry, StatsD and many more.
GreptimeDB can be used as a Vector Sink component to receive metrics. 

## Collect host metrics

### Configuration

A minimal configuration of when using your GreptimeDB instance can be:

```toml
# sample.toml

[sources.in]
type = "host_metrics"

[sinks.my_sink_id]
inputs = ["in"]
type = "greptimedb_metrics"
endpoint = "<host>:4001"
dbname = "<dbname>"
username = "<username>"
password = "<password>"
new_naming = true
```

GreptimeDB uses gRPC to communicate with Vector, so the default port for the Vector sink is `4001`.
If you have changed the default gRPC port when starting GreptimeDB with [custom configurations](/user-guide/deployments-administration/configuration.md#configuration-file), use your own port instead.

Execute Vector with:

```
vector -c sample.toml
```

For more configuration options, see [Vector GreptimeDB
Configuration](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/).

### Data Model

The following rules are used when storing Vector metrics into GreptimeDB:

- Use `<metric namespace>_<metric name>` as the table name in GreptimeDB, for example, `host_cpu_seconds_total`;
- Use the timestamp of the metric as the time index of GreptimeDB, the column name is `ts`;
- Use the tags of the metric as GreptimeDB tags;
- For Vector metrics which have multiple subtypes:
  - For Counter and Gauge metrics, the values are stored in the `val` column;
  - For Set metrics, the number of data points are stored in the `val` column;
  - For Distribution metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `min/max/avg/sum/count` columns are also stored;
  - For AggregatedHistogram metrics, the values of each bucket are stored in the `bxx` column, where xx is the upper limit of the bucket, and the `sum/count` columns are also stored;
  - For AggregatedSummary metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `sum/count` columns are also stored;
  - For Sketch metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `min/max/avg/sum` columns are also stored;

## Collect metrics with InfluxDB line protocol format

Vector can collect metrics in the InfluxDB line protocol format and send them to GreptimeDB. For more information, refer to the [Kafka guide](/user-guide/ingest-data/for-observability/kafka.md#metrics).

## Collect logs

Vector can also collect logs and send them to GreptimeDB. For more details, refer to the [Kafka guide](/user-guide/ingest-data/for-observability/kafka.md#logs).

