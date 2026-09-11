---
keywords: [用户指南, 数据写入, 数据查询, Flow 计算, 部署运维, 迁移, 协议]
description: GreptimeDB 使用指南的入口，覆盖数据写入、查询、处理，以及部署和运维。
---

# 用户指南

本指南覆盖 GreptimeDB 的日常使用：数据写入、查询、处理，以及部署和运维。这些任务背后的数据模型和架构见[概念](./concepts/overview.md)。初次安装和第一个查询见[快速开始](/getting-started/quick-start.md)。

<AnchorAlias id="根据你的使用场景写入数据" />

<AnchorAlias id="可观测性指标场景" />
<AnchorAlias id="物联网和边缘计算场景" />

## 写入数据

[写入数据](./ingest-data/overview.md)按数据来源列出对应的写入协议和文档。多数路径上表和列都在数据到达时自动创建；[SQL、Flink 和 Spark](./ingest-data/overview.md#自动生成表结构) 需要写入已存在的表。

有两类信号在入库前还要多一步处理，因此单独成章：

- [日志](./logs/overview.md)——用 Pipeline 解析和转换文本日志后再入库。
- [链路追踪](./traces/overview.md)——存储 OTLP trace，并用 SQL 或 Jaeger 兼容接口查询。

<AnchorAlias id="查询数据以获取洞察" />

<AnchorAlias id="sql-支持" />
<AnchorAlias id="prometheus-查询语言-promql" />

## 查询数据

- [SQL](./query-data/sql.md)——跨指标、日志、链路查询，支持范围查询、CTE、JOIN 和视图。
- [PromQL](./query-data/promql.md)——通过 Prometheus HTTP 接口查询指标，也可以在 SQL 中使用 `TQL`。
- [Jaeger 接口](./query-data/jaeger.md)——从 Jaeger UI 或 Grafana 查询 trace。

各查询接口的对比见[查询数据](./query-data/overview.md)。

<AnchorAlias id="使用索引加速查询" />

<AnchorAlias id="flow-计算" />

## 处理与描述数据

- [Flow 计算](./flow-computation/overview.md)——对持续写入的数据做连续聚合，结果写入 sink table。
- [数据索引](./manage-data/data-index.md)——倒排索引、跳数索引和全文索引，以及各自适用的场景。
- [更新、删除与 TTL](./manage-data/overview.md)——覆盖写入、删除数据，以及用 TTL 控制留存。
- [表语义层](./concepts/semantic-layer.md)——`greptime.semantic.*` 元数据，记录每张表的信号类型、写入来源和单位。
- [向量存储](./vectors/vector-type.md)——向量数据类型与相似度检索。

<AnchorAlias id="从其他数据库迁移到-greptimedb" />
<AnchorAlias id="管理和部署-greptimedb" />

## 部署与运维

- [运维部署及管理](./deployments-administration/overview.md)——Kubernetes 和裸机部署、容量规划、WAL 模式、监控、容灾和 Region 运维。
- [迁移到 GreptimeDB](./migrate-to-greptimedb/overview.md)——从 Prometheus、InfluxDB、Loki、Elasticsearch 或 MySQL 迁移时，协议、查询、仪表盘和历史数据的改动范围。
- [时区](./timezone.md)——会话时区对写入和查询结果的影响。

## 连接其他工具

- [协议](./protocols/overview.md)——GreptimeDB 支持的传输协议，以及各自的能力边界。
- [集成](./integrations/overview.md)——Grafana、Superset、Metabase、Flink、Spark、MCP Server 等可以连接 GreptimeDB 的工具。
