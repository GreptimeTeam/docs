---
keywords: [OpenTSDB, 协议, api/put, 指标写入, HTTP API]
description: GreptimeDB 对 OpenTSDB 协议的实现范围——仅支持写入的 /api/put 端点——以及写入文档的位置。
---

# OpenTSDB

GreptimeDB 通过 HTTP 接收 OpenTSDB 指标，请求和响应格式与 OpenTSDB 的 `/api/put` 一致。

- **端点**：`POST /v1/opentsdb/api/put`
- **请求体**：单个指标对象或对象数组，包含 `metric`、`timestamp`、`value` 和 `tags`

只覆盖写入。没有 OpenTSDB 兼容的查询端点，查询使用 [SQL](/user-guide/query-data/sql.md) 或 [PromQL](/user-guide/query-data/promql.md)。

请求示例见[使用 OpenTSDB 写入数据](/user-guide/ingest-data/for-iot/opentsdb.md)。
