---
keywords: [Trace, OpenTelemetry, Jaeger, Grafana]
description: Covers basics of trace data ingestion and query in GreptimeDB.
---

# Ingestion and Query

:::warning

This section currently in the experimental stage and may be adjusted in future versions.

:::

In this section, we will get started with trace data in GreptimeDB from
ingestion and query.

GreptimeDB doesn't invent new protocols for trace, it follows existing standard
and widely adopted protocols.

## Ingestion

GreptimeDB uses OpenTelemetry OTLP/HTTP protocol as the primary trace data
ingestion protocol. OpenTelemetry Trace is the most adopted subprotocol in
OpenTelemetry family.

### OpenTelemetry SDK

If OpenTelemetry SDK/API is used in your application, you can configure an
OTLP/HTTP exporter to write trace data directly to GreptimeDB.

We covered this part in our [OpenTelemetry protocol
docs](/user-guide/ingest-data/for-observability/opentelemetry.md). You can
follow the guide for endpoint and parameters.

### OpenTelemetry Collector

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) is a
vendor-neutral service for collecting and processing OpenTelemetry data. You can
also configure it to send trace data to GreptimeDB using OTLP/HTTP.

<AnchorAlias id="ingest-with-greptime_trace_v2" />

#### Start OpenTelemetry Collector

You can use the following command to quickly start an OpenTelemetry Collector
instance, which will listen on ports `4317` (gRPC) and `4318` (HTTP):

```shell
docker run --rm \
  --network host \
  -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml \
  otel/opentelemetry-collector-contrib:0.165.0
```

With the following `config.yaml`, the first write to a new database creates
`opentelemetry_traces` with `JSON2` attribute columns.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlp_http:
    endpoint: "http://greptimedb:4000/v1/otlp" # Replace greptimedb with your setup
    headers:
      x-greptime-pipeline-name: "greptime_trace_v2"
      #authorization: "Basic <base64(username:password)>"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp_http]
```

#### Existing v1 trace tables

:::warning

If `greptime_trace_v1` created `opentelemetry_traces`, GreptimeDB rejects v2 writes
to that table. When you set `x-greptime-pipeline-name` to `greptime_trace_v2`,
also set `x-greptime-trace-table-name` to a new table name such as
`opentelemetry_traces_v2`. Use both headers for direct SDK writes as well.

:::

#### Ingest with greptime_trace_v1

The complete configuration above uses `greptime_trace_v2`. If you need flattened
attribute columns instead, replace its `exporters` section with the following;
keep the receivers and service configuration:

```yaml
exporters:
  otlp_http:
    endpoint: "http://greptimedb:4000/v1/otlp"
    headers:
      x-greptime-pipeline-name: "greptime_trace_v1"
      x-greptime-trace-table-name: "opentelemetry_traces_v1"
      #authorization: "Basic <base64(username:password)>"
    tls:
      insecure: true
```

Use a separate table to avoid mixing v1 and v2 data in the same table.
See [how the trace data models differ](./data-model.md#data-model-versioning).

#### Write Trace Data to OpenTelemetry Collector

You can configure the corresponding exporter to write traces data to the
OpenTelemetry Collector. For example, you can use the environment variable
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` to configure the endpoint of the exporter:

```shell
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/traces"
```

For convenience, you can use the tool
[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)
to quickly generate traces data and write it to the OpenTelemetry Collector. For
more details, please refer to the [OpenTelemetry Collector official
documentation](https://opentelemetry.io/docs/collector/quick-start/).

You can use the following command to install `telemetrygen` (please ensure you
have installed Go):

```shell
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

Then you can use the following command to generate traces data and write it to
the OpenTelemetry Collector:

```shell
telemetrygen traces --otlp-insecure --traces 3
```

The above command will generate 3 traces data and write it to the OpenTelemetry
Collector via gRPC protocol, and eventually stored into GreptimeDB.

### Authorization

The GreptimeDB OTEL endpoint supports Basic authentication. For details, please refer to the [authentication](/user-guide/protocols/http.md#authentication) documentation.

### GreptimeDB Pipeline

The HTTP header `x-greptime-pipeline-name` is required for ingesting trace
data. Here we reuse the Pipeline concept of GreptimeDB for data
transformation. Use the built-in `greptime_trace_v2` pipeline for JSON2
attributes, or `greptime_trace_v1` for flattened attribute columns. See
[Trace Data Modeling](./data-model.md) for model differences and table options.
Use a separate table when switching models.
No custom pipeline is allowed for the moment.

### Append-only Mode

By default, trace table created by OpenTelemetry API are in [append only
mode](/user-guide/deployments-administration/performance-tuning/design-table.md#when-to-use-append-only-tables).

## Query

To query the trace data, GreptimeDB has two types of API provided. The Jaeger
compatible API and GreptimeDB's original SQL based query interfaces, which is
available in HTTP, MySQL and Postgres protocols.

### Jaeger

We build Jaeger compatibility layer into GreptimeDB so you can reuse your Jaeger
frontend or any other integrations like Grafana's Jaeger data source.

For detail of Jaeger's endpoint and parameters, check [our Jaeger protocol
docs](/user-guide/query-data/jaeger.md).

### SQL

All data in GreptimeDB can be queried with SQL over HTTP, MySQL, or PostgreSQL.
By default, trace data is written into `opentelemetry_traces`, customizable via
the `x-greptime-trace-table-name` header.

#### greptime_trace_v2

OpenTelemetry attribute keys often contain dots. Quote the entire key to read
it as a literal JSON key rather than a nested path:

```sql
SELECT * FROM public.opentelemetry_traces LIMIT 10;

SELECT
    timestamp,
    trace_id,
    service_name,
    span_attributes."http.request.method"::STRING AS method,
    span_attributes."http.response.status_code"::BIGINT AS status,
    resource_attributes."service.name"::STRING AS resource_service
FROM public.opentelemetry_traces
WHERE span_attributes."http.response.status_code"::BIGINT >= 500
ORDER BY timestamp DESC
LIMIT 20;
```

For example, `span_attributes."http.request.method"` reads the key
`http.request.method`, while `span_attributes.http.request.method` reads nested
objects. The v1 form `"span_attributes.http.request.method"` names a flattened
table column and does not apply to v2. See [JSON2 query syntax](/user-guide/logs/json2.md#dot-syntax)
for more examples. Events and links continue to use the
[JSON functions](/reference/sql/functions/json.md).

#### greptime_trace_v1

For the `greptime_trace_v1` configuration above, attributes are flattened into
individual columns:

```sql
SELECT * FROM public.opentelemetry_traces_v1 \G
```

Example output:

```
*************************** 1. row ***************************
                         timestamp: 2025-05-07 10:03:29.657544
                     timestamp_end: 2025-05-07 10:03:29.661714
                     duration_nano: 4169970
                    parent_span_id: eccc18b6fc210f31
                          trace_id: fb60d19aa36fdcb7d14a71ca0b9b42ae
                           span_id: 49806a2671f2ddcb
                         span_kind: SPAN_KIND_SERVER
                         span_name: POST todos/
                  span_status_code: STATUS_CODE_UNSET
               span_status_message:
                       trace_state:
                        scope_name: opentelemetry.instrumentation.django
                     scope_version: 0.51b0
                      service_name: myproject
span_attributes.http.request.method: POST
             span_attributes.url.full:
                       span_events: []
                        span_links: []
...
```

We will cover more information about the table structure in [Data
Model](./data-model.md) section.
