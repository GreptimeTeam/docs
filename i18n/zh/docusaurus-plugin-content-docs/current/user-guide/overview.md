---
keywords: [用户指南, 数据写入, 数据查询, Flow 计算, 部署运维, 迁移, 协议]
description: GreptimeDB 使用指南的入口，覆盖数据写入、查询、处理，以及部署和运维。
---

# 用户指南

本指南覆盖 GreptimeDB 的使用：把数据写进来、查询、处理，以及部署和运维。这些任务背后的数据模型和架构见[概念](./concepts/overview.md)。第一次安装并跑通一个查询，从[快速开始](/getting-started/quick-start.md)入手。

<AnchorAlias id="根据你的使用场景写入数据" />

## 写入数据

[写入数据](./ingest-data/overview.md)按数据来源列出对应的写入协议和文档。表和列在数据到达时自动创建，不需要预先定义 schema。

有两类信号除写入协议外还涉及存储前的处理，因此单列文档：

- [日志](./logs/overview.md)——用 Pipeline 解析和转换文本日志后再入库。
- [链路追踪](./traces/overview.md)——存储 OTLP trace，并用 SQL 或 Jaeger 兼容接口查询。

<AnchorAlias id="查询数据以获取洞察" />

## 查询数据

- [SQL](./query-data/sql.md)——跨指标、日志、链路查询，支持范围查询、CTE、JOIN 和视图。
- [PromQL](./query-data/promql.md)——通过 Prometheus HTTP 接口查询指标，也可以在 SQL 中使用 `TQL`。
- [Jaeger 接口](./query-data/jaeger.md)——从 Jaeger UI 或 Grafana 查询 trace。

三种接口的对比见[查询数据概述](./query-data/overview.md)。

<AnchorAlias id="使用索引加速查询" />

## 处理与描述数据

- [Flow 计算](./flow-computation/overview.md)——对持续写入的数据做连续聚合，结果落到 sink table。
- [数据索引](./manage-data/data-index.md)——倒排索引、跳数索引和全文索引，以及各自适用的场景。
- [管理数据](./manage-data/overview.md)——更新、删除、TTL 策略和 compaction。
- [语义层](./semantic-layer/overview.md)——记录每张表存的是什么，以及数据描述了哪些实体。
- [向量存储](./vectors/vector-type.md)——向量数据类型与相似度检索。

<AnchorAlias id="从其他数据库迁移到-greptimedb" />
<AnchorAlias id="管理和部署-greptimedb" />

## 部署与运维

- [部署与管理](./deployments-administration/overview.md)——Kubernetes 和裸机部署、容量规划、WAL 模式、监控、容灾和 Region 运维。
- [迁移到 GreptimeDB](./migrate-to-greptimedb/overview.md)——从 Prometheus、InfluxDB、Loki、Elasticsearch 或 MySQL 迁移时，协议、查询、仪表盘和历史数据的改动范围。
- [时区](./timezone.md)——会话时区对写入和查询结果的影响。

## 连接其他工具

- [协议](./protocols/overview.md)——GreptimeDB 支持的传输协议，以及各自的能力边界。
- [集成](./integrations/overview.md)——Grafana、Superset、Metabase、Flink、Spark、MCP Server 等可以连接 GreptimeDB 的工具。
