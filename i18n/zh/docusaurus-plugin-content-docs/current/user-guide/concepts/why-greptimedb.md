---
keywords: [开源可观测性数据库, metrics, logs, traces, 对象存储, 计算存储分离]
description: 说明团队为什么评估 GreptimeDB、GreptimeDB 如何处理 metrics、logs 和 traces，以及开源版与 Enterprise 的能力边界。
---

# 为什么选择 GreptimeDB

团队开始评估新的可观测后端，往往是因为多套信号存储、存储扩容或长期分析的运维成本已经难以忽略。GreptimeDB 用同一个列式引擎处理 metrics、logs 和 traces，同时保留清晰的数据模型和部署边界。

## GreptimeDB 是什么

GreptimeDB 是开源的可观测性数据库。它用同一个列式引擎存储和查询 metrics、logs、traces，并提供统一的 SQL 查询层。GreptimeDB 既可以使用本地存储以单机模式运行，也可以组成以对象存储为持久化存储的分布式集群。

GreptimeDB 不是通用事务数据库。它的存储、索引、留存和查询路径面向以追加写入为主的时间索引数据，例如可观测数据和 IoT 数据。

<AnchorAlias id="问题三种信号三套系统" />
<AnchorAlias id="统一处理可观测数据" />

## 为什么用一个引擎处理三种信号

metrics、logs 和 traces 分散在不同数据库时，每套系统都有自己的容量模型、生命周期策略、查询方式和故障边界。故障排查要么搬运数据，要么在几套系统之间来回查询。

GreptimeDB 用同一个列式引擎处理三类信号，并采用共同的 [Tag、Timestamp、Field 列语义](./data-model.md)：

- metrics、logs、traces 共用一套存储和生命周期管理机制；
- 所有信号都可以使用 SQL 查询，metrics 还可以使用 PromQL；
- [Flow](/user-guide/flow-computation/overview.md)用于持续聚合，并把派生结果物化到 sink table；
- instrumentation 记录了共同标识时，可以通过 SQL 关联不同信号。

这里的“统一”指引擎、存储和查询层，不要求 metrics、logs、traces 使用同一张表、同一套 schema，也不要求采用[宽事件模型](./observability-2.md)。

## 一个列式引擎，不同的表

减少系统数量，不等于把不同信号硬塞进同一种 schema。指标点、日志、span 和包含完整上下文的事件，其访问方式和留存要求并不相同。

GreptimeDB 允许每类 workload 使用适合自己的表：

- metrics 通常用主键列保存 labels，并使用 PromQL 查询；
- logs 常用 append-only 表，并根据查询方式选择全文索引或倒排索引；
- traces 保留 trace 和 span 标识，可以使用 SQL 或 Jaeger 兼容接口查询；
- 只有在事后分析确实需要完整上下文时，才需要使用更宽的事件表，并承担相应的存储成本。

这些表可以分别配置 schema、索引、TTL、compaction 选项和存储后端。具体机制参见[数据模型](./data-model.md)和[存储位置](./storage-location.md)。

## 实时监控与历史分析，共用一套系统

故障处置需要快速查询近期数据，趋势分析、容量评估和事后排查则可能扫描几周甚至几个月的数据。如果分别使用监控后端和分析数据库，就要多维护一条写入链路、一份数据副本和一套系统。

GreptimeDB 用同一个引擎、同一套存储与查询基础处理这两类 workload。近期数据可以通过内存和本地 cache 加速，持久化数据则保存在对象存储中，供更长时间范围的查询使用。长期分析不需要另建分析数据库和数据复制链路。

<AnchorAlias id="对象存储成本低一个数量级" />
<AnchorAlias id="基于-kubernetes-的弹性扩展" />

## 对象存储与独立扩展

持久化文件绑定在计算节点上时，增加容量往往伴随数据迁移、本地磁盘再均衡，或者存储与计算一起扩容。留存数据越多，集群调整越重。

分布式 GreptimeDB 使用共享对象存储时，持久化数据文件可以放在 Amazon S3、Google Cloud Storage、Azure Blob Storage 等服务中。Datanode 负责写入、compaction 和查询，本地磁盘可以缓存远端数据。计算容量与对象存储容量可以分别调整，不必在 Datanode 之间复制全部持久化文件。具体参见[架构](./architecture.md)和[存储位置](./storage-location.md)。

