---
keywords: [HTTP API, 管理 API, 健康检查, 状态, 指标, 配置, 仪表盘, 日志级别, 性能分析]
description: 介绍 GreptimeDB 常用的 HTTP 路径，包括管理 API、查询端点和协议端点。
---

# HTTP API 端点列表

GreptimeDB 提供两个 HTTP Server：

| Server | 默认地址 | 用途 |
|--------|---------|------|
| **主 HTTP Server** | `127.0.0.1:4000` | 内部/运维使用。提供所有路径，包括 `/health`、`/metrics`、`/config`、`/debug/*` 等管理端点，以及全部 `/v1` 和 `/dashboard` 路径。该端口应保持私有，仅对可信运维人员开放。 |
| **公共 HTTP API Server** | `127.0.0.1:4006` | 面向用户的 API 流量。仅提供 `/v1` API 和 `/dashboard`，不提供管理端点。默认禁用；可在配置文件中设置 `http.enable_api_server = true` 来启用。 |

主 HTTP Server 应保持私有。如需向终端用户开放 GreptimeDB API，请启用公共 API Server，并只对外开放该端口。

:::warning
公共 API Server 可以缩小对外路由面，但路由过滤不提供身份认证或传输加密。未配置 `user_provider` 时，GreptimeDB 会接受未认证的请求。允许外部访问前，应直接配置或通过反向代理提供身份认证、TLS 和网络访问控制。
:::

```toml
[http]
# 主 HTTP Server — 保持内部访问
addr = "127.0.0.1:4000"

# 启用公共 API Server，并绑定到可供外部访问的地址
enable_api_server = true
api_server_addr = "0.0.0.0:4006"
```

