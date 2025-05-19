# OTel Collector

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 提供了一种与供应商无关的 OTEL 实现，用于接收、处理和导出可观测数据。它可以作为数据的中间层，将数据从不同的源发送到 GreptimeDB。
以下是使用 OpenTelemetry Collector 将数据发送到 GreptimeDB 的配置示例。

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

在上面的配置中，我们定义了一个接收器 `otlp`，它可以接收来自 OpenTelemetry 的数据。我们还定义了三个导出器 `otlphttp/traces`、`otlphttp/logs` 和 `otlphttp/metrics`，它们将数据发送到 GreptimeDB 的 OTLP 路径。

在 otlphttp 协议的基础上，我们增加了一些 header 用来指定一些参数，比如 `x-greptime-pipeline-name` 和 `x-greptime-log-table-name`:
* `x-greptime-pipeline-name` 用来指定要使用的 pipeline 名称
* `x-greptime-log-table-name` 用来指定数据将要写入 GreptimeDB 的表名。

如果你在 GreptimeDB 设置了[鉴权](/user-guide/deployments/authentication/overview.md)。则需要使用 `basicauth/client` 扩展来处理基本的身份验证。

这里我们强烈建议使用不同的导出器来分别处理 traces、logs 和 metrics 数据，一方面是因为 GreptimeDB 会支持一些特定的 header 来自定义一些处理流程，另一方面也可以做好数据隔离。

关于 OpenTelemetry 协议的更多信息，请阅读[文档](/user-guide/ingest-data/for-observability/opentelemetry.md)。