---
keywords: [OpenTelemetry, OTLP, metrics, logs, traces, integration, data model]
description: Instructions for integrating OpenTelemetry with GreptimeDB, including metrics, logs, and traces data model mapping, example configurations, and supported protocols.
---

# OpenTelemetry Protocol (OTLP)

[OpenTelemetry](https://opentelemetry.io/) is a vendor-neutral open-source observability framework for instrumenting, generating, collecting, and exporting telemetry data such as traces, metrics, logs. The OpenTelemetry Protocol (OTLP) defines the encoding, transport, and delivery mechanism of telemetry data between telemetry sources, intermediate processes such as collectors and telemetry backends.

## OpenTelemetry Collectors

You can easily configure GreptimeDB as the target for your OpenTelemetry collector.
For more information, please refer to the [OTel Collector](otel-collector.md) and [Grafana Alloy](alloy.md) example.

## HTTP Base Endpoint

[Base endpoint URL](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/#otel_exporter_otlp_endpoint) for all signal types: `http{s}://<host>/v1/otlp`

This unified endpoint is useful when sending multiple signal types (metrics, logs, and traces) to the same destination, simplifying your OpenTelemetry configuration.

## Metrics

GreptimeDB is an observability backend to consume OpenTelemetry Metrics natively via [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol.

### OTLP/HTTP API

To send OpenTelemetry Metrics to GreptimeDB through OpenTelemetry SDK libraries, use the following information:

- URL: `http{s}://<host>/v1/otlp/v1/metrics`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/deployments-administration/authentication/static/) and [HTTP API](https://docs.greptime.com/user-guide/protocols/http#authentication)

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`. For example, in Node.js, you can use [`@opentelemetry/exporter-metrics-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-metrics-otlp-proto); in Go, you can use [`go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp); in Java, you can use [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp); and in Python, you can use [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/).

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information about the OpenTelemetry SDK, please refer to the official documentation for your preferred programming language.

### Example Code

Here are some example codes about how to setup the request in different languages:

<Tabs>

<TabItem value="TypeScript" label="TypeScript">

```ts
const auth = Buffer.from(`${username}:${password}`).toString('base64')
const exporter = new OTLPMetricExporter({
  url: `https://${dbHost}/v1/otlp/v1/metrics`,
  headers: {
    Authorization: `Basic ${auth}`,
    'X-Greptime-DB-Name': db,
  },
  timeoutMillis: 5000,
})
```

</TabItem>

<TabItem value="Go" label="Go">

```Go
auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", *username, *password)))
exporter, err := otlpmetrichttp.New(
    context.Background(),
    otlpmetrichttp.WithEndpoint(*dbHost),
    otlpmetrichttp.WithURLPath("/v1/otlp/v1/metrics"),
    otlpmetrichttp.WithHeaders(map[string]string{
        "X-Greptime-DB-Name": *dbName,
        "Authorization":      "Basic " + auth,
    }),
    otlpmetrichttp.WithTimeout(time.Second*5),
)
```

</TabItem>

<TabItem value="Java" label="Java">

```Java
String endpoint = String.format("https://%s/v1/otlp/v1/metrics", dbHost);
String auth = username + ":" + password;
String b64Auth = new String(Base64.getEncoder().encode(auth.getBytes()));
OtlpHttpMetricExporter exporter = OtlpHttpMetricExporter.builder()
                .setEndpoint(endpoint)
                .addHeader("X-Greptime-DB-Name", db)
                .addHeader("Authorization", String.format("Basic %s", b64Auth))
                .setTimeout(Duration.ofSeconds(5))
                .build();
```

</TabItem>

<TabItem value="Python" label="Python">

```python
auth = f"{username}:{password}"
b64_auth = base64.b64encode(auth.encode()).decode("ascii")
endpoint = f"https://{host}/v1/otlp/v1/metrics"
exporter = OTLPMetricExporter(
    endpoint=endpoint,
    headers={"Authorization": f"Basic {b64_auth}", "X-Greptime-DB-Name": db},
    timeout=5)
```

</TabItem>

</Tabs>

For more information on the example code, please refer to the official documentation for your preferred programming language.

### Prometheus Compatibility

GreptimeDB always uses the Prometheus-compatible format for OTLP metrics ingestion.
You can query these metrics using PromQL.

:::warning Upgrading from the legacy OTLP format
The legacy conversion path has been removed. The `otlp_metric_compat` table option
is still accepted as metadata, but no longer selects an ingestion format.
Existing data is not rewritten. New writes use the name translation, attribute
selection, and data model described below, which can change destination table
names and schemas. Before upgrading, check your exporters, existing tables, and
queries against these mappings. Separating requests or setting
`otlp_metric_compat='legacy'` does not restore the old behavior.
:::

GreptimeDB pre-processes the incoming data before persisting them, including:
1. Converting the metric names(table names) and the label names to the Prometheus style(e.g: replace `.` with `_`). By default, GreptimeDB also adds Prometheus-style suffixes based on the metric unit and type. See [here](https://opentelemetry.io/docs/specs/otel/compatibility/prometheus_and_openmetrics/#metric-metadata-1) for details.

   Here are some examples of the conversion:

   | OTLP Metric / Attribute | OTLP Type / Unit | Prometheus Equivalent |
   | :--- | :--- | :--- |
   | `cache.hit_ratio` | Gauge / `1` | `cache_hit_ratio` |
   | `memory.usage` | Gauge / `By` | `memory_usage_bytes` |
   | `queue.length` | Gauge / `{item}` | `queue_length` |
   | `http.server.request.duration` | Histogram / `s` | `http_server_request_duration_seconds` |
   | `rpc.server.duration` | Histogram / `ms` | `rpc_server_duration_milliseconds` |
   | `http.client.request.size` | Sum (Monotonic) / `By` | `http_client_request_size_bytes_total` |
   | `system.network.io` | Sum (Monotonic) / `By` | `system_network_io_bytes_total` |
   | `http.status_code` (Attribute) | - | `http_status_code` |
   | `service.name` (Attribute) | - | `service_name` |

2. Discarding some resource attributes and all scope attributes by default. The kept resource attributes name list can be found [here](https://prometheus.io/docs/guides/opentelemetry/#promoting-resource-attributes). This behavior is configurable.

OTLP `Sum`, `Histogram`, and `ExponentialHistogram` metrics can have delta temporality.
GreptimeDB stores their raw interval values with the tag
`otlp_aggregation_temporality="delta"`, without accumulating values across points
or requests. This tag separates delta and cumulative series in the same table.
See [here](https://grafana.com/blog/2023/09/26/opentelemetry-metrics-a-guide-to-delta-vs.-cumulative-temporality-trade-offs/) for some context.

You can set the HTTP headers to configure the pre-processing behaviors. Here are the options:
1. `x-greptime-otlp-metric-promote-all-resource-attrs`: Persist all resource attributes. Default to `false`.
2. `x-greptime-otlp-metric-promote-resource-attrs`: If not persisting all resource attributes, the attribute name list to be kept. Use `;` to join the name list.
3. `x-greptime-otlp-metric-ignore-resource-attrs`: If persisting all resource attributes, the attribute name list to be ignored. Use `;` to join the name list.
4. `x-greptime-otlp-metric-promote-scope-attrs`: Whether to persist the scope attributes. Default to `false`.
5. `x-greptime-otlp-metric-translation-strategy`: How to translate OTLP metric names(table names) and label names(tag columns) before persisting them. Default to `UnderscoreEscapingWithSuffixes`.

The `x-greptime-otlp-metric-translation-strategy` header accepts the following values:

| Value | Metric name behavior | Label name behavior | Original names | Translated names |
| :--- | :--- | :--- | :--- | :--- |
| `UnderscoreEscapingWithSuffixes` | Convert unsupported characters to `_`, and add Prometheus-style unit/type suffixes. | Convert unsupported characters to `_`. | Metric: `http.server.request-duration_total` (monotonic sum, unit `ms`)<br />Label: `_http.status-code` | Metric: `http_server_request_duration_milliseconds_total`<br />Label: `key_http_status_code` |
| `UnderscoreEscapingWithoutSuffixes` | Convert unsupported characters to `_`, but do not add unit/type suffixes. | Convert unsupported characters to `_`. | Metric: `http.server.request-duration_total` (monotonic sum, unit `ms`)<br />Label: `_http.status-code` | Metric: `http_server_request_duration_total`<br />Label: `key_http_status_code` |
| `NoUTF8EscapingWithSuffixes` | Keep the original metric name characters, and add Prometheus-style unit/type suffixes. | Keep the original label name characters. | Metric: `http.server.request-duration_total` (monotonic sum, unit `ms`)<br />Label: `_http.status-code` | Metric: `http.server.request-duration_milliseconds_total`<br />Label: `_http.status-code` |
| `NoTranslation` | Keep the original metric name without adding suffixes. | Keep the original label name characters. | Metric: `http.server.request-duration_total` (monotonic sum, unit `ms`)<br />Label: `_http.status-code` | Metric: `http.server.request-duration_total`<br />Label: `_http.status-code` |

The header value is case-sensitive. Invalid values are rejected with a `400 Bad Request` response.
See [OTel specs](https://opentelemetry.io/docs/specs/otel/metrics/sdk_exporters/prometheus/#translation-strategy) and [Prometheus docs](https://prometheus.io/docs/guides/opentelemetry/#utf-8) for more details.

### Data Model

The Prometheus-compatible OTLP metrics data model is mapped to the GreptimeDB data model according to the following rules:

- The name of the Metric will be used as the name of the GreptimeDB table, and the table will be automatically created if it does not exist.
- Only selected resource attributes are kept by default. See above for details and configuration options. Attributes are used as tag columns in the GreptimeDB table.
- You can refer to the [Prometheus Data Model](./prometheus.md#data-model) for other details.
- Explicit `Histogram` points are represented as `_bucket`, `_sum`, and `_count`
  series. Bucket counts are prefix-summed within each point, including delta points.
  The `_sum` series is emitted only when the point includes a sum.
- `Summary` quantiles are stored as rows with a `quantile` tag and a
  `greptime_value` field, with separate `_sum` and `_count` series.
- Cumulative and delta `ExponentialHistogram` metrics are supported by default via OTLP/HTTP.
  Each point is stored as a native histogram in a Struct field named
  `greptime_native_histogram` by default, rather than separate `_bucket`, `_sum`, and
  `_count` series. Unspecified or unrecognized temporality is rejected.

OTel Arrow does not support exponential histograms because its wire format omits
`zero_threshold`.

With the metric engine enabled, incoming timestamps are aligned to the destination
table's time-index precision. New logical tables inherit the physical table's
precision; automatically created physical tables use milliseconds. Without the
metric engine, OTLP metrics use millisecond timestamps.

### Query Delta Exponential Histograms

Each delta exponential histogram stores one interval's count, sum, and buckets.
Use `sum_over_time` to combine intervals, and divide by the query range duration in
seconds for a per-second histogram. For a metric stored as `request_duration`:

```promql
sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m])
sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m]) / 180
histogram_count(sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m]))
histogram_sum(sum_over_time(request_duration{otlp_aggregation_temporality="delta"}[3m]))
```

The range selects samples by their end timestamp, excluding the left boundary and
including the right boundary. Each selected sample contributes its entire
interval, even if its start precedes the range. For example, counts of `10`, `20`,
and `15` ending at seconds `60`, `120`, and `180` give a count of `45` over `[3m]`
at second `180`, or `0.25` observations per second after division by `180`.
Missing intervals do not shorten the divisor. A single sample contributes its
full value; an empty window returns no sample. There is no prorating or
extrapolation.

Do not use native-histogram `rate()` or `increase()` for raw delta histograms:
these functions retain counter semantics regardless of the temporality tag.
For delta `Sum` and explicit `Histogram` float series carrying this tag,
GreptimeDB's `increase()` sums interval values and `rate()` divides that sum by
the range duration.

Under default storage settings, points with the same table, tags, and stored
timestamp replace the previous value; their buckets are not added together.
Timestamp alignment can make distinct endpoints share a stored timestamp.
The interval start is not part of the key.

Upgrade all ingestion frontends before enabling delta exponential histogram senders.

### Partial Success

Point-level conversion and schema errors reject the affected source data points
while allowing valid points in the same OTLP/HTTP request to be ingested. This
applies to gauges, sums, explicit histograms, summaries, and exponential histograms.
If a point produces multiple rows or series, such as `_bucket`, `_sum`, and
`_count`, a validation failure in any output rejects all outputs of that point.
Conflicting new column definitions reject all points contributing to the conflict,
including conflicts between logical tables sharing a physical metric table.

Requests with both accepted and rejected points return HTTP `200` with
`partial_success.rejected_data_points` and an error message. The count is the number
of rejected source points, not generated rows. Requests with only rejected points
return HTTP `400` with an `InvalidArgument` error. Authentication, authorization,
and storage failures can still fail the request as a whole.

## Logs

GreptimeDB consumes OpenTelemetry Logs natively via [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol.

### OTLP/HTTP API

To send OpenTelemetry Logs to GreptimeDB through OpenTelemetry SDK libraries, use the following information:

- URL: `http{s}://<host>/v1/otlp/v1/logs`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](/user-guide/deployments-administration/authentication/static.md) and [HTTP API](/user-guide/protocols/http.md#authentication).
  - `X-Greptime-Log-Table-Name`: `<table_name>` (optional) - The table name to store the logs. If not provided, the default table name is `opentelemetry_logs`.
  - `X-Greptime-Log-Extract-Keys`: `<extract_keys>` (optional) - The keys to extract from the attributes. The keys should be separated by commas (`,`). For example, `key1,key2,key3` will extract the keys `key1`, `key2`, and `key3` from the attributes and promote them to the top level of the log, setting them as tags. Key matching is case-insensitive. If the same key exists in log attributes, scope attributes, and resource attributes, the value from log attributes takes precedence, followed by scope attributes and then resource attributes. Supported extracted value types are string, signed integer, unsigned integer, and boolean. If the field type is array, float, or object, an error will be returned. If a pipeline is provided, this setting will be ignored.
  - `X-Greptime-Pipeline-Name`: `<pipeline_name>` (optional) - The pipeline name to process the logs. If not provided, GreptimeDB uses the built-in OTLP log mapping and applies `X-Greptime-Log-Extract-Keys` if it is provided.
  - `X-Greptime-Pipeline-Version`: `<pipeline_version>` (optional) - The pipeline version to process the logs. If not provided, the latest version of the pipeline will be used.
  - `X-Greptime-Pipeline-Params`: `<pipeline_params>` (optional) - The pipeline parameters to use when processing logs with a custom pipeline.

