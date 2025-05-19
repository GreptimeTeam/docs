---
keywords: [OpenTelemetry, observability backend, OTLP, API configuration, SDK setup]
description: Guide for using GreptimeDB as an observability backend with OpenTelemetry, including API/SDK configuration and OpenTelemetry Collector setup.
---

# OpenTelemetry

GreptimeDB is an observability backend to consume OpenTelemetry Metrics natively
via [OTLP](https://opentelemetry.io/docs/specs/otlp/) protocol. You can
configure GreptimeDB as an OpenTelemetery collector for your applications or
agents.

## OpenTelemetry API/SDK

To send OpenTelemetry Metrics to GreptimeDB through OpenTelemetry SDK libraries,
use the following information:

- URL: `https://<host>/v1/otlp/v1/metrics`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](https://docs.greptime.com/nightly/user-guide/protocols/http#authentication) in HTTP API.

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`. For example, in Node.js, you can use [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto); in Go, you can use [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp); in Java, you can use [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp); and in Python, you can use [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/).

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
:::

## OpenTelemetry Collector

OpenTelemetry Collector is a vendor-agnostic implementation of OpenTelemetry, below is a sample configuration for
exporting to GreptimeDB. You can use the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) to send metrics, logs, and traces to GreptimeDB.

```yaml
extensions:
  basicauth/client:
    client_auth:
      username: <username>
      password: <password>

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp/traces:
    endpoint: 'https://<host>/v1/otlp'
    auth:
      authenticator: basicauth/client
    headers:
      x-greptime-db-name: '<dbname>'
      x-greptime-pipeline-name: 'greptime_trace_v1'
  otlphttp/logs:
    endpoint: 'https://<host>/v1/otlp'
    auth:
      authenticator: basicauth/client
    headers:
      x-greptime-db-name: '<dbname>'
      # x-greptime-log-table-name: "<pipeline_name>"

  otlphttp/metrics:
    endpoint: 'https://<host>/v1/otlp'
    auth:
      authenticator: basicauth/client
    headers:
      x-greptime-db-name: '<dbname>'

service:
  extensions: [basicauth/client]
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp/traces]
    logs:
      receivers: [otlp]
      exporters: [otlphttp/logs]
    metrics:
      receivers: [otlp]
      exporters: [otlphttp/metrics]
```

## Grafana Alloy

If you prefer to use [Grafana Alloy](https://grafana.com/docs/alloy/latest/)'s OpenTelemetry exporter, you can use the following configuration to send your data.

A sample configuration for exporting to GreptimeDB:

```
otelcol.exporter.otlphttp "greptimedb" {
  client {
    endpoint = "https://<host>/v1/otlp/"
    headers  = {
      "X-Greptime-DB-Name" = "<dbname>",
    }
    auth     = otelcol.auth.basic.credentials.handler
  }
}

otelcol.auth.basic "credentials" {
  username = "<username>"
  password = "<password>"
}
```
