---
keywords: [概述, 可观测, 物联网, 日志存储, 边缘计算, SQL 查询, 数据处理, 数据模型, 范围查询]
description: 了解如何根据你的使用场景使用 GreptimeDB，包括数据写入、查询和管理。
---

# 用户指南

欢迎使用 GreptimeDB 用户指南。

GreptimeDB 是用于指标、事件和日志的统一可观测数据库，
可提供从边缘到云的任何规模的实时洞察。

## 理解 GreptimeDB 的概念

在深入了解 GreptimeDB 之前，
建议先熟悉数据模型、关键概念和功能。
请参阅 [概念文档](./concepts/overview.md)。

## 根据你的使用场景写入数据

GreptimeDB 支持[多种协议](./protocols/overview.md)和[集成工具](./integrations/overview.md)，
以便根据你的需求写入数据。

### 可观测性指标场景

如果你计划将 GreptimeDB 用于存储可观测性指标、日志和链路追踪，
请参阅[可观测性文档](./ingest-data/for-observability/overview.md)。
该文档解释了如何使用 Otel-Collector, Vector、Kafka、Prometheus 和 InfluxDB 行协议等工具导入数据。

对于将 GreptimeDB 用作日志存储解决方案，
请参考 [日志文档](./logs/overview.md)。
该文档详细说明了如何使用 Pipeline 写入结构化的文本日志。

对于将 GreptimeDB 用作链路追踪（trace）存储解决方案，
请参考 [trace 文档](./traces/overview.md)。
该文档解释了使用 OpenTelemetry 导入数据以及使用 Jaeger 查询数据的方法。

### 物联网和边缘计算场景

对于物联网和边缘计算场景，
[物联网文档](./ingest-data/for-iot/overview.md)提供了从多种来源导入数据的全面指导。

## 查询数据以获取洞察

GreptimeDB 提供了强大的[数据查询](./query-data/overview.md)功能。

### SQL 支持

你可以使用 SQL 进行范围查询、聚合等操作。
有关详细说明，请参阅 [SQL 查询文档](./query-data/sql.md)。

### Prometheus 查询语言 (PromQL)

GreptimeDB 支持使用 PromQL 查询数据。
请参考 [PromQL 文档](./query-data/promql.md) 以获取指导。

### 流计算

对于实时数据处理和分析，GreptimeDB 提供了[流计算](./flow-computation/overview.md)，
支持对数据流进行复杂计算。

## 使用索引加速查询

倒排索引、跳数索引和全文索引等索引可以显著提升查询性能。
有关如何有效使用这些索引的更多信息，请参阅[数据索引文档](./manage-data/data-index.md)。

## 从其他数据库迁移到 GreptimeDB

你可以轻松从其他数据库迁移数据到 GreptimeDB，
请按照[迁移文档](./migrate-to-greptimedb/overview.md)中的分步说明进行操作。

## 管理和部署 GreptimeDB

当你准备好部署 GreptimeDB 时，
请查阅[部署文档](./deployments/overview.md)和[管理文档](./administration/overview.md)获取有关部署和管理的详细指南。
