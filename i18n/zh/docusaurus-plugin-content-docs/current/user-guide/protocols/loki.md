---
keywords: [Loki, 协议, Push API, 日志写入, Grafana Alloy, Promtail]
description: GreptimeDB 对 Loki 协议的实现范围——仅支持写入的 Push API——以及写入文档的位置。
---

# Loki

GreptimeDB 实现了 Loki Push API，已经在往 Loki 写日志的客户端改一下地址就能写入 GreptimeDB。

- **端点**：`POST /v1/loki/api/v1/push`
- **负载编码**：Snappy 压缩的 Protobuf（`Content-Type: application/x-protobuf`）或 Loki JSON（`Content-Type: application/json`）
- **目标表**：默认 `loki_logs`，可用 `X-Greptime-Log-Table-Name` 请求头指定
- **数据库**：用 `X-Greptime-DB-Name` 请求头指定

只覆盖写入。查询用 [SQL](/user-guide/query-data/sql.md)，不支持 LogQL。

标签、请求头、数据模型和 Pipeline 支持见[使用 Loki 写入数据](/user-guide/ingest-data/for-observability/loki.md)。