详见[配置文档](/user-guide/deployments-administration/configuration.md#协议选项)中的 `[http]` 选项。

以下各节介绍常用的 HTTP 路径：

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

构建 GreptimeDB 时启用对应 feature 后，二进制会包含 Dashboard。源代码位于 [GreptimeDB Dashboard 仓库](https://github.com/GreptimeTeam/dashboard)。

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

这些端点用于执行 SQL、PromQL 或结构化日志查询。

### SQL API

- **路径**: `/v1/sql`
- **方法**: `GET`, `POST`
- **描述**: 执行 SQL 查询。
- **用法**: 在请求体中发送 SQL 语句。

有关 SQL API 的更多信息，请参阅用户指南中的 [HTTP API 文档](/user-guide/protocols/http.md#post-sql-statements)。

### 格式化 SQL API

- **路径**: `/v1/sql/format`
- **方法**: `GET`, `POST`
- **描述**: 把 SQL 语句改写成 GreptimeDB SQL 方言的规范形式。从 v0.17 起支持。
- **用法**: 通过 `sql` 查询参数传入 SQL，或放在 `POST` 请求的表单体里（`POST` 请求必须设置 `Content-Type: application/x-www-form-urlencoded`）。返回的 JSON 对象 `{"formatted": "..."}` 中包含规范化后的 SQL 字符串。

有关格式化 SQL API 的更多信息，请参阅用户指南中的 [HTTP API 文档](/user-guide/protocols/http.md#使用-greptimedb-的-sql-方言格式化-sql)。

### 解析 SQL API

- **路径**: `/v1/sql/parse`
- **方法**: `GET`, `POST`
- **描述**: 解析 SQL 并返回 GreptimeDB statement 表示，不执行语句。
- **用法**: 通过 `sql` 查询参数或 `application/x-www-form-urlencoded` 表单请求体传入 SQL。

### PromQL API

- **路径**: `/v1/promql`
- **方法**: `GET`, `POST`
- **描述**: 执行 PromQL 查询以获取 Prometheus 兼容的指标，并以 GreptimeDB 的 JSON 格式返回数据。
- **用法**: 在请求体中发送 PromQL 语句。

有关 PromQL API 的更多信息，请参阅 [PromQL 文档](/user-guide/query-data/promql.md)。

### 流式查询分析

`POST /v1/sql/analyze/stream` 返回 `text/event-stream` 格式的 Server-Sent Events（SSE），用于获取执行中的查询指标。
该实验性端点由 `http.experimental_enable_explain_analyze_stream` 控制，默认为 `true`。禁用后，端点不注册，请求返回 `404 Not Found`。

参数通过 URL 查询字符串或 `application/x-www-form-urlencoded` 请求体传入；同名参数以 URL 中的值为准。

| 参数 | 要求 | 描述 |
| --- | --- | --- |
| `sql` | 必填 | 单条 `EXPLAIN ANALYZE VERBOSE` 语句。可省略格式，也可指定 `FORMAT JSON`；其他格式不受支持。 |
| `db` | 可选 | 数据库，默认 `public`。 |
| `snapshot_interval_ms` | 可选 | 指标快照间隔，单位为毫秒，默认 `5000`，限制在 `1000` 到 `60000` 之间。快照 payload 达到 1 MiB 时，间隔至少为 10 秒；达到 10 MiB 时，至少为 30 秒。 |

请求示例：

```bash
curl -N -X POST 'http://127.0.0.1:4000/v1/sql/analyze/stream' \
  --data-urlencode 'db=public' \
  --data-urlencode 'sql=EXPLAIN ANALYZE VERBOSE SELECT count(*) FROM information_schema.tables' \
  --data-urlencode 'snapshot_interval_ms=1000'
```

每个事件由 `event:` 行和包含 JSON 的 `data:` 行组成，事件之间以空行分隔。连接保持期间，每 15 秒发送一行 keep-alive 注释。

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `seq` | 整数 | 单调递增的事件序号。 |
| `state` | 字符串 | `metrics`、`final`、`canceled` 或 `error`。 |
| `partial` | 布尔值 | `metrics` 事件为 `true`，终止事件为 `false`。 |
| `elapsed_ms` | 整数 | 自请求开始以来的毫秒数。 |
| `metrics` | 数组 | 可用时返回 `stage` / `node` / `plan` 快照。 |
| `output` | 对象 | 最终查询结果，仅出现在 `final` 事件中。 |
| `reason` | 字符串 | 错误或取消原因，仅出现在 `error` 和 `canceled` 事件中。 |
| `code` | 整数 | GreptimeDB 状态码，仅出现在 `error` 和 `canceled` 事件中；取消状态码为 `1005`（`Cancelled`）。 |

快照包含已收集的完整指标，不是增量；收集期间指标值可能变化。快照会被限流，但不会被截断。

| 事件 | 行为 |
| --- | --- |
| `metrics` | 完整指标快照，`partial = true`。 |
| `final` | 成功结束，`partial = false`，`output` 包含分析结果。 |
| `error` | 执行失败，`partial = false`，`reason` 和 `code` 给出错误信息与 GreptimeDB 状态码。 |
| `canceled` | 查询取消，`partial = false`，包含 `reason` 和 `code`。 |

`final`、`error` 和 `canceled` 都是终止事件。快速完成的查询可能直接返回 `final`。建立事件流前的校验错误返回普通 JSON 错误响应。
客户端断开连接后，服务端尽力取消查询；断开连接的客户端不会收到 `canceled` 事件。浏览器原生 `EventSource` 不支持此 POST 接口，需要使用支持流式响应的 HTTP 客户端。
事件仅发送到当前连接，不支持断线续传、自动重连或脱离连接执行。

## 协议端点

这些端点实现 InfluxDB、Prometheus、OpenTelemetry、Loki、Splunk HEC 和 OpenTSDB 的部分 API。

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
  - `/metadata`
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

## 日志与 Pipeline 端点

| 路径 | 方法 | 描述 |
| --- | --- | --- |
| `/v1/ingest` | `POST` | 通过 Pipeline 写入日志。 |
| `/v1/logs` | `GET`, `POST` | 执行结构化日志查询。请求使用 JSON body，通常使用 `POST`。 |
| `/v1/pipelines/{pipeline_name}` | `GET` | 返回 Pipeline 定义。 |
| `/v1/pipelines/{pipeline_name}` | `POST` | 创建或替换 Pipeline。 |
| `/v1/pipelines/{pipeline_name}` | `DELETE` | 删除 Pipeline。 |
| `/v1/pipelines/{pipeline_name}/ddl` | `GET` | 返回根据 Pipeline 推断出的建表 DDL。 |
| `/v1/pipelines/_dryrun` | `POST` | 使用样例输入运行 Pipeline，但不写入结果。 |

参见[日志概述](/user-guide/logs/overview.md)、[日志查询](/user-guide/query-data/log-query.md)和 [Pipeline 配置](/reference/pipeline/pipeline-config.md)。
