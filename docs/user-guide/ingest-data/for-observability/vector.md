---
keywords: [Vector, integration, configuration, data model, metrics]
description: Instructions for integrating Vector with GreptimeDB, including configuration, data model mapping, and example configurations.
---

# Vector

:::tip NOTE
This document is based on Vector v0.62.0. All example configurations below are based on this version. Please adjust the host and port configurations for each sink according to your actual GreptimeDB instance. All port values below are defaults.
:::

Vector is a high-performance observability data pipeline. It natively supports GreptimeDB as a metrics data receiver. Through Vector, you can receive metrics data from various sources including Prometheus, OpenTelemetry, StatsD, etc. GreptimeDB can serve as a sink component for Vector to receive metrics data.

## Writing Metrics Data

GreptimeDB supports multiple ways to write metrics data:

- Using [`greptimedb_metrics` sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/)
- Using InfluxDB line protocol format
- Using Prometheus Remote Write protocol

### Using `greptimedb_metrics` sink

#### Example

Below is an example configuration using `greptimedb_metrics` sink to write host metrics:

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

Vector uses gRPC to communicate with GreptimeDB, so the default port for Vector sink is `4001`. If you changed the default gRPC port when starting GreptimeDB with [custom configuration](/user-guide/deployments-administration/configuration.md#configuration-file-options), please use your own port.

For more requirements, please visit [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/) to view more configuration options.

### Data Model

The following rules are used when storing Vector metrics into GreptimeDB:

- Use `<metric namespace>_<metric name>` as the table name in GreptimeDB, for example, `host_cpu_seconds_total`;
- Use the timestamp of the metric as the time index of GreptimeDB. The column name is `greptime_timestamp` when `new_naming = true`, as in the example above, or `ts` otherwise;
- Use the tags of the metric as GreptimeDB tags;
- For Vector metrics which have multiple subtypes:
  - For Counter and Gauge metrics, the values are stored in the `greptime_value` column (`val` when `new_naming` is false);
  - For Set metrics, the number of data points are stored in the `greptime_value` column (`val` when `new_naming` is false);
  - For Distribution metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `min/max/avg/sum/count` columns are also stored;
  - For AggregatedHistogram metrics, the values of each bucket are stored in the `bxx` column, where xx is the upper limit of the bucket, and the `sum/count` columns are also stored;
  - For AggregatedSummary metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `sum/count` columns are also stored;
  - For Sketch metrics, the values of each percentile are stored in the `pxx` column, where xx is the percentile, and the `count/min/max/avg/sum` columns are also stored;

### Using InfluxDB Line Protocol Format

You can use the `influx` sink to write metrics data. We recommend using v2 version of InfluxDB line protocol format.

Below is an example configuration using `influx` sink to write host metrics:

```toml
# sample.toml

[sources.my_source_id]
type = "internal_metrics"

[sinks.my_sink_id]
type = "influxdb_metrics"
inputs = [ "my_source_id" ]
version = "2"
bucket = "public"
endpoint = "http://<host>:4000/v1/influxdb"
org = ""
token = ""
```

The above configuration uses v2 of the InfluxDB line protocol, selected by `version = "2"`. Specific field explanations:

- `type`: Value for InfluxDB line protocol is `influxdb_metrics`.
- `version`: InfluxDB API version. Required since Vector v0.60.0.
- `bucket`: Database name in GreptimeDB.
- `org`: Organization name in GreptimeDB (needs to be empty).
- `token`: GreptimeDB credentials in the form `<username>:<password>`. Leave it empty when authentication is disabled.

For more details, please refer to [InfluxDB Line Protocol documentation](../for-iot/influxdb-line-protocol.md) to learn how to write data to GreptimeDB using InfluxDB Line Protocol.

### Using Prometheus Remote Write Protocol

Below is an example configuration using Prometheus Remote Write protocol to write host metrics:

```toml
# sample.toml

[sources.my_source_id]
type = "internal_metrics"

[sinks.prometheus_remote_write]
type = "prometheus_remote_write"
inputs = [ "my_source_id" ]
endpoint = "http://<host>:4000/v1/prometheus/write?db=<dbname>"
compression = "snappy"
auth = { strategy = "basic", user = "<username>", password = "<password>" }
# The write endpoint accepts only POST, so send the GET health check to /v1/health instead.
healthcheck.uri = "http://<host>:4000/v1/health"
```

## Writing Logs Data

GreptimeDB supports multiple ways to write logs data:

- Using [`greptimedb_logs` sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_logs/) to write logs data to GreptimeDB.
- Using Loki protocol to write logs data to GreptimeDB.

We strongly recommend all users to use `greptimedb_logs` sink to write logs data, as it is optimized for GreptimeDB and better supports GreptimeDB features. We also recommend enabling compression for various protocols to improve data transmission efficiency.

### Using `greptimedb_logs` sink (recommended)

```toml
# sample.toml

[sources.my_source_id]
type = "demo_logs"
count = 10
format = "apache_common"
interval = 1

[sinks.my_sink_id]
type = "greptimedb_logs"
inputs = [ "my_source_id" ]
compression = "gzip"
dbname = "public"
endpoint = "http://<host>:4000"
extra_headers = { "x-greptime-pipeline-params" = "max_nested_levels=10" }
pipeline_name = "greptime_identity"
table = "<table>"
username = "<username>"
password = "<password>"

[sinks.my_sink_id.extra_params]
source = "vector"
skip_error = "true"
```

This example demonstrates how to use `greptimedb_logs` sink to write generated demo logs data to GreptimeDB. For more information, please refer to [Vector greptimedb_logs sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_logs/) documentation.

### Using Loki Protocol

#### Example

```toml
[sources.generate_syslog]
type = "demo_logs"
format = "syslog"
count = 100
interval = 1

[transforms.remap_syslog]
inputs = ["generate_syslog"]
type = "remap"
source = """
.labels = {
    "host": .host,
    "service": .service,
}
.structured_metadata = {
    "source_type": .source_type
}
"""

[sinks.my_sink_id]
type = "loki"
inputs = ["remap_syslog"]
compression = "snappy"
endpoint = "http://<host>:4000"
out_of_order_action = "accept"
path = "/v1/loki/api/v1/push"
encoding = { codec = "raw_message" }
labels = { "*" = "{{labels}}" }
structured_metadata = { "*" = "{{structured_metadata}}" }
auth = {strategy = "basic", user = "<username>", password = "<password>"}
```

The above configuration writes logs data to GreptimeDB using Loki protocol. Specific configuration item explanations:

- `compression`: Sets compression algorithm for data transmission, using `snappy` here.
- `endpoint`: Specifies Loki's receiving address.
- `out_of_order_action`: Sets how to handle out-of-order logs, choosing `accept` here to accept out-of-order logs. GreptimeDB supports writing out-of-order logs.
- `path`: Specifies Loki's API path.
- `encoding`: Sets data encoding method, using `raw_message` here.
- `labels`: Specifies log labels, mapping `labels` content to `{{labels}}` here. That is the `labels` field in remap_syslog.
- `structured_metadata`: Specifies structured metadata, mapping `structured_metadata` content to `{{structured_metadata}}` here. That is the `structured_metadata` field in remap_syslog.

For meanings of `labels` and `structured_metadata`, please refer to [Loki documentation](https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/).

For Loki protocol, `labels` will use Tag type in time series scenarios by default, please avoid using high-cardinality fields for these fields. `structured_metadata` will be stored as a complete JSON field.

Note that since Vector's Loki sink configuration doesn't allow setting headers, you cannot specify a custom GreptimeDB log table or pipeline through `X-Greptime-*` headers. Logs are written to GreptimeDB's default Loki table, `loki_logs`. If you need to specify a table or use pipeline functionality, please consider using the `greptimedb_logs` sink.
