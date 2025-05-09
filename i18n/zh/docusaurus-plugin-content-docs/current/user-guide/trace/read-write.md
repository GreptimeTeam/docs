---
keywords: [Trace, OpenTelemetry, Jaeger, Grafana]
description: 介绍 GreptimeDB 中的 Trace 的数据写入和查询。
---

# 写入与查询

:::warning

本章内容目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

本节我们将从 Trace 数据的写入和查询开始使用 GreptimeDB.

GreptimeDB 并未为 Trace 数据引入新的协议，而是尽可能使用以后的广泛接受的协议。

## 写入

GreptimeDB 使用 OpenTelemetry 的 OTLP/HTTP 协议作为主要的 Trace 数据写入协议。
Trace 也是 OpenTelemetry 中最广为接受的子协议，包含了良好的生态。

### OpenTelemetry SDK

如果你在应用中使用了 OpenTelemetry 的 SDK/API 库，你可以直接配置一个 OTLP/HTTP
的导出模块来将 trace 数据写入 GreptimeDB。

在我们的 [OpenTelemetry 协议文档
里](/user-guide/ingest-data/for-observability/opentelemetry.md) 介绍了关于这部分
接口的使用，包含相应的写入路径和配置项。

### OpenTelemetry Collector

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) 是一个厂商中
立的用于收集和处理 OpenTelemetry 数据的服务。本文我们将介绍如何使用
OpenTelemetry Collector 将 traces 数据写入到 GreptimeDB。

#### 启动 OpenTelemetry Collector

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
    endpoint: "http://greptimedb:4000/v1/otlp" # GreptimeDB 的 OTLP 路径
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

#### 将 traces 数据写入到 OpenTelemetry Collector

你可以给应用配置相应的 exporter 来将 traces 数据写入到 OpenTelemetry Collector。
比如你可以使用环境变量 `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` 来配置 exporter 的
endpoint：

```shell
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/otlp"
```

此处为了方便，我们可使用工具
[`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen)
来快速生成 traces 数据并写入到 OpenTelemetry Collector 中，更多细节可参考
[OpenTelemetry Collector 官方文
档](https://opentelemetry.io/docs/collector/quick-start/)。

我们可以用如下命令安装 `telemetrygen`（请确保你已经安装了 Go）：

```shell
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

然后我们就可以使用如下命令来生成 traces 数据并写入到 OpenTelemetry Collector 中：

```shell
telemetrygen traces --otlp-insecure --traces 3
```

上面这条命令将生成 3 条 traces 数据，并通过 gRPC 协议写入到 OpenTelemetry Collector 中。


### GreptimeDB Pipeline

在 OTLP 接口中，我们要求 HTTP 头 `x-greptime-pipeline-name` 作为必选参数。在这里
我们复用了日志接口中 Pipeline 的概念作为数据转化的机制。但是注意在 Trace 接口中
我们目前仅支持内置的 `greptime_trace_v1`，自定义的 Pipeline 暂不支持。

### Append 模式

通过此接口创建的表，默认为[Append 模
式](/user-guide/administration/design-table.md#何时使用-append-only-表).

## 查询

GreptimeDB 提供了两种 Trace 数据的查询接口，分别是 Jarger API 兼容接口和
GreptimeDB 原生的 SQL 查询接口，后者可以运行在 HTTP, MySQL 或者 Postgres 等协议
上。

### Jaeger

GreptimeDB 内置的 Jaeger 兼容层使得用户可以直接复用市面上的 Jaeger 生态工具，例
如 Grafana 的 Jaeger 数据源。

我们在 [Jaeger 协议文档](/user-guide/query-data/jaeger.md)里对此做了具体描述。

### SQL

Trace 数据也可以通过 SQL 查询。默认 Trace 数据会写入 `opentelemetry_traces` 表中，
这个表名也可以在写入时通过 `x-greptime-trace-table-name` 来指定。通过 SQL 查询：

```sql
SELECT * FROM public.opentelemetry_traces \G
```

输出的例子如下：

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

在下一节[数据模型](./data-model.md) 中我们会对这个表结构做详细介绍。
