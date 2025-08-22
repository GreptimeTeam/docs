---
keywords: [Vector, integration, configuration, data model, metrics]
description: Instructions for integrating Vector with GreptimeDB, including configuration, data model mapping, and example configurations.
---

# Vector

:::tip NOTE
This document is based on Vector v0.49.0. All example configurations below are based on this version. Please adjust the host and port configurations for each sink according to your actual GreptimeDB instance. All port values below are defaults. We strongly recommend using GreptimeDB official components (`greptimedb_metrics`, `greptimedb_logs`) as Vector sink components.
:::

Vector is a high-performance observability data pipeline. It natively supports GreptimeDB as a metrics data receiver. Through Vector, you can receive metrics data from various sources including Prometheus, OpenTelemetry, StatsD, etc. GreptimeDB can serve as a sink component for Vector to receive metrics data.

## Writing Metrics Data

GreptimeDB supports multiple ways to write metrics data:

- Using [`greptimedb_metrics` sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/) (recommended)
- Writing metrics data to GreptimeDB using InfluxDB line protocol format
- Writing metrics data to GreptimeDB using Prometheus Remote Write protocol

### Using `greptimedb_metrics` sink (recommended)

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

Vector uses gRPC to communicate with GreptimeDB, so the default port for Vector sink is `4001`. If you changed the default gRPC port when starting GreptimeDB with [custom configuration](/user-guide/deployments-administration/configuration.md#configuration-file), please use your own port.

For more requirements, please visit [Vector GreptimeDB Configuration](https://vector.dev/docs/reference/configuration/sinks/greptimedb_metrics/) to view more configuration options.

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
bucket = "public"
endpoint = "http://<host>:4000/v1/influxdb"
org = ""
token = ""
```

The above configuration uses v2 version of InfluxDB line protocol. Vector determines the InfluxDB protocol version based on fields in the TOML configuration, so please ensure the configuration contains `bucket`, `org`, and `token` fields. Specific field explanations:

- `type`: Value for InfluxDB line protocol is `influxdb_metrics`.
- `bucket`: Database name in GreptimeDB.
- `org`: Organization name in GreptimeDB (needs to be empty).
- `token`: Token for authentication (needs to be empty). Since Influx line protocol token has special format and must start with `Token `, this differs from GreptimeDB's authentication method and is currently not compatible. If using GreptimeDB instance with authentication, please use `greptimedb_metrics`.

For more details, please refer to [InfluxDB Line Protocol documentation](../for-iot/influxdb-line-protocol.md) to learn how to write data to GreptimeDB using InfluxDB Line Protocol.

### Using OTLP Protocol

As of Vector v0.49.0, Vector does not support writing metrics data using OTLP protocol. Please do not attempt to use OTLP sink to write metrics data, as this will trigger Vector's panic.

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
auth = { strategy = "basic", username = "<username>", password = "<password>" }
```

## Writing Logs Data

GreptimeDB supports multiple ways to write logs data:

- Using [`greptimedb_logs` sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_logs/) to write logs data to GreptimeDB.
- Using OTLP protocol to write logs data to GreptimeDB.
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
extra_headers = { "skip_error" = "true" }
pipeline_name = "greptime_identity"
table = "<table>"
username = "<username>"
password = "<password>"

[sinks.my_sink_id.extra_params]
source = "vector"
x-greptime-pipeline-params = "flatten_json_object=true"
```

This example demonstrates how to use `greptimedb_logs` sink to write generated demo logs data to GreptimeDB. For more information, please refer to [Vector greptimedb_logs sink](https://vector.dev/docs/reference/configuration/sinks/greptimedb_logs/) documentation.

### Using OTLP Protocol (not recommended)

GreptimeDB's OTLP protocol only supports HTTP/Protobuf format for logs data. Due to Vector's OTLP sink configuration being complex and not usable with simple configuration, the following example is for reference only.

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
log(., level: "info", rate_limit_secs: 0)
syslog = parse_syslog!(.message)

severity_text = if includes(["emerg", "err", "crit", "alert"], syslog.severity) {
  "ERROR"
} else if syslog.severity == "warning" {
  "WARN"
} else if syslog.severity == "debug" {
  "DEBUG"
} else if includes(["info", "notice"], syslog.severity) {
  "INFO"
} else {
  syslog.severity
}

.resource_logs = [{
  "resource": {
    "attributes": [
      { "key": "source_type", "value": { "string_value": .source_type } },
      { "key": "service.name", "value": { "string_value": syslog.appname } },
      { "key": "host.hostname", "value": { "string_value": syslog.hostname } }
    ]
  },
  "scope_logs": [{
    "scope": {
      "name": syslog.msgid
    },
    "log_records": [{
      "time_unix_nano": to_unix_timestamp!(syslog.timestamp, unit: "nanoseconds"),
      "body": { "string_value": syslog.message },
      "severity_text": severity_text,
      "attributes": [
        { "key": "syslog.procid", "value": { "string_value": to_string(syslog.procid) } },
        { "key": "syslog.facility", "value": { "string_value": syslog.facility } },
        { "key": "syslog.version", "value": { "string_value": to_string(syslog.version) } }
      ]
    }]
  }]
}]

del(.message)
del(.timestamp)
del(.service)
del(.source_type)
"""

[sinks.emit_syslog]
inputs = ["remap_syslog"]
type = "opentelemetry"

[sinks.emit_syslog.protocol]
type = "http"
uri = "http://localhost:4000/v1/otlp/v1/logs"
method = "post"

[sinks.emit_syslog.protocol.encoding]
codec = "protobuf"

[sinks.emit_syslog.protocol.encoding.protobuf]
message_type = "opentelemetry.proto.logs.v1.LogsData"
desc_file = "opentelemetry.desc"

[sinks.emit_syslog.protocol.framing]
method = "bytes"

[sinks.emit_syslog.protocol.request.headers]
content-type = "application/x-protobuf"
X-Greptime-DB-Name = "public"
X-Greptime-Log-Table-Name = "otlp_logs"
```

#### Notes

##### Remap

Vector's Log Event original content does not meet OpenTelemetry format requirements, so it cannot be directly written to GreptimeDB. Its content is as follows:

```json
{
  "host": "localhost",
  "message": "<5>2 2025-08-20T16:49:52.875+08:00 we.itau shaneIxD 7745 ID183 - We're gonna need a bigger boat",
  "service": "vector",
  "source_type": "demo_logs",
  "timestamp": "2025-08-20T08:49:52.875755412Z"
}
```

Even log data output by OpenTelemetry source needs modification before writing. The format of this log data in Vector is as follows:

```json
{
  "attributes": {
    "log.index": 6
  },
  "dropped_attributes_count": 0,
  "message": "log message 6",
  "observed_timestamp": "2025-08-20T08:59:03.491518609Z",
  "resources": {
    "library": "otlp-generator",
    "service.name": "example-service"
  },
  "scope": {
    "name": "otlp-generator"
  },
  "severity_text": "INFO",
  "source_type": "opentelemetry",
  "timestamp": "2025-08-20T08:59:03.481116430Z"
}
```

Since many fields don't have `AnyValue`, `KeyValue` type wrapping, you need to use `remap` transformation to reconstruct log data to meet OpenTelemetry requirements. Please adjust field mapping according to actual situation.

##### Descriptor File

Note in `sinks.emit_syslog.protocol.encoding.protobuf` configuration, we use `opentelemetry.proto.logs.v1.LogsData` as message type and specify descriptor file `opentelemetry.desc`. This descriptor file needs to be provided by yourself, usually obtained from OpenTelemetry's proto definitions. Here are the steps to compile the descriptor file:

1. Clone OpenTelemetry's proto definition repository:

   ```bash
   git clone https://github.com/open-telemetry/opentelemetry-proto.git
   cd opentelemetry-proto
   # This may change later, proto definition for GreptimeDB 0.16.0 uses this commit hash
   git checkout 8654ab7
   ```

2. Install `protoc` command (optional), can be installed through distribution package manager or download precompiled binaries from [Protocol Buffers Releases](https://github.com/protocolbuffers/protobuf/releases).

3. Compile descriptor file, note this needs to be executed in `opentelemetry-proto` directory:

   ```bash
   protoc -I . -o otlp.desc opentelemetry/proto/logs/v1/logs.proto opentelemetry/proto/metrics/v1/metrics.proto opentelemetry/proto/trace/v1/trace.proto opentelemetry/proto/resource/v1/resource.proto opentelemetry/proto/common/v1/common.proto
   ```

This descriptor file contains definitions for metrics, logs, and traces.

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

Note that since Vector's configuration doesn't allow setting headers, you cannot specify pipeline. If you need to use pipeline functionality, please consider using `greptimedb_logs` sink.

## Writing Trace Data

### Using OpenTelemetry Protocol (not recommended)

Same reasons as **writing logs using OpenTelemetry**, we recommend using components like Alloy or Otlp-collector. This document is for demonstration only.

#### Example

```toml
[sources.my_source_id]
type = "opentelemetry"

  [sources.my_source_id.grpc]
  address = "0.0.0.0:4317"

  [sources.my_source_id.http]
  address = "0.0.0.0:4318"
  headers = {}

    [sources.my_source_id.http.keepalive]
    max_connection_age_jitter_factor = 0.1
    max_connection_age_secs = 300

[transforms.remap_traces_1]
inputs = ["my_source_id.traces"]
type = "remap"
source = """
resource_spans = [{
  "resource": {"attributes":[
    {"key": "service.name", "value": {"string_value": .resources.service.name}},
    {"key": "library", "value": {"string_value": .resources.library}},
  ]},
  "scope_spans": [{
    "scope": {"name": "example-scope"},
    "spans": [{
      "span_id": .span_id,
      "trace_id": .trace_id,
      "name": .name,
      "kind": .kind,
      "start_time_unix_nano": to_unix_timestamp!(.start_time_unix_nano, unit: "nanoseconds"),
      "end_time_unix_nano": to_unix_timestamp!(.end_time_unix_nano, unit: "nanoseconds"),
      "attributes": [
        { "key": "example.attr", "value": { "string_value": .attributes."example.attr" } },
        { "key": "span.index", "value": { "int_value": .attributes."span.index" } }
      ],
      "events": [],
      "links": [],
      "parent_span_id": .parent_span_id,
      "trace_state": .trace_state,
      "status": {
        "code": .status.code,
        "message": .status.message
      },
      "dropped_attributes_count": .dropped_attributes_count,
      "dropped_events_count": .dropped_events_count,
      "dropped_links_count": .dropped_links_count,
    }]
  }]
}]

. = {
  "resource_spans": resource_spans,
}
"""

[sinks.emit_syslog]
inputs = ["remap_traces"]
type = "opentelemetry"

[sinks.emit_syslog.protocol]
type = "http"
uri = "http://localhost:4000/v1/otlp/v1/traces"
method = "post"

[sinks.emit_syslog.protocol.encoding]
codec = "protobuf"

[sinks.emit_syslog.protocol.encoding.protobuf]
message_type = "opentelemetry.proto.trace.v1.TracesData"
desc_file = "opentelemetry.desc"

[sinks.emit_syslog.protocol.framing]
method = "bytes"

[sinks.emit_syslog.protocol.request.headers]
content-type = "application/x-protobuf"
```

The configuration for writing Traces via the OpenTelemetry protocol is largely the same as for writing Logs. Because trace data has a more complex format, a `remap` transform is usually required to reconstruct the data to meet OpenTelemetry's requirements. Adjust field mappings according to the actual scenario. However, the reconstruction process can be very complex and VRL's expressive power is limited, so it may not fully satisfy the requirements. For example, handling the `attributes` field often requires manual conversion and ensuring each attribute conforms to OpenTelemetry's expectations. Recursive conversions may also be needed, which VRL cannot handle.