`X-Greptime-Log-Pipeline-Name` and `X-Greptime-Log-Pipeline-Version` are also accepted as legacy aliases for the generic pipeline headers. Use `X-Greptime-Pipeline-Name` and `X-Greptime-Pipeline-Version` for new configurations.

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`.

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information about the OpenTelemetry SDK, please refer to the official documentation for your preferred programming language.

### Example Code

Please refer to the sample code in the [OpenTelemetry Collector documentation](otel-collector.md), which includes how to send OpenTelemetry logs to GreptimeDB.
You can also refer to the sample code in the [Alloy documentation](alloy.md#logs) to learn how to send OpenTelemetry logs to GreptimeDB.

### Custom Pipeline Input

When `X-Greptime-Pipeline-Name` is provided, GreptimeDB converts each OTLP log record to one pipeline event. The event uses the following fields:

| Field | Description |
| --- | --- |
| `Timestamp` | The OTLP `time_unix_nano`. |
| `ObservedTimestamp` | The OTLP `observed_time_unix_nano`. |
| `TraceId`, `SpanId` | Hex-encoded IDs. |
| `TraceFlags`, `SeverityText`, `SeverityNumber`, `Body` | The corresponding OTLP log fields. `Body` is converted to a string. |
| `ResourceSchemaUrl`, `ScopeSchemaUrl`, `ScopeName`, `ScopeVersion` | The corresponding resource and scope fields. |
| `ResourceAttributes`, `ScopeAttributes`, `LogAttributes` | Objects containing the corresponding OTLP attributes. |

### Data Model

The OTLP logs data model is mapped to the GreptimeDB data model according to the following rules:

Default schema for a newly created table:

```sql
+-----------------------+---------------------+------+------+---------+---------------+
| Column                | Type                | Key  | Null | Default | Semantic Type |
+-----------------------+---------------------+------+------+---------+---------------+
| timestamp             | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| trace_id              | String              |      | YES  |         | FIELD         |
| span_id               | String              |      | YES  |         | FIELD         |
| severity_text         | String              |      | YES  |         | FIELD         |
| severity_number       | Int32               |      | YES  |         | FIELD         |
| body                  | String              |      | YES  |         | FIELD         |
| log_attributes        | Json                |      | YES  |         | FIELD         |
| trace_flags           | Int32               |      | YES  |         | FIELD         |
| scope_name            | String              | PRI  | YES  |         | TAG           |
| scope_version         | String              |      | YES  |         | FIELD         |
| scope_attributes      | Json                |      | YES  |         | FIELD         |
| scope_schema_url      | String              |      | YES  |         | FIELD         |
| resource_attributes   | Json                |      | YES  |         | FIELD         |
| resource_schema_url   | String              |      | YES  |         | FIELD         |
+-----------------------+---------------------+------+------+---------+---------------+
14 rows in set (0.00 sec)
```

- You can use `X-Greptime-Log-Table-Name` to specify the table name for storing the logs. If not provided, the default table name is `opentelemetry_logs`.
- All attributes, including resource attributes, scope attributes, and log attributes, will be stored as a JSON column in the GreptimeDB table.
- The `body` column is created with a fulltext index by default. The index is
  enabled with the default fulltext settings: `analyzer=English`,
  `case_sensitive=false`, and `backend=bloom`. For the Bloom backend, the
  default `granularity` is `10240` and the default `false_positive_rate` is
  `0.01`. For details, see the [fulltext index
  documentation](/user-guide/manage-data/data-index.md#full-text-index).
- The timestamp of the log will be used as the timestamp index in GreptimeDB, with the column name `timestamp`. It is preferred to use `time_unix_nano` as the timestamp column. If `time_unix_nano` is not provided, `observed_time_unix_nano` will be used instead.

### Append Only

By default, log table created by OpenTelemetry API are in [append only
mode](/user-guide/deployments-administration/performance-tuning/design-table.md#when-to-use-append-only-tables).

## Traces

GreptimeDB supports writing OpenTelemetry traces data directly via the [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol, and it also provides a table model of OpenTelemetry traces for users to query and analyze traces data conveniently.

### OTLP/HTTP API

You can use [OpenTelemetry SDK](https://opentelemetry.io/docs/languages/) or other similar technologies to add traces data to your application. You can also use [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) to collect traces data and use GreptimeDB as the backend storage.

To send OpenTelemetry traces data to GreptimeDB through OpenTelemetry SDK libraries, please use the following information:

- URL: `http{s}://<host>/v1/otlp/v1/traces`
- Headers:
  - `Content-Type`: `application/x-protobuf`
  - `Authorization`: `Basic` authentication.
  - `X-Greptime-DB-Name`: `<dbname>`
  - `X-Greptime-Trace-Table-Name`: `<table_name>` (optional) - The table name to store the traces. If not provided, the default table name is `opentelemetry_traces`.
  - `X-Greptime-Pipeline-Name`: `greptime_trace_v1` or `greptime_trace_v2` (required) - The pipeline name to process the traces.

