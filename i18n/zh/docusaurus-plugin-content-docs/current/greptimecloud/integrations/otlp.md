---
keywords: [OpenTelemetry, OTLP, 指标数据, 配置示例, GreptimeCloud]
description: 介绍如何通过 OpenTelemetry Protocol (OTLP) 将指标数据发送到 GreptimeCloud，包括使用 OpenTelemetry API/SDK 和 OpenTelemetry Collector 的配置示例。
---

# OpenTelemetry Protocol (OTLP)

你可以通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议原生消费 OpenTelemetry 指标。

## OpenTelemetry Collector

OpenTelemetry Collector 是 OpenTelemetry 的一个与厂商无关的实现，下面是一个导出到 GreptimeDB 的示例配置。你可以使用 [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 将指标、日志和追踪数据发送到 GreptimeDB。

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

如果你更倾向于使用 [Grafana Alloy](https://grafana.com/docs/alloy/latest/) 的 OpenTelemetry 导出器，可以使用如下配置来发送你的数据。

一个简单的配置示例如下：

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
