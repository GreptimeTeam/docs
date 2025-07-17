---
keywords: [OpenTelemetry, observability backend, OTLP, API configuration, SDK setup]
description: Guide for using GreptimeDB as an observability backend with OpenTelemetry, including API/SDK configuration and OpenTelemetry Collector setup.
---

# OpenTelemetry

GreptimeDB serves as an observability backend that natively consumes OpenTelemetry Metrics, Logs and Traces
via the [OTLP](https://opentelemetry.io/docs/specs/otlp/) protocol.

Please use the following endpoint and include the required headers:

- URL: `https://<host>/v1/otlp/`
- Protocol: `HTTP/protobuf`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authentication`: `<authentication>`, For more information, please refer to [Authentication](https://docs.greptime.com/user-guide/protocols/http#authentication) in HTTP API.

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

## References

For more information on using GreptimeDB with OpenTelemetry,
please refer to the [OpenTelemetry Protocol documentation](https://docs.greptime.com/user-guide/ingest-data/for-observability/opentelemetry/) in the GreptimeDB user guide.

