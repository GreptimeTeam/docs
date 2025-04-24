---
keywords: [OpenTelemetry Collector, OpenTelemetry, traces, data pipeline]
description: 介绍如何使用 OpenTelemetry Collector 将 traces 数据写入到 GreptimeDB。
---

# OpenTelemetry Traces

## 概述

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 是一个厂商中立的用于收集和处理 OpenTelemetry 数据的服务。本文我们将介绍如何使用 OpenTelemetry Collector 将 traces 数据写入到 GreptimeDB。

## 快速开始

:::note
在启动 OpenTelemetry Collector 之前，请确保 GreptimeDB 已经启动并运行。
:::

### 启动 OpenTelemetry Collector

你可以使用如下命令来快速启动一个 OpenTelemetry Collector 实例，此时 collector 会监听 `4317`（gRPC） 和 `4318`（HTTP） 端口：

```shell
docker run --rm \
  --network host \
  -p 4317:4317 \
  -p 4318:4318 \
  -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml \
  otel/opentelemetry-collector-contrib:0.123.0
```

其中 `config.yaml` 文件内容如下：

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp:
    endpoint: "http://localhost:4000/v1/otlp" # GreptimeDB 的 OTLP 端点
    headers:
      x-greptime-pipeline-name: "greptime_trace_v1"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

### 将 traces 数据写入到 OpenTelemetry Collector

你可以给应用配置相应的 exporter 来将 traces 数据写入到 OpenTelemetry Collector。比如你可以使用环境变量 `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` 来配置 exporter 的 endpoint：

```shell
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/otlp"
```

此处为了方便，我们可使用工具 [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) 来快速生成 traces 数据并写入到 OpenTelemetry Collector 中，更多细节可参考 [OpenTelemetry Collector 官方文档](https://opentelemetry.io/docs/collector/quick-start/)。

我们可以用如下命令安装 `telemetrygen`（请确保你已经安装了 Go）：

```shell
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

然后我们就可以使用如下命令来生成 traces 数据并写入到 OpenTelemetry Collector 中：

```shell
telemetrygen traces --otlp-insecure --traces 3
```

上面这条命令将生成 3 条 traces 数据，并通过 gRPC 协议写入到 OpenTelemetry Collector 中。

### 在 GreptimeDB 中查询 traces 数据

GreptimeDB 默认会将 traces 数据写入到 public 数据库中的 `opentelemetry_traces` 表中，你可以在 GreptimeDB 中执行如下 SQL 语句来查询 traces 数据：

```sql
SELECT * FROM public.opentelemetry_traces \G;
```

然后你就可以得到如下结果（仅展示部分结果）：

```
*************************** 1. row ***************************
                         timestamp: 2025-04-02 09:58:43.822229
                     timestamp_end: 2025-04-02 09:58:43.822352
                     duration_nano: 123000
                    parent_span_id: NULL
                          trace_id: 1948380e459f4ca69bb4f4274b5db7ba
                           span_id: f179c8dc2171a0a0
                         span_kind: SPAN_KIND_CLIENT
                         span_name: lets-go
                  span_status_code: STATUS_CODE_UNSET
               span_status_message:
                       trace_state:
                        scope_name: telemetrygen
                     scope_version:
                      service_name: telemetrygen
span_attributes.net.sock.peer.addr: 1.2.3.4
      span_attributes.peer.service: telemetrygen-server
                       span_events: []
                        span_links: []
...
```

你也可以使用 [Jaeger](https://www.jaegertracing.io/) 查询界面来查询 traces 数据。更多细节请参考 [Jaeger 文档](/user-guide/query-data/jaeger.md)。

## Append 模式

通过此接口创建的表，默认为[Append 模式](/user-guide/administration/design-table.md#何时使用-append-only-表).
