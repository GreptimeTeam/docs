---
keywords: [HTTP API, 管理 API, 健康检查, 状态, 指标, 配置, 仪表盘, 日志级别, 性能分析]
description: 介绍 GreptimeDB 中各种 HTTP 路径及其用法的完整列表。
---

# HTTP API 端点列表

GreptimeDB 提供两个 HTTP Server：

| Server | 默认地址 | 用途 |
|--------|---------|------|
| **主 HTTP Server** | `127.0.0.1:4000` | 内部/运维使用。提供所有路径，包括 `/health`、`/metrics`、`/config`、`/debug/*` 等管理端点，以及全部 `/v1` 和 `/dashboard` 路径。该端口应保持私有，仅对可信运维人员开放。 |
| **公共 HTTP API Server** | `127.0.0.1:4006` | 面向用户的访问。仅提供 `/v1` API 和 `/dashboard`，可安全地暴露给数据库终端用户。默认禁用；可在配置文件中设置 `http.enable_api_server = true` 来启用。 |

建议仅在内部/运维场景下使用主 HTTP Server 端口。或者也可以通过 HTTP 代理安全地暴露该端口，前提是限制直接访问，并且代理仅允许所需的协议。但是如需将 GreptimeDB 作为服务对外暴露给终端用户，我们更推荐启用专用公共 API Server，并仅对外暴露该端口。

```toml
[http]
# 主 HTTP Server — 保持内部访问
addr = "127.0.0.1:4000"

# 启用公共 API Server 并将其绑定到可外部访问的地址
enable_api_server = true
api_server_addr = "0.0.0.0:4006"
```

