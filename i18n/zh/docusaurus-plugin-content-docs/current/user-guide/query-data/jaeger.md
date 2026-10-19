---
keywords: [Jaeger, traces, query, experimental, HTTP endpoint]
description: 介绍如何使用 Jaeger 查询 GreptimeDB 中的 traces 数据。
---

# Jaeger 查询（实验功能）

:::warning

Jaeger 查询接口目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

GreptimeDB 在 `/v1/jaeger` 下提供 [Jaeger](https://www.jaegertracing.io/) HTTP 查询接口。以下旧版接口继续可用：

- `/api/services`: 获取所有 Service。
- `/api/operations?service={service}`: 获取指定 Service 的所有 Operations。
- `/api/services/{service}/operations`: 获取指定 Service 的所有 Operations。
- `/api/traces`: 根据查询参数获取 traces 数据。
- `/api/traces/{trace_id}`: 根据 trace ID 获取 trace 数据。

## Jaeger UI v2

Jaeger UI v2 使用的 HTTP API v3 路径同样位于 `/v1/jaeger` 下。将 UI 的 `/api` 请求代理到 `http://localhost:4000/v1/jaeger/api`，并保留后续路径和查询参数。

| 方法与路径 | 行为 |
| --- | --- |
| `GET /api/v3/services` | 返回 `services` 列表。 |
| `GET /api/v3/operations?service={service}` | 返回 `operations` 列表，包含 `name` 和 `spanKind`。`service` 必填，可用 `spanKind` 过滤。 |
| `GET /api/v3/traces/{trace_id}` | 按 ID 返回 Trace，`result` 中包含 OTLP JSON 数据。 |
| `GET /api/v3/traces` | 按条件搜索 Trace，`result` 中包含 OTLP JSON 数据。 |
| `GET /api/v3/trace-summaries` | 按相同条件搜索并返回 `summaries`，包含根 Span 的服务名和操作名、Span 数量及各服务统计。 |

### 搜索参数

`/api/v3/traces` 和 `/api/v3/trace-summaries` 接受以下查询参数：

| 参数 | 取值与行为 |
| --- | --- |
| `query.startTimeMin` | 必填，RFC 3339 时间戳，搜索窗口的起点（包含）。 |
| `query.startTimeMax` | 必填，RFC 3339 时间戳，搜索窗口的终点（不包含），必须晚于起点。 |
| `query.serviceName` | 可选，按服务名称过滤。 |
| `query.operationName` | 可选，按操作名称过滤。 |
| `query.durationMin`、`query.durationMax` | 可选，非负时长，例如 `1.5ms`、`2s`、`1h2m`。最小值不得大于最大值。 |
| `query.searchDepth` | 可选，返回的 Trace 数量上限。省略或为 `0` 时使用 `100`，有效范围为 `0`–`10000`，超出范围返回错误。 |
| `query.attributes` | 可选，JSON 对象，键和值均为字符串，例如 `{"http.method":"GET"}`。可解析为数字或布尔值的字符串按对应类型过滤。 |

参数也接受 snake_case 写法，例如 `query.start_time_min`。`query.num_traces` 是 `query.searchDepth` 的别名。

```shell
curl -G 'http://localhost:4000/v1/jaeger/api/v3/traces' \
  --data-urlencode 'query.serviceName=checkout' \
  --data-urlencode 'query.startTimeMin=2026-10-01T00:00:00Z' \
  --data-urlencode 'query.startTimeMax=2026-10-02T00:00:00Z' \
  --data-urlencode 'query.searchDepth=20'
```

示例查询 `checkout` 服务在指定窗口内匹配的 Trace；按实际数据修改服务名和时间范围。过滤条件用于选择 Trace ID，响应返回所选 Trace 的全部已存储 Span，包括搜索窗口之外的 Span。

按 ID 查询时，`trace_id` 接受 16 或 32 位十六进制字符串。可选的 `startTime` 和 `endTime` 使用 RFC 3339 格式，只作为查找提示进行校验，不裁剪返回的 Span。

无效参数返回 `400`。Trace 搜索或按 ID 查询没有结果时返回 `404`；服务、操作和摘要查询没有结果时返回空列表。错误响应格式如下：

```json
{"error":{"httpCode":404,"message":"No traces found"}}
```

不支持 `query.filter`，传入时返回 `400`。接口不执行时钟偏移校正，`rawTraces` 不改变这一行为；不提供 Jaeger gRPC 查询接口。

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
