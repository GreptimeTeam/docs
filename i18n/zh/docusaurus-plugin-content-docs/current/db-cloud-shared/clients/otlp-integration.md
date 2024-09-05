GreptimeDB 通过原生支持 [OTLP/HTTP](https://opentelemetry.io/docs/specs/otlp/#otlphttp) 协议，可以作为后端存储服务来接收 OpenTelemetry 指标数据。

### API

使用下面的信息通过 Opentelemetry SDK 库发送 Metrics 到 GreptimeDB：

* URL: `https://<host>/v1/otlp/v1/metrics`
* Headers:
  * `X-Greptime-DB-Name`: `<dbname>`
* `Authorization`: `Basic` 认证，是 `<username>:<password>` 的 Base64 编码字符串。更多信息请参考 [鉴权](https://docs.greptime.cn/user-guide/operations/authentication) 和 [HTTP API](https://docs.greptime.cn/user-guide/protocols/http#authentication)。

请求中使用 binary protobuf 编码 payload，因此你需要使用支持 `HTTP/protobuf` 的包。例如，在 Node.js 中，可以使用 [`exporter-trace-otlp-proto`](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-proto)；在 Go 中，可以使用 [`go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp`](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp)；在 Java 中，可以使用 [`io.opentelemetry:opentelemetry-exporter-otlp`](https://mvnrepository.com/artifact/io.opentelemetry/opentelemetry-exporter-otlp)；在 Python 中，可以使用 [`opentelemetry-exporter-otlp-proto-http`](https://pypi.org/project/opentelemetry-exporter-otlp-proto-http/)。

:::tip 注意
包名可能会根据 OpenTelemetry 的发展发生变化，因此建议你参考 OpenTelemetry 官方文档以获取最新信息。
:::

请参考 Opentelementry 的官方文档获取它所支持的编程语言的更多信息。