详见[配置文档](/user-guide/deployments-administration/configuration.md#协议选项)中的 `[http]` 选项。

以下是 GreptimeDB 中各种 HTTP 路径及其用法的完整列表：

## 管理 API

未版本化的端点（不在 `/v1` 下）。用于健康检查、状态、指标等管理用途。

:::note
管理 API 端点**仅**在主 HTTP Server（默认端口 `4000`）上可用。即使启用了 `http.enable_api_server`，专用公共 API Server 也不会暴露这些端点。
:::

### 健康检查

- **路径**: `/health`
- **方法**: `GET`, `POST`
- **描述**: 提供一个健康检查端点以验证服务器是否正在运行。
- **用法**: 访问此端点以检查服务器的健康状态。

请参考[检查 GreptimeDB 健康状态文档](/user-guide/deployments-administration/monitoring/check-db-status.md#check-if-greptimedb-is-running-normally)获取示例。

### 状态

- **路径**: `/status`
- **方法**: `GET`
- **描述**: 检索服务器的当前状态。
- **用法**: 使用此端点获取服务器状态信息。

请参考[检查 GreptimeDB 状态文档](/user-guide/deployments-administration/monitoring/check-db-status.md#check-greptimedb-runtime-status)获取示例。

### 指标

- **路径**: `/metrics`
- **方法**: `GET`
- **描述**: 暴露 Prometheus 指标以进行监控。
- **用法**: Prometheus 可以抓取此端点以收集指标数据。

示例如下：

```bash
curl -X GET http://127.0.0.1:4000/metrics
```

输出：

```text
# HELP greptime_app_version app version
# TYPE greptime_app_version gauge
greptime_app_version{app="greptime-edge",short_version="main-b4bd34c5",version="0.12.0"} 1
# HELP greptime_catalog_catalog_count catalog catalog count
# TYPE greptime_catalog_catalog_count gauge
greptime_catalog_catalog_count 1
# HELP greptime_catalog_schema_count catalog schema count
# TYPE greptime_catalog_schema_count gauge
greptime_catalog_schema_count 3
# HELP greptime_flow_run_interval_ms flow run interval in ms
# TYPE greptime_flow_run_interval_ms gauge
greptime_flow_run_interval_ms 1000
# HELP greptime_meta_create_catalog meta create catalog
# TYPE greptime_meta_create_catalog histogram
greptime_meta_create_catalog_bucket{le="0.005"} 1
greptime_meta_create_catalog_bucket{le="0.01"} 1
greptime_meta_create_catalog_bucket{le="0.025"} 1
greptime_meta_create_catalog_bucket{le="0.05"} 1
greptime_meta_create_catalog_bucket{le="0.1"} 1
...
```

### 配置

- **路径**: `/config`
- **方法**: `GET`
- **描述**: 检索服务器的配置选项。
- **用法**: 访问此端点以获取配置详细信息。

示例如下：

```shell
curl http://localhost:4000/config
```

输出包含 GreptimeDB 服务器的配置信息。

```toml
enable_telemetry = true
user_provider = "static_user_provider:file:user"
init_regions_in_background = false
init_regions_parallelism = 16

[http]
addr = "127.0.0.1:4000"
timeout = "30s"
body_limit = "64MiB"
is_strict_mode = false

# ...
```

### 仪表盘

- **路径**: `/dashboard`
- **方法**: `GET`, `POST`
- **描述**: 提供对服务器仪表盘界面的访问。
- **用法**: 访问这些端点以与基于 Web 的仪表盘进行交互。

此仪表盘与 GreptimeDB 服务器一起打包，并提供一个用户友好的界面与服务器进行交互。构建 GreptimeDB 时需要启用相应的编译标志。仪表盘的原始源代码在 https://github.com/GreptimeTeam/dashboard。

### 日志级别

- **路径**: `/debug/log_level`
- **方法**: `POST`
- **描述**: 动态调整服务器的日志级别。
- **用法**: 发送日志级别更改请求到此端点。

有关更多信息，请参阅[如何文档](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-change-log-level-on-the-fly.md)。

### 启用/禁用链路追踪

- **路径**: `/debug/enable_trace`
- **方法**: `POST`
- **描述**: 在运行时动态启用或禁用分布式链路追踪。
- **用法**: 发送 `true` 启用链路追踪，或发送 `false` 禁用链路追踪。

启用链路追踪示例：

```bash
curl --data "true" http://127.0.0.1:4000/debug/enable_trace
# 输出: trace enabled
```

禁用链路追踪示例：

```bash
curl --data "false" http://127.0.0.1:4000/debug/enable_trace
# 输出: trace disabled
```

有关链路追踪配置的更多信息，请参阅[链路追踪文档](/user-guide/deployments-administration/monitoring/tracing.md)。

### 性能分析工具

- **基础路径**: `/debug/prof/`
- **描述**: 数据库节点运行时 CPU 或内存使用情况分析。

CPU 性能分析：

| 路径 | 方法 | 描述 |
| --- | --- | --- |
| `/debug/prof/cpu` | `POST` | 采集 CPU profile。查询参数包括 `seconds`、`frequency` 和 `output`。支持的输出格式为 `proto`、`text` 和 `flamegraph`。 |

示例：

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/cpu?seconds=10&output=flamegraph' > greptime-cpu.svg
```

内存性能分析：

| 路径 | 方法 | 描述 |
| --- | --- | --- |
| `/debug/prof/mem` | `POST` | 导出内存 profile 数据。查询参数 `output` 支持 `text`、`proto` 和 `flamegraph`。 |
| `/debug/prof/mem/status` | `GET` | 检查堆分析是否处于启用状态。 |
| `/debug/prof/mem/activate` | `POST` | 启用堆分析。 |
| `/debug/prof/mem/deactivate` | `POST` | 停用堆分析。 |
| `/debug/prof/mem/gdump` | `GET` | 检查 jemalloc gdump 是否处于启用状态。 |
| `/debug/prof/mem/gdump` | `POST` | 启用或停用 jemalloc gdump。使用表单字段 `activate=true` 或 `activate=false`。 |
| `/debug/prof/mem/symbol` | `POST` | 上传 jemalloc heap dump 文件并返回符号化后的火焰图。 |

示例：

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=flamegraph' > greptime-mem.svg
curl -X GET 'http://127.0.0.1:4000/debug/prof/mem/status'
curl -X POST 'http://127.0.0.1:4000/debug/prof/mem/gdump' -d 'activate=true'
```

运维指导请参阅[采集性能分析数据](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md#采集性能分析数据)。高级用法请参阅 [CPU 分析](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-cpu.md) 和 [内存分析](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-memory.md)。

## 查询端点

用于向 GreptimeDB 发送查询的各种查询 API。

### SQL API

- **路径**: `/v1/sql`
- **方法**: `GET`, `POST`
- **描述**: 执行 SQL 查询。
- **用法**: 在请求体中发送 SQL 语句。

有关 SQL API 的更多信息，请参阅用户指南中的 [HTTP API 文档](/user-guide/protocols/http.md#post-sql-statements)。

### 流式 EXPLAIN ANALYZE API

- **路径**: `/v1/sql/analyze/stream`
- **方法**: `POST`
- **描述**: 以 Server-Sent Events (SSE) 的形式流式返回运行中查询的 `EXPLAIN ANALYZE VERBOSE` 指标。

这是一个实验性端点，由 `http.experimental_enable_explain_analyze_stream` 配置项控制（默认为 `true`）。当该配置项被禁用时，端点不会被注册，请求将返回 `404 Not Found`。

该端点仅支持 POST，响应 `Content-Type` 为 `text/event-stream`。由于浏览器的 `EventSource` 只支持 GET 请求，因此无法使用该端点。

#### 请求参数

参数可以通过查询字符串或 POST 请求体中的表单字段传递：

| 参数 | 必填 | 描述 |
| --- | --- | --- |
| `sql` | 是 | 要执行的 `EXPLAIN ANALYZE VERBOSE` 语句。 |
| `db` | 否 | 执行语句所在的数据库。 |
| `snapshot_interval_ms` | 否 | `metrics` 快照的发送间隔（毫秒）。默认为 `5000`，取值会被限制在 `[1000, 60000]` 范围内。 |

示例：

```bash
curl -N -X POST 'http://127.0.0.1:4000/v1/sql/analyze/stream' \
  -H 'Accept: text/event-stream' \
  -F 'sql=EXPLAIN ANALYZE VERBOSE SELECT * FROM monitor'
```

#### 语句限制

该端点仅接受单条 `EXPLAIN ANALYZE VERBOSE` 语句，也接受 `EXPLAIN ANALYZE VERBOSE FORMAT JSON`；`FORMAT` 子句可选，且仅支持 `JSON`。其他请求都会被拒绝，并返回常规的 JSON 错误响应（而非 SSE），包括：

- 非 explain 语句，如 `SELECT ...`
- 不带 `VERBOSE` 的 `EXPLAIN` 或 `EXPLAIN ANALYZE`
- 使用非 JSON 格式的 `EXPLAIN ANALYZE VERBOSE`，如 `FORMAT TEXT` 或 `FORMAT GRAPHVIZ`
- 以分号分隔的多条语句

#### SSE 事件

每个事件由 `event:` 行和包含 JSON 负载的 `data:` 行组成，事件之间以空行分隔。流打开期间，服务器每 15 秒发送一行 keep-alive 注释。

所有负载都包含以下字段：

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `seq` | 整数 | 事件的单调递增序号。 |
| `state` | 字符串 | 事件类型：`metrics`、`final`、`canceled` 或 `error`。 |
| `partial` | 布尔值 | `metrics` 事件为 `true`，终止事件为 `false`。 |
| `elapsed_ms` | 整数 | 自请求开始以来的耗时（毫秒）。 |
| `metrics` | 数组 | 当前的 `EXPLAIN ANALYZE VERBOSE` 指标快照：由 `stage` / `node` / `plan` 条目组成的数组。仅出现在 `metrics` 和 `final` 事件中。 |
| `output` | 对象 | 以 GreptimeDB JSON 格式返回的最终查询结果。仅出现在 `final` 事件中。 |
| `reason` | 字符串 | 失败或取消的原因。仅出现在 `error` 和 `canceled` 事件中。 |
| `code` | 整数 | GreptimeDB 状态码。仅出现在 `error` 和 `canceled` 事件中。 |

服务器会发出四种事件类型：

- `metrics` — 查询运行期间周期性发送。每个事件携带截至目前已收集指标的**完整 best-effort 快照**，而不是自上一个事件以来的增量（delta）。快照是 best-effort 的：在收集过程中指标值可能会变化。快照会以自适应间隔进行合并（coalescing）：一旦单个快照负载达到 1 MiB，间隔将提升至至少 10 秒；达到 10 MiB 时，提升至至少 30 秒。快照会被限流但绝不会被截断。
- `final` — 终止事件。查询完成时发送，携带最终指标快照以及 `output` 字段中的查询结果。
- `canceled` — 终止事件。查询在完成前被取消时发送，携带取消原因和 GreptimeDB 状态码 `1005`（`Cancelled`）。
- `error` — 终止事件。查询失败时发送，携带错误原因和 GreptimeDB 状态码。

`metrics` 事件示例：

```text
event: metrics
data: {"seq":3,"state":"metrics","partial":true,"elapsed_ms":15234,"metrics":[{"stage":0,"node":0,"plan":{"name":"MergeScanExec","param":"peers=[...]","output_rows":0,"elapsed_compute":0,"metrics":{...},"children":[...]}}]}
```

#### 客户端断开与生命周期

如果客户端在终止事件之前断开连接，它将不再收到任何事件：SSE 流会被丢弃，底层查询会被 best-effort 取消。断开的客户端永远不会收到 `canceled` 事件。

该流没有 resume、reconnect 或 detached 执行的生命周期：连接会从请求开始保持到终止事件发生，事件只发送给已连接的客户端。

### PromQL API

- **路径**: `/v1/promql`
- **方法**: `GET`, `POST`
- **描述**: 执行 PromQL 查询以获取 Prometheus 兼容的指标，并以 GreptimeDB 的 JSON 格式返回数据。
- **用法**: 在请求体中发送 PromQL 语句。

有关 PromQL API 的更多信息，请参阅 [PromQL 文档](/user-guide/query-data/promql.md)。

## 协议端点

与 GreptimeDB 兼容的各种协议的端点。如 InfluxDB、Prometheus、OpenTelemetry 等。

### InfluxDB 兼容性

- **路径**:
  - `/v1/influxdb/write`
  - `/v1/influxdb/api/v2/write`
  - `/v1/influxdb/ping`
  - `/v1/influxdb/health`
- **方法**:
  - `POST` 用于写入端点。
  - `GET` 用于 ping 和健康检查端点。
- **描述**: 提供与 InfluxDB 兼容的数据写入和健康检查端点。
- **用法**:
  - 使用 InfluxDB 行协议写入数据。
  - 使用 ping 和健康检查端点检查服务器状态。

有关 InfluxDB 协议的详细文档，请参阅[这里](/user-guide/protocols/influxdb-line-protocol.md)。

### Prometheus 远程写入/读取

- **路径**:
  - `/v1/prometheus/write`
  - `/v1/prometheus/read`
- **方法**: `POST`
- **描述**: 支持 Prometheus 远程写入和读取 API。
- **用法**:
  - 使用 Prometheus 远程写入协议发送指标数据。
  - 使用 Prometheus 远程读取协议读取指标数据。

### Prometheus HTTP API

- **基础路径**: `/v1/prometheus/api/v1`
- **端点**:
  - `/format_query`
  - `/status/buildinfo`
  - `/query`
  - `/query_range`
  - `/labels`
  - `/series`
  - `/parse_query`
  - `/label/{label_name}/values`
- **方法**: `GET`, `POST`
- **描述**: 提供 Prometheus HTTP API 端点以查询和检索指标数据。
- **用法**: 使用这些端点以标准 Prometheus HTTP API 进行指标交互。

有关 Prometheus HTTP API 的更多信息，请参阅原始 Prometheus 文档 [Prometheus HTTP API](https://prometheus.io/docs/prometheus/latest/querying/api/)。

### OpenTelemetry 协议 (OTLP)

- **路径**:
  - `/v1/otlp/v1/metrics`
  - `/v1/otlp/v1/traces`
  - `/v1/otlp/v1/logs`
- **方法**: `POST`
- **描述**: 支持 OpenTelemetry 协议以写入 Metrics、Traces 和 Logs。
- **用法**: 将 OpenTelemetry 格式的数据发送到这些端点。

### Loki 兼容性

- **路径**: `/v1/loki/api/v1/push`
- **方法**: `POST`
- **描述**: 以兼容 Loki 的 API 写入日志。
- **用法**: 将日志数据以 Loki 的格式发送到此端点。

### Splunk HEC 兼容性

- **路径**: `/v1/splunk/services/collector/event`、`/v1/splunk/services/collector/raw`、`/v1/splunk/services/collector/health`
- **方法**: 写入端点为 `POST`，健康检查端点为 `GET`
- **描述**: 以兼容 Splunk HTTP Event Collector (HEC) 的协议写入日志。
- **用法**: 向 `/event` 发送 JSON 事件，或向 `/raw` 发送纯文本。参考[使用 Splunk 协议写入数据](/user-guide/ingest-data/for-observability/splunk.md)。

### OpenTSDB 协议

- **路径**: `/v1/opentsdb/api/put`
- **方法**: `POST`
- **描述**: 支持使用 OpenTSDB 协议写入数据。
- **用法**: 使用 OpenTSDB 的 JSON 格式写入时间序列数据。

## 日志写入端点

- **路径**:
  - `/v1/ingest`
  - `/v1/pipelines/{pipeline_name}`
  - `/v1/pipelines/_dryrun`
- **方法**:
  - `POST` 写入日志和添加 Pipeline。
  - `DELETE` 用于删除 Pipeline。
- **描述**: 提供日志写入和 Pipeline 管理的端点。
- **用法**:
  - 通过 `/logs` 端点写入日志。
  - 使用 `/pipelines` 端点管理日志 Pipeline。

有关日志写入和 Pipeline 管理的更多信息，请参阅[日志概述](/user-guide/logs/overview.md)。
