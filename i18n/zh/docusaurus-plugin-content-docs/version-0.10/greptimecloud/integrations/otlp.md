# OpenTelemetry Protocol(OTLP)

GreptimeDB is an observability backend to consume OpenTelemetry Metrics natively via [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) protocol.

### OpenTelemetry API/SDK

To send OpenTelemetry Metrics to GreptimeDB through OpenTelemetry SDK libraries, use the following information:

* URL: `https://<host>/v1/otlp/v1/metrics`
* Headers:
  * `X-Greptime-DB-Name`: `<dbname>`
  * `Authorization`: `Basic` authentication, which is a Base64 encoded string of `<username>:<password>`. For more information, please refer to [Authentication](https://docs.greptime.com/nightly/user-guide/deployments/authentication) and [HTTP API](https://docs.greptime.com/nightly/user-guide/protocols/http#authentication)

The request uses binary protobuf to encode the payload, so you need to use packages that support `HTTP/protobuf`. For example, in Node.js, you can use [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto); in Go, you can use [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp); in Java, you can use [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp); and in Python, you can use [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/).

:::tip NOTE
The package names may change according to OpenTelemetry, so we recommend that you refer to the official OpenTelemetry documentation for the most up-to-date information.
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
