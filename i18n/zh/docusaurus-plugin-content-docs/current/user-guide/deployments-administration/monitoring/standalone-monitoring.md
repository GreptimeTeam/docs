---
keywords: [standalone monitoring, GreptimeDB, metrics, Grafana]
description: 使用 Prometheus 指标和 Grafana 监控 GreptimeDB 单机实例的指南。
---

# 单机监控

GreptimeDB 单机版在 HTTP 端口（默认 `4000`）上提供 `/metrics` 端点，暴露 [Prometheus 指标](/reference/http-endpoints.md#指标)。

## 监控配置

你可以配置 GreptimeDB 将指标导出到 GreptimeDB 自身或外部的 Prometheus 实例。

### 将指标存储到 GreptimeDB 自身

将指标存储到 GreptimeDB 自身既方便又推荐用于自监控，且支持基于 SQL 的查询和分析。

要启用自监控，请在你的 TOML 配置文件中配置 `export_metrics` 部分：

```toml
[export_metrics]
enable = true
# 指标收集间隔
write_interval = "30s"
[export_metrics.self_import]
db = "greptime_metrics"
```

此配置：
- 每 30 秒收集和写入指标。
- 将指标导出到 GreptimeDB 内的 `greptime_metrics` 数据库。请确保在导出指标之前 `greptime_metrics` 数据库[已被创建](/reference/sql/create.md#create-database)。

### 导出指标到 Prometheus

对于已有 Prometheus 基础设施的环境，GreptimeDB 可以通过 Prometheus 远程写入协议导出指标。

具体方法为，在 TOML 配置文件中使用 `remote_write` 选项配置 `export_metrics` 部分：

```toml
[export_metrics]
enable=true
write_interval = "30s"
[export_metrics.remote_write]
# Prometheus Remote-Write 协议指定的 URL
url = "https://your/remote_write/endpoint"
# 一些可选的 HTTP 参数，如身份验证信息
headers = { Authorization = {{Authorization}} }
```

此配置：
- 将导出间隔设置为 30 秒
- 指定 Prometheus 远程写入 URL，应指向你的 Prometheus 实例
- 可选择包含远程写入 URL 的 HTTP 头，如身份验证信息

## Grafana 仪表板集成

GreptimeDB 为监控单机部署提供预构建的 Grafana 仪表板。你可以从 [GreptimeDB 代码库](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana/dashboards/metrics/standalone) 访问仪表板 JSON 文件。
