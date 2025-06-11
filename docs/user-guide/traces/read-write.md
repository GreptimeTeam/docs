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

#### Start OpenTelemetry Collector

You can use the following command to quickly start an OpenTelemetry Collector
instance, which will listen on ports `4317` (gRPC) and `4318` (HTTP):

```shell
docker run --rm \
  --network host \
  -p 4317:4317 \
  -p 4318:4318 \
  -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml \
  otel/opentelemetry-collector-contrib:0.123.0
```

The content of the `config.yaml` file is as follows:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp:
    endpoint: "http://greptimedb:4000/v1/otlp" # Replace greptimedb with your setup
    headers:
      x-greptime-pipeline-name: "greptime_trace_v1"
      #authorization: "Basic <base64(username:password)>"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

#### Write traces data to OpenTelemetry Collector

You can configure the corresponding exporter to write traces data to the
OpenTelemetry Collector. For example, you can use the environment variable
`OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` to configure the endpoint of the exporter:

```shell
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/otlp"
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
transformation. However, note that we only support built-in `greptime_trace_v1`
as the pipeline for tracing. No custom pipeline is allowed for the moment.

### Append Only

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

All data in GreptimeDB is available for query using SQL, via MySQL and other
transport protocol.

By default, trace data is written into the table called
`opentelemetry_traces`. The table name is customizable via header
`x-greptime-trace-table-name`. You can run SQL queries against the table:

```sql
SELECT * FROM public.opentelemetry_traces \G
```

An example output is like

```
*************************** 1. row ***************************
                         timestamp: 2025-04-02 09:58:43.822229
                     timestamp_end: 2025-04-02 09:58:43.822352
                     duration_nano: 123000
                    parent_span_id: NULL
                          trace_id: 1948380e459f4ca69bb4f4274b5db7ba
                           span_id: f179c8dc2171a0a0
                         span_kind: SPAN_KIND_CLIENT
                         span_name: lets-go
                  span_status_code: STATUS_CODE_UNSET
               span_status_message:
                       trace_state:
                        scope_name: telemetrygen
                     scope_version:
                      service_name: telemetrygen
span_attributes.net.sock.peer.addr: 1.2.3.4
      span_attributes.peer.service: telemetrygen-server
                       span_events: []
                        span_links: []
...
```

We will cover more information about the table structure in [data
model](./data-model.md) section.
