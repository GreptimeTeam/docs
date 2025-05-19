---
keywords: [OpenTelemetry, OTLP, 指标数据, 配置示例, GreptimeCloud]
description: 介绍如何通过 OpenTelemetry Protocol (OTLP) 将指标数据发送到 GreptimeCloud，包括使用 OpenTelemetry API/SDK 和 OpenTelemetry Collector 的配置示例。
---

# OpenTelemetry Protocol (OTLP)

你可以通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议原生消费 OpenTelemetry 指标。

### OpenTelemetry API/SDK

要通过 OpenTelemetry SDK 库将 OpenTelemetry 指标发送到 GreptimeDB，请使用以下信息：

- URL: `https://<host>/v1/otlp/v1/metrics`
- Headers:
  - `X-Greptime-DB-Name`: `<dbname>`
  - `Authorization`: `Basic` 认证，是 `<username>:<password>` 的 Base64 编码字符串。更多信息，请参阅 HTTP API 中的[认证](https://docs.greptime.cn/nightly/user-guide/protocols/http#鉴权)。

由于请求中使用二进制 protobuf 编码的 payload，因此需要使用支持 `HTTP/protobuf` 的包。例如，在 Node.js 中，可以使用 [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)；在 Go 中，可以使用 [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)；在 Java 中，可以使用 [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp)；在 Python 中，可以使用 [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)。

:::tip 注意
包名可能会被 OpenTelemetry 修改，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

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
