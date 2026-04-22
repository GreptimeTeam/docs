---
keywords: [Grafana Alloy, Prometheus Remote Write, OpenTelemetry, 数据管道]
description: 介绍了如何将 GreptimeDB 配置为 Grafana Alloy 的数据接收端，包括 Prometheus Remote Write 和 OpenTelemetry 的配置示例。通过这些配置，你可以将 GreptimeDB 集成到可观测性数据管道中，实现对指标和日志的高效管理和分析。
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
- `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments-administration/authentication/static.md)。

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
- `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments-administration/authentication/static.md)。

有关从 OpenTelemetry 到 GreptimeDB 的指标数据模型转换的详细信息，请参阅 OpenTelemetry 指南中的[数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型)部分。

### 日志

此示例通过 OpenTelemetry 管道将日志发送到 GreptimeDB。
对于生产环境中的日志管道，建议在 exporter 之前显式添加一个 batch processor。详情请参阅[批处理](#批处理)部分。

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [otelcol.receiver.loki.greptime.receiver]
}

otelcol.receiver.loki "greptime" {
  output {
    logs = [otelcol.processor.batch.greptimedb_logs.input]
  }
}

otelcol.processor.batch "greptimedb_logs" {
  send_batch_size     = 5000
  send_batch_max_size = 10000
  timeout             = "1s"

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
    headers = {
      "X-Greptime-DB-Name"          = "${GREPTIME_DB:=public}",
      "X-Greptime-Log-Table-Name"   = "${GREPTIME_LOG_TABLE_NAME:=demo_logs}",
      "X-Greptime-Log-Extract-Keys" = "filename,log.file.name,loki.attribute.labels",
    }
    auth = otelcol.auth.basic.credentials.handler
  }

  sending_queue {
    queue_size    = 10000
    num_consumers = 10
  }
}
```

- `GREPTIME_HOST`: GreptimeDB 主机地址，例如 `localhost`。
- `GREPTIME_DB`: GreptimeDB 数据库名称，默认是 `public`。
- `GREPTIME_LOG_TABLE_NAME`: 目标日志表名，默认为 `demo_logs`。
- `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments-administration/authentication/static.md)。
- `X-Greptime-Log-Extract-Keys`: 从 OTLP 日志属性中提取的键。详情请参阅 [OTLP/HTTP API 文档](/user-guide/ingest-data/for-observability/opentelemetry.md#otlphttp-api-1)。

有关从 OpenTelemetry 到 GreptimeDB 的日志数据模型转换的详细信息，请参阅 OpenTelemetry 指南中的[数据模型](/user-guide/ingest-data/for-observability/opentelemetry.md#数据模型-1)部分。

## Loki

GreptimeDB 也支持通过 Loki Push 协议写入日志。
如果你的 Alloy 日志管道本身就是基于 Loki 组件构建的，建议优先使用原生的 Loki 写入路径。
关于 Loki 协议的详细说明和数据模型映射，请参阅 [Loki 指南](/user-guide/ingest-data/for-observability/loki.md)。

### 日志

此示例仅使用 Loki 组件读取、处理并通过 Loki Push API 将日志发送到 GreptimeDB：

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [loki.process.greptime.receiver]
}

loki.process "greptime" {
  forward_to = [loki.write.greptimedb.receiver]

  stage.static_labels {
    values = {
      job  = "greptime",
      from = "alloy",
    }
  }
}

loki.write "greptimedb" {
  endpoint {
    url = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "${GREPTIME_DB:=public}",
      "X-Greptime-Log-Table-Name" = "${GREPTIME_LOG_TABLE_NAME:=loki_demo_logs}",
    }

    basic_auth {
      username = "${GREPTIME_USERNAME}"
      password = "${GREPTIME_PASSWORD}"
    }
  }
}
```

- `GREPTIME_HOST`: GreptimeDB 主机地址，例如 `localhost`。
- `GREPTIME_DB`: GreptimeDB 数据库名称，默认是 `public`。
- `GREPTIME_LOG_TABLE_NAME`: 目标日志表名，默认为 `loki_demo_logs`。
- `GREPTIME_USERNAME` 和 `GREPTIME_PASSWORD`: GreptimeDB 的[鉴权认证信息](/user-guide/deployments-administration/authentication/static.md)。

该配置会读取 `/tmp/foo.txt`，添加两个静态标签，并通过 `loki.write` 将日志直接发送到 GreptimeDB。

## 批处理

`otelcol.exporter.otlphttp` 默认不会启用批处理。
当 Alloy 读取突发日志时，例如文件或 Docker 容器中的大量历史积压日志，exporter 队列可能会在记录被充分聚合前就被塞满，从而导致 `sending queue is full` 这类错误。

根据生产环境中的测试反馈，仅启用 exporter 内部的 `sending_queue.batch` 配置，对于突发型日志负载仍然可能不够。
在 exporter 前增加 `otelcol.processor.batch` 通常是更可靠的做法，因为这样 exporter 接收到的是较大的批次，而不是大量单条日志记录。

如果你通过 OTLP/HTTP 写入日志，建议按以下顺序组织管道：

1. `loki.source.*`
2. `otelcol.receiver.loki`
3. `otelcol.processor.batch`
4. `otelcol.exporter.otlphttp`

如果你的管道已经是原生 Loki 方案，且不需要 OpenTelemetry 处理链路，建议优先使用 `loki.write` 和 Loki Push 协议。

:::tip 提示
有关 `loki.write`、`otelcol.processor.batch` 和 `otelcol.exporter.otlphttp` 的最新组件行为和调优建议，请参考 Grafana Alloy 官方文档。
:::