GreptimeDB accepts **protobuf encoded traces data** via **HTTP protocol**.

### Example Code

You can directly send OpenTelemetry traces data to GreptimeDB, or use OpenTelemetry Collector to collect traces data and use GreptimeDB as the backend storage. Please refer to the example code in the [OpenTelemetry Collector documentation](/user-guide/traces/read-write.md#opentelemetry-collector) to learn how to send OpenTelemetry traces data to GreptimeDB.

### Data Model

See [Trace Data Modeling](/user-guide/traces/data-model.md) for table schemas,
attribute storage, and table options for `greptime_trace_v1` and `greptime_trace_v2`.

### Schema Evolution and Partial Success

The `greptime_trace_v1` model automatically adds new flattened attribute columns. When a trace table already exists, GreptimeDB reconciles incoming attribute value types with the existing table schema. Compatible scalar values can be coerced to the existing column type, and existing `Int64` attribute columns may be widened to `Float64` when incoming values contain both integers and floats.

If some spans in a trace request cannot be written because of incompatible schema or values, GreptimeDB may still accept the other spans and return an OTLP `partial_success` response with `rejected_spans` and `error_message`. If all spans are rejected, the endpoint returns a `400 Bad Request` response.

### Auxiliary Tables

GreptimeDB automatically creates auxiliary tables (e.g., `opentelemetry_traces_services` and `opentelemetry_traces_operations`) to facilitate searching for services and operations. See [Auxiliary Tables](/user-guide/traces/data-model.md#auxiliary-tables) for details.

### Append-only Mode

By default, trace tables created by the OpenTelemetry API are in [append-only mode](/user-guide/deployments-administration/performance-tuning/design-table.md#when-to-use-append-only-tables).
