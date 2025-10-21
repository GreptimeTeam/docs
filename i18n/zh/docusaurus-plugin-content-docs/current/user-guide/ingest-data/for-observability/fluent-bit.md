---
keywords: [Fluent bit, Prometheus Remote Write, OpenTelemetry, 数据管道]
description: 将 GreptimeDB 与 Fluent bit 集成以实现 Prometheus Remote Write 和 OpenTelemetry 的说明。
---

# Fluent Bit

[Fluent Bit](http://fluentbit.io/) 是一个快速且轻量级的遥测代理，用于 Linux、macOS、Windows 和 BSD 系列操作系统的日志、指标和跟踪。Fluent Bit 专注于性能，允许从不同来源收集和处理遥测数据而不增加复杂性。

你可以将 Fluent Bit 数据转发到 GreptimeDB。本文档介绍如何配置 Fluent Bit 以将日志、指标和跟踪发送到 GreptimeDB。

## Http

使用 Fluent Bit 的 [HTTP 输出插件](https://docs.fluentbit.io/manual/pipeline/outputs/http)，您可以将日志发送到 GreptimeDB。Http 接口目前支持日志的写入。

```
[OUTPUT]
    Name             http
    Match            *
    Host             greptimedb
    Port             4000
    Uri              /v1/ingest?db=public&table=your_table&pipeline_name=pipeline_if_any
    Format           json
    Json_date_key    scrape_timestamp
    Json_date_format iso8601
    compress         gzip
    http_User        <username>
    http_Passwd      <password>
```

- `uri`: **发送日志的端点。**
- `format`: 日志的格式，需要是 `json`。
- `json_date_key`: JSON 对象中包含时间戳的键。
- `json_date_format`: 时间戳的格式。
- `compress`: 使用的压缩方法，例如 `gzip`。
- `header`: 发送请求时的头部信息，例如用于认证的 `Authorization`。如果没有，不要增加 Authorization 头部。
- `http_user` 和 `http_passwd`: GreptimeDB 的 [认证凭据](/user-guide/deployments-administration/authentication/static.md)。

在 `uri` 参数中：

- `db` 是您要写入日志的数据库名称。
- `table` 是您要写入日志的表名称。
- `pipeline_name` 是您要用于处理日志的管道名称。

本示例中，使用的是 [Logs Http API](/reference/pipeline/write-log-api.md#http-api) 接口。如需更多信息，请参阅 [写入日志](/user-guide/logs/use-custom-pipelines.md#使用-pipeline-写入日志) 文档。

## OpenTelemetry

GreptimeDB 也可以配置为 OpenTelemetry 收集器。使用 Fluent Bit 的 [OpenTelemetry 输出插件](https://docs.fluentbit.io/manual/pipeline/outputs/opentelemetry)，您可以将指标、日志和跟踪发送到 GreptimeDB。

```
[OUTPUT]
    Name                 opentelemetry
    Match                *
    Host                 127.0.0.1
    Port                 4000
    Metrics_uri          /v1/otlp/v1/metrics
    Logs_uri             /v1/otlp/v1/logs
    Traces_uri           /v1/otlp/v1/traces
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off
```

- `Metrics_uri`, `Logs_uri`, 和 `Traces_uri`: 发送指标、日志和跟踪的端点。

我们建议不要在一个 output 同时写入 metrics log 和 trace，因为我们的写入接口它们各自有一些特殊的 header 选项用于指定一些参数，我们建议一个为 metrics log 和 trace 单独创建一个 opentelemetry output 例如：

```
# Only for metrics
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_metrics
    Match                *
    Host                 127.0.0.1
    Port                 4000
    Metrics_uri          /v1/otlp/v1/metrics
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off

# Only for logs
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_logs
    Match                *
    Host                 127.0.0.1
    Port                 4000
    Logs_uri             /v1/otlp/v1/logs
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off
    Header X-Greptime-Log-Table-Name "<log_table_name>"
    Header X-Greptime-Log-Pipeline-Name "<pipeline_name>"
    Header X-Greptime-DB-Name "<dbname>"
```

本示例中，使用的是 [OpenTelemetry OTLP/HTTP API](/user-guide/ingest-data/for-observability/opentelemetry.md#opentelemetry-collectors) 接口。如需更多信息，请参阅 [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md) 文档。

## Prometheus Remote Write

将 GreptimeDB 配置为远程写入目标：

```
[OUTPUT]
    Name                 prometheus_remote_write
    Match                internal_metrics
    Host                 127.0.0.1
    Port                 4000
    Uri                  /v1/prometheus/write?db=<dbname>
    Tls                  Off
    http_user            <username>
    http_passwd          <password>
```

- `Uri`: 发送指标的端点。
- `http_user` 和 `http_passwd`: GreptimeDB 的 [认证凭据](/user-guide/deployments-administration/authentication/static.md)。

在 `Uri` 参数中：

- `db` 是您要写入指标的数据库名称。

有关从 Prometheus 到 GreptimeDB 的数据模型转换的详细信息，请参阅 Prometheus Remote Write 指南中的[数据模型](/user-guide/ingest-data/for-observability/prometheus.md#data-model)部分。
