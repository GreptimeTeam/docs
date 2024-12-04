---
description: 介绍如何通过 OpenTelemetry Protocol (OTLP) 将指标数据发送到 GreptimeCloud，包括使用 OpenTelemetry API/SDK 和 OpenTelemetry Collector 的配置示例。
---

# OpenTelemetry Protocol (OTLP)

你可以通过 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议原生消费 OpenTelemetry 指标。

### OpenTelemetry API/SDK

要通过 OpenTelemetry SDK 库将 OpenTelemetry 指标发送到 GreptimeDB，请使用以下信息：

* URL: `https://<host>/v1/otlp/v1/metrics`
* Headers:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` 认证，是 `<username>:<password>` 的 Base64 编码字符串。更多信息，请参阅 HTTP API 中的[认证](https://docs.greptime.cn/nightly/user-guide/protocols/http#鉴权)。

由于请求中使用二进制 protobuf 编码的 payload，因此需要使用支持 `HTTP/protobuf` 的包。例如，在 Node.js 中，可以使用 [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)；在 Go 中，可以使用 [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)；在 Java 中，可以使用 [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp)；在 Python 中，可以使用 [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)。

:::tip 注意
包名可能会被 OpenTelemetry 修改，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

## OpenTelemetry Collector

如果你使用单独的 OTel 收集器，我们推荐更加成熟的 [Grafana
Alloy](https://grafana.com/docs/alloy/latest/)

一个简单输出到 GreptimeDB 的配置例子：

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
