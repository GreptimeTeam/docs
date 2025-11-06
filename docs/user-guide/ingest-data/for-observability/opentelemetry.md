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

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`. For example, in Node.js, you can use [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto); in Go, you can use [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp); in Java, you can use [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp); and in Python, you can use [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/).

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

You can find executable demos on GitHub at the links: [Go](https://github.com/GreptimeCloudStarters/quick-start-go), [Java](https://github.com/GreptimeCloudStarters/quick-start-java), [Python](https://github.com/GreptimeCloudStarters/quick-start-python), and [Node.js](https://github.com/GreptimeCloudStarters/quick-start-node-js).

:::tip NOTE
The example codes above may be outdated according to OpenTelemetry. We recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information on the example code, please refer to the official documentation for your preferred programming language.

### Prometheus Compatibility

Starting from `v0.16`, GreptimeDB is introducing a Prometheus-compatible mode for the OTLP metrics ingestion.
If the metrics data is persisted using the Prometheus-compatible format, you should be able to query them using PromQL, just like any Prometheus metrics.

If you have not ingested any OTLP metrics before, it will automatically use the Prometheus-compatible format.
Otherwise, it will remain the old data format with the existing table, but use the new data format for any newly created tables.

GreptimeDB pre-processes the incoming data before persisting them, including:
1. Converting the metric names(table names) and the label names to the Prometheus style(e.g: replace `.` with `_`). See [here](https://opentelemetry.io/docs/specs/otel/compatibility/prometheus_and_openmetrics/#metric-metadata-1) for details.
2. Discarding some resource attributes and all scope attributes by default. The kept resource attributes name list can be found [here](https://prometheus.io/docs/guides/opentelemetry/#promoting-resource-attributes). This behavior is configurable.

Note, `Sum` and `Histogram` data in OTLP can have delta temporality.
GreptimeDB saves their value directly without calculating the cumulative value.
See [here](https://grafana.com/blog/2023/09/26/opentelemetry-metrics-a-guide-to-delta-vs.-cumulative-temporality-trade-offs/) for some context.

You can set the HTTP headers to configure the pre-processing behaviors. Here are the options:
1. `x-greptime-otlp-metric-promote-all-resource-attrs`: Persist all resource attributes. Default to `false`.
2. `x-greptime-otlp-metric-promote-resource-attrs`: If not persisting all resource attributes, the attribute name list to be kept. Use `;` to join the name list.
3. `x-greptime-otlp-metric-ignore-resource-attrs`: If persisting all resource attributes, the attribute name list to be ignored. Use `;` to join the name list.
4. `x-greptime-otlp-metric-promote-scope-attrs`: Whether to persist the scope attributes. Default to `false`.

### Data Model

The Prometheus-compatible OTLP metrics data model is mapped to the GreptimeDB data model according to the following rules:

- The name of the Metric will be used as the name of the GreptimeDB table, and the table will be automatically created if it does not exist.
- Only selected resource attributes are kept by default. See above for details and configuration options. Attributes are used as tag columns in the GreptimeDB table.
- You can refer to the [Prometheus Data Model](./prometheus.md#data-model) for other details.
- ExponentialHistogram is not supported yet.

If you're using OTLP metrics before `v0.16`, you're ingesting the data without the Prometheus compatibility. Here are some mapping differences:

- All attributes, including resource attributes, scope attributes, and data point attributes, will be used as tag columns of the GreptimeDB table.
- Each quantile of the Summary data type will be used as a separated data column of GreptimeDB, and the column name is `greptime_pxx`, where xx is the quantile, such as 90/99, etc.

## Logs

GreptimeDB consumes OpenTelemetry Logs natively via [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol.

### OTLP/HTTP API

To send OpenTelemetry Logs to GreptimeDB through OpenTelemetry SDK libraries, use the following information:

- URL: `http{s}://<host>/v1/otlp/v1/logs`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](/user-guide/deployments-administration/authentication/static.md) and [HTTP API](/user-guide/protocols/http.md#authentication).
  - `X-Greptime-Log-Table-Name`: `<table_name>` (optional) - The table name to store the logs. If not provided, the default table name is `opentelemetry_logs`.
  - `X-Greptime-Log-Extract-Keys`: `<extract_keys>` (optional) - The keys to extract from the attributes. The keys should be separated by commas (`,`). For example, `key1,key2,key3` will extract the keys `key1`, `key2`, and `key3` from the attributes and promote them to the top level of the log, setting them as tags. If the field type is array, float, or object, an error will be returned. If a pipeline is provided, this setting will be ignored.
  - `X-Greptime-Log-Pipeline-Name`: `<pipeline_name>` (optional) - The pipeline name to process the logs. If not provided, the extract keys will be used to process the logs.
  - `X-Greptime-Log-Pipeline-Version`: `<pipeline_version>` (optional) - The pipeline version to process the logs. If not provided, the latest version of the pipeline will be used.

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`.

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

For more information about the OpenTelemetry SDK, please refer to the official documentation for your preferred programming language.

### Example Code

Please refer to the sample code in [opentelemetry-collector](#opentelemetry-collector), which includes how to send OpenTelemetry logs to GreptimeDB.  
You can also refer to the sample code in the [Alloy documentation](alloy.md#logs) to learn how to send OpenTelemetry logs to GreptimeDB.

### Data Model

The OTLP logs data model is mapped to the GreptimeDB data model according to the following rules:

Default table schema:

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
| trace_flags           | UInt32              |      | YES  |         | FIELD         |
| scope_name            | String              | PRI  | YES  |         | TAG           |
| scope_version         | String              |      | YES  |         | FIELD         |
| scope_attributes      | Json                |      | YES  |         | FIELD         |
| scope_schema_url      | String              |      | YES  |         | FIELD         |
| resource_attributes   | Json                |      | YES  |         | FIELD         |
| resource_schema_url   | String              |      | YES  |         | FIELD         |
+-----------------------+---------------------+------+------+---------+---------------+
17 rows in set (0.00 sec)
```

