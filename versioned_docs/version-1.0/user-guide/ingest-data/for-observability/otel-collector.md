---
keywords: [OpenTelemetry, OTLP, metrics, logs, traces, integration, 'otel-collector']
description: Instructions for integrating OpenTelemetry Collector with GreptimeDB.
---

# OTel Collector

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) offers a vendor-agnostic implementation of how to receive, process and export telemetry data. It can act as an intermediate layer to send data from different sources to GreptimeDB.
Below is a sample configuration for sending data to GreptimeDB using OpenTelemetry Collector.

```yaml
extensions:
  basicauth/client:
    client_auth:
      username: <your_username>
      password: <your_password>

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp/traces:
    endpoint: 'http://127.0.0.1:4000/v1/otlp'
    # auth:
    #   authenticator: basicauth/client
    headers:
      # x-greptime-db-name: '<your_db_name>'
      x-greptime-pipeline-name: 'greptime_trace_v1'
    tls:
      insecure: true
  otlphttp/logs:
    endpoint: 'http://127.0.0.1:4000/v1/otlp'
    # auth:
    #   authenticator: basicauth/client
    headers:
      # x-greptime-db-name: '<your_db_name>'
      # x-greptime-log-table-name: '<table_name>'
      # x-greptime-pipeline-name: '<pipeline_name>'
    tls:
      insecure: true

  otlphttp/metrics:
    endpoint: 'http://127.0.0.1:4000/v1/otlp'
    # auth:
    #   authenticator: basicauth/client
    headers:
      # x-greptime-db-name: '<your_db_name>'
    tls:
      insecure: true

service:
  # extensions: [basicauth/client]
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

In the above configuration, we define a receiver `otlp` that can receive data from OpenTelemetry. We also define three exporters: `otlphttp/traces`, `otlphttp/logs`, and `otlphttp/metrics`, which send data to the OTLP endpoint of GreptimeDB.

Based on the otlphttp protocol, we have added some headers to specify certain parameters, such as `x-greptime-pipeline-name` and `x-greptime-log-table-name`:
* The `x-greptime-pipeline-name` header is used to specify the pipeline name to use, and,
* the `x-greptime-log-table-name` header is used to specify the table name in GreptimeDB where the data will be written.

If you have enabled [authentication](/user-guide/deployments-administration/authentication/overview.md) in GreptimeDB, you need to use the `basicauth/client` extension to handle basic authentication.

Here, we strongly recommend using different exporters to handle traces, logs, and metrics separately. On one hand, GreptimeDB supports some specific headers to customize processing flows; on the other hand, this also helps with data isolation.

For more about OpenTelemetry protocols, please read the [doc](/user-guide/ingest-data/for-observability/opentelemetry.md).