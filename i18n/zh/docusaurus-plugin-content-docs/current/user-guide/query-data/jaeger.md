---
keywords: [Jaeger, traces, query, experimental, HTTP endpoint]
description: 介绍如何使用 Jaeger 查询 GreptimeDB 中的 traces 数据。
---

# Jaeger 查询（实验功能）

:::warning

Jaeger 查询接口目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

GreptimeDB 提供 [Jaeger](https://www.jaegertracing.io/) HTTP 查询接口，路径前缀为 `/v1/jaeger`。原有接口包括：

- `/api/services`: 获取所有 Service。
- `/api/operations?service={service}`: 获取指定 Service 的所有 Operations。
- `/api/services/{service}/operations`: 获取指定 Service 的所有 Operations。
- `/api/traces`: 根据查询参数获取 traces 数据。
- `/api/traces/{trace_id}`: 根据 trace ID 获取 trace 数据。

可以使用 Grafana 的 [Jaeger 插件](https://grafana.com/docs/grafana/latest/datasources/jaeger/)（推荐）或者 [Jaeger UI](https://github.com/jaegertracing/jaeger-ui) 查询 GreptimeDB 中的 traces 数据。

## Jaeger UI v2

GreptimeDB 支持 Jaeger UI v2 使用的 HTTP API v3。配置代理时，将 `/api/...` 请求转发到 `http://localhost:4000/v1/jaeger/api/...`，保留查询参数。

Jaeger UI 的代理配置示例（`packages/jaeger-ui/vite.config.mts`）：

```ts
const proxyConfig = {
  target: 'http://localhost:4000/v1/jaeger',
  secure: false,
  changeOrigin: true,
  ws: true,
  xfwd: true,
};
```

| 请求 | 说明 |
| --- | --- |
| `GET /api/v3/services` | 返回服务列表，字段名为 `services`。 |
| `GET /api/v3/operations?service={service}` | 查询指定服务的操作列表。`service` 必填，`spanKind` 可选。响应中的 `operations` 包含 `name` 和 `spanKind`。 |
| `GET /api/v3/traces/{trace_id}` | 按 ID 查询 Trace。`result` 字段中的数据采用 OTLP JSON 格式。 |
| `GET /api/v3/traces` | 搜索 Trace。`result` 字段中的数据采用 OTLP JSON 格式。 |
| `GET /api/v3/trace-summaries` | 使用与 Trace 搜索相同的参数，返回 `summaries`。摘要包含根 Span 的服务名和操作名、Span 总数，以及各服务的统计信息。 |

### 搜索参数

`/api/v3/traces` 和 `/api/v3/trace-summaries` 接受以下查询参数：

| 参数 | 说明 |
| --- | --- |
| `query.startTimeMin` | 必填，RFC 3339 时间戳。查询起始时间，包含该时刻。 |
| `query.startTimeMax` | 必填，RFC 3339 时间戳。查询结束时间，不包含该时刻，必须晚于起始时间。 |
| `query.serviceName` | 可选，按服务名称过滤。 |
| `query.operationName` | 可选，按操作名称过滤。 |
| `query.durationMin`、`query.durationMax` | 可选，Span 耗时的上下限，不能为负数，例如 `1.5ms`、`2s`、`1h2m`。下限不能大于上限。 |
| `query.searchDepth` | 可选，返回的 Trace 数量上限，取值范围为 `0`–`10000`。省略或设为 `0` 时使用 `100`；超出范围返回错误。 |
| `query.attributes` | 可选，按属性过滤。使用键和值均为字符串的 JSON 对象，例如 `{"http.method":"GET"}`。如果值能解析为数字或布尔值，则按解析后的类型匹配。 |

参数也接受 snake_case 写法，例如 `query.start_time_min`。`query.num_traces` 是 `query.searchDepth` 的别名。

```shell
curl -G 'http://localhost:4000/v1/jaeger/api/v3/traces' \
  --data-urlencode 'query.serviceName=checkout' \
  --data-urlencode 'query.startTimeMin=2026-10-01T00:00:00Z' \
  --data-urlencode 'query.startTimeMax=2026-10-02T00:00:00Z' \
  --data-urlencode 'query.searchDepth=20'
```

示例查询 `checkout` 服务在指定时间范围内的 Trace。使用时需替换服务名和时间范围。对于匹配的 Trace，响应包含其全部已存储 Span，也包括查询时间范围之外的 Span。

按 ID 查询时，`trace_id` 必须是 16 或 32 位十六进制字符串。可选参数 `startTime` 和 `endTime` 使用 RFC 3339 格式；GreptimeDB 会校验这些参数，但不会据此过滤返回的 Span。

参数有误时返回 `400`。Trace 搜索和按 ID 查询在没有结果时返回 `404`；服务列表、操作列表和 Trace 摘要查询则返回空列表。错误响应示例：

```json
{"error":{"httpCode":404,"message":"No traces found"}}
```

GreptimeDB 的 Jaeger 接口有以下限制：

- 不支持 `query.filter`，传入该参数会返回 `400`。
- 不支持时钟偏移校正，`rawTraces` 参数会被忽略。
- 不支持 Jaeger gRPC 查询。

## 快速开始

我们将以 Grafana 中使用 Jaeger 插件为例，介绍如何查询 GreptimeDB 中的 traces 数据。在开始之前，请确保你已经正常启动了 GreptimeDB。

### 启动应用生成 traces 数据并写入 GreptimeDB

你可以参考 [OpenTelemetry 官方文档](https://opentelemetry.io/docs/languages/) 来选择任意你熟悉的编程语言来生成 traces 并将其写入到 GreptimeDB 中。你也可以参考[配置 OpenTelemetry Collector](/user-guide/traces/read-write.md#opentelemetry-collector) 文档。

### 配置 Jaeger 插件

1. 打开 Grafana，添加 Jaeger 数据源：

   ![添加 Jaeger 数据源](/add-jaeger-data-source.jpg)

2. 根据实际情况，填写 Jaeger 地址，然后 **Save and Test** 即可。比如：

   ```
   http://localhost:4000/v1/jaeger
   ```

3. 使用 Jaeger Explore 来查看数据：

   ![Jaeger Explore](/jaeger-explore.png)

### 自定义数据表

GreptimeDB 的 Jaeger 兼容接口默认使用 `opentelemetry_traces` 表作为其数据源。如
果用户使用了其他表，可以通过 HTTP 头 `x-greptime-trace-table-name` 进行设置。

Grafana 用户可以在数据源的配置界面进行设置。