<AnchorAlias id="易于集成" />
<AnchorAlias id="灵活部署从边缘到云" />

## 协议和查询边界

迁移成本常常不在数据库部署本身，而在采集端、仪表盘和客户端代码。GreptimeDB 支持通过多种现有协议写入数据：

- Prometheus Remote Write 写入 metrics；
- OpenTelemetry OTLP/HTTP 写入 metrics、logs 和 traces；
- Loki Push API 写入 logs；
- Elasticsearch Bulk API 写入文档；
- InfluxDB Line Protocol、MySQL、PostgreSQL，以及 GreptimeDB 的 gRPC 和 HTTP API。

这些集成只覆盖对应的写入或客户端接口，不代表完整兼容原系统。Loki 写入不包含 LogQL；开源版 Elasticsearch 集成支持 Bulk API，不等于完整支持 Query DSL。所有信号都可以使用 [SQL](/user-guide/query-data/sql.md) 查询，metrics 还可以使用 [PromQL](/user-guide/query-data/promql.md)，traces 还可以使用 Jaeger 兼容查询接口。规划迁移前，应先核对各协议页面列出的边界。

## 开源版与 Enterprise 的边界

评估扩展能力、可用性和运维成本时，需要先分清版本边界。开源版包括单机和集群部署、对象存储、SQL、PromQL、Flow、索引，以及上面列出的写入接口。

[GreptimeDB Enterprise](/enterprise/overview.md) 另行提供读副本、通过 Datanode group 隔离 workload、自动 Region 均衡与重分区、RBAC、LDAP 集成、审计日志和企业灾备方案等能力。概念文档提到开源集群时，不默认包含这些功能。

## 仍然需要配置什么

共用一套系统改变的是运维对象，不会让不同 workload 变得完全相同。生产部署仍要明确配置：

- 按 workload 设置 schema、索引、TTL 和 compaction；
- 根据近期查询与历史查询的比例，规划 cache、查询并发和计算容量；
- 根据持久性和恢复目标配置 WAL、metadata、对象存储、备份和恢复；
- 按需规划 Region 放置、failover 和资源隔离。

确定 RPO、RTO 或可用性目标前，请先阅读[存储位置](./storage-location.md)和[灾备](/user-guide/deployments-administration/disaster-recovery/overview.md)。

<AnchorAlias id="高性能" />

## 生产用户公开的数据

下面的数据来自特定 workload 和配置下的公开案例：

- [OceanBase Cloud](https://greptime.cn/blogs/2025-07-22-user-case-obcloud-log-storage-greptimedb) 运行着 80 多个 GreptimeDB 集群，保存 300 TB 日志与 SQL 审计数据，留存周期为 7 天，持续写入吞吐约 1 GB/s。从 Loki 迁移后，整体日志存储成本下降 60% 以上。
- [得物](https://greptime.cn/blogs/2025-05-06-poizon-greptimedb-observability)使用 Flow 从明细事件持续维护 10 秒、1 分钟和 10 分钟粒度的聚合结果。公开案例显示，预聚合将 P99 查询延迟从秒级降到毫秒级。

实际结果取决于 schema、索引、留存周期、硬件、对象存储价格、cache 配置和查询 workload。规划容量时，应结合带测试条件的[性能报告](https://greptime.cn/blogs/2024-09-09-report-summary)。

<AnchorAlias id="greptimedb-对比" />

## 和现有方案比较

实际选型通常是在现有可观测系统之间比较：指标侧的 Prometheus、Mimir、Thanos，日志与链路侧的 Loki、Tempo、Elasticsearch，以及 VictoriaMetrics、ClickHouse 或 ClickStack。

[GreptimeDB 对比页面](https://greptime.cn/compare/)按产品列出了架构、协议与查询差异、迁移路径和基准测试条件。应从当前正在使用的系统进入对应页面，而不是只看一张脱离版本和 workload 的功能表。

## 下一步

- 通过[快速开始](/getting-started/quick-start.md)在本地验证写入和查询。
- 对照[产品比较](https://greptime.cn/compare/)检查当前技术栈的差异。
- 生产切换前，通过[迁移指南](/user-guide/migrate-to-greptimedb/overview.md)确认协议、查询、仪表盘和历史数据的改动范围。