- You can use `X-Greptime-Log-Table-Name` to specify the table name for storing the logs. If not provided, the default table name is `opentelemetry_logs`.
- All attributes, including resource attributes, scope attributes, and log attributes, will be stored as a JSON column in the GreptimeDB table.
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
- Headers: The headers section is the same as the [Logs](#Logs) section, you can refer to the [Logs](#Logs) section for more information.

By default, GreptimeDB will write traces data to the `opentelemetry_traces` table in the `public` database. If you want to write traces data to a different table, you can use the `X-Greptime-DB-Name` and `X-Greptime-Trace-Table-Name` headers to specify the database and table name.

GreptimeDB will accept **protobuf encoded traces data** via **HTTP protocol** and the following headers are required:

- `content-type` should be configured as `application/x-protobuf`;
- `x-greptime-pipeline-name` should be configured as `greptime_trace_v1`;

### Example Code

You can directly send OpenTelemetry traces data to GreptimeDB, or use OpenTelemetry Collector to collect traces data and use GreptimeDB as the backend storage. Please refer to the example code in the [OpenTelemetry Collector documentation](/user-guide/traces/read-write.md#opentelemetry-collector) to learn how to send OpenTelemetry traces data to GreptimeDB.

### Data Model

GreptimeDB will map the OTLP traces data model to the following table schema:

```sql
+------------------------------------+---------------------+------+------+---------+---------------+
| Column                             | Type                | Key  | Null | Default | Semantic Type |
+------------------------------------+---------------------+------+------+---------+---------------+
| timestamp                          | TimestampNanosecond | PRI  | NO   |         | TIMESTAMP     |
| timestamp_end                      | TimestampNanosecond |      | YES  |         | FIELD         |
| duration_nano                      | UInt64              |      | YES  |         | FIELD         |
| parent_span_id                     | String              |      | YES  |         | FIELD         |
| trace_id                           | String              |      | YES  |         | FIELD         |
| span_id                            | String              |      | YES  |         | FIELD         |
| span_kind                          | String              |      | YES  |         | FIELD         |
| span_name                          | String              |      | YES  |         | FIELD         |
| span_status_code                   | String              |      | YES  |         | FIELD         |
| span_status_message                | String              |      | YES  |         | FIELD         |
| trace_state                        | String              |      | YES  |         | FIELD         |
| scope_name                         | String              |      | YES  |         | FIELD         |
| scope_version                      | String              |      | YES  |         | FIELD         |
| service_name                       | String              | PRI  | YES  |         | TAG           |
| span_attributes.net.sock.peer.addr | String              |      | YES  |         | FIELD         |
| span_attributes.peer.service       | String              |      | YES  |         | FIELD         |
| span_events                        | Json                |      | YES  |         | FIELD         |
| span_links                         | Json                |      | YES  |         | FIELD         |
+------------------------------------+---------------------+------+------+---------+---------------+
```

- Each row represents a single span
- The core OpenTelemetry fields such as `trace_id`, `span_id`, and `service_name` are promoted as dedicated table columns
- Resource attributes and span attributes are automatically flattened into separate columns, with column names being their JSON keys (using `.` to connect multiple levels of nesting)
- `span_events` and `span_links` are stored as JSON data types by default

Note: 
1. The `greptime_trace_v1` process uses the `trace_id` field to divide data into partitions for better performance. **Please make sure the first letter of the `trace_id` is evenly distributed**.
2. For non-test scenarios, you might want to set a `ttl` to the trace table to avoid data overload. Set the HTTP header `x-greptime-hints: ttl=7d` would set a `ttl` of 7 days during the table creation, see [here](/reference/sql/create.md#table-options) for more details about `ttl` in table option.

### Append Only

By default, log table created by OpenTelemetry API are in [append only
mode](/user-guide/deployments-administration/performance-tuning/design-table.md#when-to-use-append-only-tables).
