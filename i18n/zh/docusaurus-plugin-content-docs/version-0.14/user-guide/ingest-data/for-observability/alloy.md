---
keywords: [Grafana Alloy, Prometheus Remote Write, OpenTelemetry, 数据管道]
description: 绍了如何将 GreptimeDB 配置为 Grafana Alloy 的数据接收端，包括 Prometheus Remote Write 和 OpenTelemetry 的配置示例。通过这些配置，你可以将 GreptimeDB 集成到可观测性数据管道中，实现对指标和日志的高效管理和分析。
---

# Grafana Alloy

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) 是一个用于 OpenTelemetry (OTel)、Prometheus、Pyroscope、Loki 等其他指标、日志、追踪和分析工具的可观测性数据管道。
你可以将 GreptimeDB 集成为 Alloy 的数据接收端。

## Prometheus Remote Write

将 GreptimeDB 配置为远程写入目标：

```hcl
prometheus.remote_write "greptimedb" {
  endpoint {
    url = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/prometheus/write?db=${GREPTIME_DB:=public}"

    basic_auth {
      username = "${GREPTIME_USERNAME}"
      password = "${GREPTIME_PASSWORD}"
    }
  }
}
```

- `GREPTIME_HOST`: GreptimeDB 主机地址，例如 `localhost`。
- `GREPTIME_DB`: GreptimeDB 数据库名称，默认是 `public`。
- `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments/authentication/static.md)。

有关从 Prometheus 到 GreptimeDB 的数据模型转换的详细信息，请参阅 Prometheus Remote Write 指南中的[数据模型](/user-guide/ingest-data/for-observability/prometheus.md#数据模型)部分。

## OpenTelemetry

GreptimeDB 也可以配置为 OpenTelemetry Collector 的目标。

### 指标

```hcl
otelcol.exporter.otlphttp "greptimedb" {
  client {
  endpoint = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/otlp/"
  headers  = {
    "X-Greptime-DB-Name" = "${GREPTIME_DB:=public}",
  }
  auth     = otelcol.auth.basic.credentials.handler
  }
}

otelcol.auth.basic "credentials" {
  username = "${GREPTIME_USERNAME}"
  password = "${GREPTIME_PASSWORD}"
}
```

- `GREPTIME_HOST`: GreptimeDB 主机地址，例如 `localhost`。
- `GREPTIME_DB`: GreptimeDB 数据库名称，默认是 `public`。
- `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments/authentication/static.md)。

有关从 OpenTelemetry 到 GreptimeDB 的指标数据模型转换的详细信息，请参阅 OpenTelemetry 指南中的[数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型)部分。

### 日志

以下示例设置了一个使用 Loki 和 OpenTelemetry Collector (otelcol) 的日志管道，将日志转发到 GreptimeDB：

```hcl
loki.source.file "greptime" {
  targets = [
  {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [otelcol.receiver.loki.greptime.receiver]
}

otelcol.receiver.loki "greptime" {
  output {
  logs = [otelcol.exporter.otlphttp.greptimedb_logs.input]
  }
}

otelcol.auth.basic "credentials" {
  username = "${GREPTIME_USERNAME}"
  password = "${GREPTIME_PASSWORD}"
}

otelcol.exporter.otlphttp "greptimedb_logs" {
  client {
  endpoint = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/otlp/"
  headers  = {
    "X-Greptime-DB-Name" = "${GREPTIME_DB:=public}",
    "X-Greptime-Log-Table-Name" = "${LOG_TABLE_NAME}",
    "X-Greptime-Log-Extract-Keys" = "${EXTRACT_KEYS}",
  }
  auth     = otelcol.auth.basic.credentials.handler
  }
}
```

- Loki source 配置
  - `loki.source.file "greptime"` 块定义了 source，用于 Loki 从位于 `/tmp/foo.txt` 的文件中读取日志。
  - `forward_to` 数组指示从该文件读取的日志应转发到 `otelcol.receiver.loki.greptime.receiver`。
- OpenTelemetry Collector Receiver 配置：
  - `otelcol.receiver.loki "greptime"` 在 OpenTelemetry Collector 中设置了一个 receiver，以接收来自 Loki 的日志。
  - `output` 指定接收到的日志应转发到 `otelcol.exporter.otlphttp.greptimedb_logs.input`。
- OpenTelemetry Collector Exporter 配置：
  - `otelcol.exporter.otlphttp "greptimedb_logs"` 块配置了一个 HTTP Exporter，将日志发送到 GreptimeDB。
  - `GREPTIME_HOST`: GreptimeDB 主机地址，例如 `localhost`。
  - `GREPTIME_DB`: GreptimeDB 数据库名称，默认是 `public`。
  - `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments/authentication/static.md)。
  - `LOG_TABLE_NAME`: 存储日志的表名，默认表名为 `opentelemetry_logs`。
  - `EXTRACT_KEYS`: 从属性中提取对应 key 的值到表的顶级字段，用逗号分隔，例如 `filename,log.file.name,loki.attribute.labels`，详情请看 [HTTP API 文档](opentelemetry.md#otlphttp-api-1)。

有关从 OpenTelemetry 到 GreptimeDB 的日志数据模型转换的详细信息，请参阅 OpenTelemetry 指南中的[数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型-1)部分。

:::tip 提示
上述示例代码可能会过时，请参考 OpenTelemetry 和 Grafana Alloy 的官方文档以获取最新信息。
:::

有关示例代码的更多信息，请参阅你首选编程语言的官方文档。
