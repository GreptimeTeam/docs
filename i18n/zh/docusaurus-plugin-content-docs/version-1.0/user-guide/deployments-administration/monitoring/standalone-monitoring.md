---
keywords: [standalone monitoring, GreptimeDB, metrics, Grafana]
description: 使用 Prometheus 指标和 Grafana 监控 GreptimeDB 单机实例的指南。
---

# 单机监控

GreptimeDB 单机版在 HTTP 端口（默认 `4000`）上提供 `/metrics` 端点，暴露 [Prometheus 指标](/reference/http-endpoints.md#指标)。

你可以使用 Prometheus 抓取这些指标，并使用 Grafana 进行可视化展示。

## Grafana 仪表板集成

GreptimeDB 为监控单机部署提供预构建的 Grafana 仪表板。你可以从 [GreptimeDB 代码库](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana/dashboards/metrics/standalone) 访问仪表板 JSON 文件。
