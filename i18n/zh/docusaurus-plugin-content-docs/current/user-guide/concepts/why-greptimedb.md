---
keywords: [时序数据库, 云原生, 分布式, 高性能, 用户友好, 存算分离, PromQL, SQL, Python]
description: 介绍 GreptimeDB 的特点、设计原则和优势，包括统一指标、日志和事件，云原生设计，高性能和用户友好等。
---

# 为什么选择 GreptimeDB

GreptimeDB 是一款为云原生环境打造的开源分布式时序数据库。我们的核心开发团队在构建时序数据平台方面拥有丰富经验，在以下数个关键领域体现了最佳实践：

## 基于对象存储的成本优势

GreptimeDB 采用云对象存储（如 AWS S3、阿里云 OSS 和 Azure Blob Storage 等）作为存储层，与传统存储方案相比显著降低了成本。通过优化的列式存储和先进的压缩算法，实现了高达 50 倍的成本效率，而按需付费模式的 [GreptimeCloud](https://greptime.com/product/cloud) 确保您只需为实际使用的资源付费。

## 高性能

在性能优化方面，GreptimeDB 运用了多种技术，如 LSM Tree、数据分片和基于 Kafka 的 WAL 设计，以处理大规模时序数据的写入。

GreptimeDB 采用纯 Rust 编写，确保卓越的性能、安全和可靠性。其强大快速的查询引擎基于向量化执行和分布式并行处理（得益于 [Apache DataFusion](https://datafusion.apache.org/)），并结合了[多种索引能力](/user-guide/manage-data/data-index)，如倒排索引、跳数索引和全文索引等。GreptimeDB 将智能索引和大规模并行处理（MPP）相结合，以提升数据剪枝和过滤效率。详情请参阅[性能测试报告](https://greptime.cn/blogs/2024-09-09-report-summary)。

## 基于 Kubernetes 的弹性扩展

GreptimeDB 从底层就是为 Kubernetes 设计的，基于先进的存储计算分离的架构，实现真正的弹性扩展：

- 存储和计算资源可独立扩展
- 通过 Kubernetes 实现无限水平扩展
- 不同工作负载（数据写入、查询、压缩、索引）之间的资源隔离
- 自动故障转移和高可用性

![存储计算分离，计算资源隔离](/storage-compute-disaggregation-compute-compute-separation.png)。

## 统一处理所有时序数据

GreptimeDB 通过以下方式统一处理指标、日志和事件数据：

- 统一的[数据模型](./data-model.md)，将所有时序数据视为带有上下文的时间戳事件
- 原生支持 [SQL](/user-guide/query-data/sql.md) 和 [PromQL](/user-guide/query-data/promql.md) 查询
- 内置流处理能力（[Flow](/user-guide/flow-computation/overview.md)）用于实时聚合和分析
- 无缝关联分析不同类型的时序数据，详见[SQL 示例](/user-guide/overview.md#sql-query-example)


## 灵活架构：从边缘到云端

![GreptimeDB 的架构](/architecture-2.png)

通过灵活的架构设计原则，不同的模块和组件可以通过模块化和分层设计独立切换、组合或分离。
例如，我们可以将 Frontend、Datanode 和 Metasrc 模块合并为一个独立的二进制文件，也可以为每个表独立启用或禁用 WAL。

灵活的架构允许 GreptimeDB 满足从边缘到云的各种场景中的部署和使用需求，同时仍然使用同一套 API 和控制面板。了解更多请参见[边云一体化解决方案](https://greptime.cn/carcloud)。

通过良好抽象的分层和封装隔离，GreptimeDB 的部署形式支持从嵌入式、独立、传统集群到云原生的各种环境。

## 易于迁移和使用

### 易于部署和维护

为了简化部署和维护过程，GreptimeDB 提供了 [K8s operator](https://github.com/GreptimeTeam/greptimedb-operator)、[命令行工具](https://github.com/GreptimeTeam/gtctl)、嵌入式[仪表盘](https://github.com/GreptimeTeam/dashboard)和其他有用的工具，
使得开发者可以轻松配置和管理数据库。
请访问我们官网的 [Greptime](https://greptime.cn) 了解更多信息。

### 易于集成

GreptimeDB 支持多种数据写入协议：
- **数据库协议**：MySQL、PostgreSQL
- **时序数据协议**：InfluxDB、OpenTSDB、Prometheus RemoteStorage
- **可观测数据协议**：OpenTelemetry、Loki、ElasticSearch
- **高性能 gRPC 协议及客户端 SDK**（Java、Go、Erlang 等）

在数据查询方面，GreptimeDB 提供：
- **SQL**：用于实时查询、复杂分析和数据库管理
- **PromQL**：原生支持实时指标查询和 Grafana 集成
- **Python**：（计划中）支持数据科学场景的数据库内 UDF 和 DataFrame 操作

这种统一的方法实现了与现有可观测性技术栈的无缝集成，用户可以方便地迁移，并同时保持高性能和灵活性。

![Greptime Ecosystem](/greptime-ecosystem.png)

### 简单的数据模型与自动创建表

结合指标（Tag/Field/Timestamp）模型和关系数据模型（Table），
GreptimeDB 提供了一种称为时序表的新数据模型（见下图），以表格形式呈现数据，由行和列组成，指标、日志和事件的 Tag 和 Value 映射到列，并强制时间索引约束表示时间戳。

![时序表](/time-series-table.png)

然而，我们对 schema 的定义不是强制性的，而是更倾向于 MongoDB 等数据库的无 schema 方法。
表将在数据写入时动态自动创建，并自动添加新出现的列（Tag 和 Field）。


要了解更多关于我们的方法和架构，请查看博客文章：[《专为实时而生》](https://greptime.cn/blogs/2022-11-16-github)、[《GreptimeDB 统一存储架构》](https://greptime.cn/blogs/2024-12-24-observability)和[《事件管理革命：监控系统中统一日志和指标》](https://greptime.cn/blogs/2024-06-14-events)。