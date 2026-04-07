---
keywords: [可观测性数据库,开源可观测性数据库,时序数据库, 开源时序数据库, 可观测数据,时序数据, 可观测性工具, 云原生数据库, 数据可观测性, 可观测性平台, 边缘数据库, 物联网边缘计算, 边缘云计算, 日志管理, 日志聚合, 高基数, SQL查询示例, OpenTelemetry 收集器, GreptimeDB]
description: 介绍了 GreptimeDB，一个开源的统一可观测性数据库，用于存储指标、日志和事件，包含入门指南、用户指南、贡献者指南等链接，帮助用户快速上手和深入了解。
---

# 简介

<p align="center">
    <img src="/logo-greptimedb.png" alt="GreptimeDB Logo" width="400"/>
</p>

**GreptimeDB** 是一个开源可观测性数据库，可在单一引擎中处理指标、日志和链路追踪。将其作为单一的 OpenTelemetry 后端使用——用一个基于对象存储的数据库替代 Prometheus、Loki 和 Elasticsearch。使用 [SQL](/user-guide/query-data/sql.md) 和 [PromQL](/user-guide/query-data/promql.md) 查询，轻松扩展，成本降低高达 50 倍。

## 为什么选择 GreptimeDB

**用一个系统替代三个系统。** 大多数团队运行 Prometheus 处理指标、Loki 或 ELK 处理日志、Elasticsearch 或 Tempo 处理链路追踪——三个系统、三种查询语言、三套运维开销。GreptimeDB 在单一引擎中统一了这三者，并原生支持 OpenTelemetry。

**成本降低高达 50 倍。** 对象存储（S3、Azure Blob、GCS）作为主要数据存储，计算存储分离。计算节点独立扩展。使用 Rust 编写，配合列式存储和先进的压缩算法，实现最高效率。

**即插即用兼容。** [PromQL](/user-guide/query-data/promql.md)、[Prometheus remote write](/user-guide/ingest-data/for-observability/prometheus.md)、[Jaeger](/user-guide/query-data/jaeger.md)、[MySQL](/user-guide/protocols/mysql.md)、[PostgreSQL](/user-guide/protocols/postgresql.md) 协议——无需重写查询即可迁移。[SQL](/user-guide/query-data/sql.md) + [PromQL](/user-guide/query-data/promql.md) 双查询能力意味着一个数据库就能替代指标存储 + 数据仓库的组合。

了解更多信息请阅读[为什么选择 GreptimeDB](/user-guide/concepts/why-greptimedb.md) 和 [Observability 2.0](/user-guide/concepts/observability-2.md)。

在开始上手之前，请阅读以下文档，其包含了设置说明、基本概念、架构设计和教程：

- [立即开始][1]: 为刚接触 GreptimeDB 的用户提供指引，包括如何安装与数据库操作。
- [用户指南][2]: 应用程序开发人员可以使用 GreptimeDB 或建立自定义集成。
- [GreptimeCloud][6]: 为 GreptimeCloud 用户提供快速入门指南。
- [贡献者指南][3]: 有兴趣了解更多技术细节并想成为 GreptimeDB 的贡献者的开发者请阅读此文档。
- [Roadmap][7]: 最新的 GreptimeDB 发展路线图。
- [发布说明][4]: 呈现所有历史版本的发布说明。
- [FAQ][5]: 提供最常见问题的解答。

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./contributor-guide/overview.md
[4]: /release-notes
[5]: ./faq-and-others/faq.md
[6]: ./greptimecloud/overview.md
[7]: https://greptime.cn/blogs/2026-02-11-greptimedb-roadmap-2026
