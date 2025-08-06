---
keywords: [HTTP API, 管理 API, 健康检查, 状态, 指标, 配置, 仪表盘, 日志级别, 性能分析]
description: 介绍 GreptimeDB 中各种 HTTP 路径及其用法的完整列表。
---

# HTTP API 端点列表

以下是 GreptimeDB 中各种 HTTP 路径及其用法的完整列表：

## 管理 API

未版本化的端点（不在 `/v1` 下）。用于健康检查、状态、指标等管理用途。

### 健康检查

- **路径**: `/health`
- **方法**: `GET`, `POST`
- **描述**: 提供一个健康检查端点以验证服务器是否正在运行。
- **用法**: 访问此端点以检查服务器的健康状态。

请参考[检查 GreptimeDB 健康状态文档](/enterprise/deployments-administration/monitoring/check-db-status.md#查看-greptimedb-是否正常运行)获取示例。

### 状态

- **路径**: `/status`
- **方法**: `GET`
- **描述**: 检索服务器的当前状态。
- **用法**: 使用此端点获取服务器状态信息。

请参考[检查 GreptimeDB 状态文档](/enterprise/deployments-administration/monitoring/check-db-status.md#查看-greptimedb-的部署状态)获取示例。

### 指标

- **路径**: `/metrics`
- **方法**: `GET`
- **描述**: 暴露 Prometheus 指标以进行监控。
- **用法**: Prometheus 可以抓取此端点以收集指标数据。

示例如下：

```bash
curl -X GET http://127.0.0.1:4000/metrics

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

### 性能分析工具

- **基础路径**: `/debug/prof/`
- **端点**:
  - `cpu`
  - `mem`
- **方法**: `POST` 用于分析数据库节点。
- **描述**: 运行时 CPU 或内存使用情况分析。
- **用法**:
  - 有关 CPU 分析的详细指南，请参阅 [CPU 分析](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-cpu.md)。
  - 有关内存分析的详细指南，请参阅 [内存分析](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-profile-memory.md)。

## 查询端点

用于向 GreptimeDB 发送查询的各种查询 API。

### SQL API

- **路径**: `/v1/sql`
- **方法**: `GET`, `POST`
- **描述**: 执行 SQL 查询。
- **用法**: 在请求体中发送 SQL 语句。

有关 SQL API 的更多信息，请参阅用户指南中的 [HTTP API 文档](/user-guide/protocols/http.md#post-sql-statements)。

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

### OpenTSDB 协议

- **路径**: `/v1/opentsdb/api/put`
- **方法**: `POST`
- **描述**: 支持使用 OpenTSDB 协议写入数据。
- **用法**: 使用 OpenTSDB 的 JSON 格式写入时间序列数据。

## 日志写入端点

- **路径**:
  - `/v1/events/logs`
  - `/v1/events/pipelines/{pipeline_name}`
  - `/v1/events/pipelines/dryrun`
- **方法**:
  - `POST` 写入日志和添加 Pipeline。
  - `DELETE` 用于删除 Pipeline。
- **描述**: 提供日志写入和 Pipeline 管理的端点。
- **用法**:
  - 通过 `/logs` 端点写入日志。
  - 使用 `/pipelines` 端点管理日志 Pipeline。

有关日志写入和 Pipeline 管理的更多信息，请参阅[日志概述](/user-guide/logs/overview.md)。
