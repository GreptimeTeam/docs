---
keywords: [Fluent Bit, GreptimeCloud, 指标写入, 日志写入, 数据管道]
description: 使用 Fluent Bit 和 GreptimeCloud 的指南，包括指标和日志写入的配置，以及运行 Fluent Bit 的示例配置。
---

# Fluent Bit

Fluent Bit 是一个轻量且快速的日志处理和转发器，可以收集、解析、过滤和转发日志和指标。Fluent Bit 是 Fluentd 项目生态系统的一部分，用 C 语言编写。它设计为内存高效且性能优越，适合在资源受限的环境中使用。

## HTTP

Fluent Bit 可以配置为使用 HTTP 协议将日志发送到 GreptimeCloud。这允许您从各种来源收集日志并将其发送到 GreptimeCloud 进行存储、分析和可视化。

```
[OUTPUT]
    Name             http
    Match            *
    Host             <host>
    Port             443
    Uri              /v1/ingest?db=<dbname>&table=<table_name>&pipeline_name=<pipeline_name>
    Format           json
    Json_date_key    scrape_timestamp
    Json_date_format iso8601
    Tls              On
    compress         gzip
    http_User        <username>
    http_Passwd      <password>
```

在此示例中，使用 `http` 输出插件将日志发送到 GreptimeCloud。有关更多信息和额外选项，请参阅 [Logs HTTP API](https://docs.greptime.cn/reference/pipeline/write-log-api.md#http-api) 指南。

## Prometheus Remote Write

Fluent Bit 可以配置为使用 Prometheus Remote Write 协议将指标发送到 GreptimeCloud。这允许您从各种来源收集指标并将其发送到 GreptimeCloud 进行存储、分析和可视化。

```
[OUTPUT]
    Name                 prometheus_remote_write
    Match                internal_metrics
    Host                 <host>
    Port                 443
    Uri                  /v1/prometheus/write?db=<dbname>
    Tls                  On
    http_user            <username>
    http_passwd          <password>
```

在此示例中，使用 `prometheus_remote_write` 输出插件将指标发送到 GreptimeCloud。有关更多信息和额外选项，请参阅 [Prometheus Remote Write](https://docs.greptime.cn/user-guide/ingest-data/for-observability/prometheus) 指南。

## OpenTelemetry

Fluent Bit 可以配置为使用 OpenTelemetry 协议将日志和指标发送到 GreptimeCloud。这允许您从各种来源收集日志和指标并将其发送到 GreptimeCloud 进行存储、分析和可视化。

```
# 仅用于指标
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_metrics
    Match                *_metrics
    Host                 <host>
    Port                 443
    Metrics_uri          /v1/otlp/v1/metrics
    Logs_uri             /v1/otlp/v1/logs
    Traces_uri           /v1/otlp/v1/traces
    http_User            <username>
    http_Passwd          <password>
    Log_response_payload True
    Tls                  On
    compress             gzip

# 仅用于日志
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_logs
    Match                *_logs
    Host                 <host>
    Port                 443
    Metrics_uri          /v1/otlp/v1/metrics
    Logs_uri             /v1/otlp/v1/logs
    Traces_uri           /v1/otlp/v1/traces
    http_User            <username>
    http_Passwd          <password>
    Log_response_payload True
    Tls                  On
    compress             gzip
    Header X-Greptime-Log-Table-Name "<log_table_name>"
    Header X-Greptime-Log-Pipeline-Name "<pipeline_name>"
    Header X-Greptime-DB-Name "<dbname>"
```

在此示例中，使用 [OpenTelemetry OTLP/HTTP API](https://docs.greptime.cn/user-guide/ingest-data/for-observability/opentelemetry/) 接口。有关更多信息和额外选项，请参阅 [OpenTelemetry](https://docs.greptime.cn/user-guide/ingest-data/for-observability/opentelemetry/) 指南。