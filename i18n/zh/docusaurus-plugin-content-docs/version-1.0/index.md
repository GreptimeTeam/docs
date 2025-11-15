---
keywords: [可观测性数据库,开源可观测性数据库,时序数据库, 开源时序数据库, 可观测数据,时序数据, 可观测性工具, 云原生数据库, 数据可观测性, 可观测性平台, 边缘数据库, 物联网边缘计算, 边缘云计算, 日志管理, 日志聚合, 高基数, SQL查询示例, OpenTelemetry 收集器, GreptimeDB]
description: 介绍了 GreptimeDB，一个开源的统一可观测性数据库，用于存储指标、日志和事件，包含入门指南、用户指南、贡献者指南等链接，帮助用户快速上手和深入了解。
---

# 简介

<p align="center">
    <img src="/logo-greptimedb.png" alt="GreptimeDB Logo" width="400"/>
</p>

**GreptimeDB** 是一个开源、云原生、统一的可观测性数据库，用于存储指标、日志和链路追踪数据。您可以从边缘到云端获得实时洞察——无论规模大小。

我们的核心开发人员多年深耕于建立可观测（监控）数据平台。基于他们的丰富经验，GreptimeDB 应运而生，并为用户提供：


- **All-in-One 的可观测性数据库**：通过统一数据库实时处理指标、日志和链路追踪，原生支持 [SQL](/user-guide/query-data/sql.md)、[PromQL](/user-guide/query-data/promql.md) 和 [流式处理](/user-guide/flow-computation/overview.md)。用高性能单一解决方案取代复杂的传统数据堆栈。
- **高性能引擎**：采用 Rust 语言打造，具备卓越的性能和可靠性。丰富的[索引选择](/user-guide/manage-data/data-index.md)（倒排、全文、调数和向量索引）加速查询，实现 PB 级数据的亚秒级响应，并能处理数十万并发请求。
- **显著的成本降低**：凭借计算与存储分离的[架构](/user-guide/concepts/architecture.md)，运营和存储成本降低高达 50 倍。可灵活扩展至各类云存储系统（如 S3、Azure Blob Storage），简化运维管理、大幅降低成本，**无厂商锁定**。
- **无限扩展性**：专为 [Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management.md) 和云环境而设计，采用业界领先的计算与存储分离架构，实现无限制的跨云扩展。高效应对高基数爆炸问题。
- **开发者友好**：支持标准 SQL、PromQL 接口、内置 Web 仪表盘、REST API，并兼容 MySQL/PostgreSQL 协议。广泛适配主流数据 [接入协议](/user-guide/protocols/overview.md)，轻松迁移与集成。
- **灵活的部署选项**：可部署于任意环境，从 ARM 边缘设备到云端，提供统一 API 和高效带宽的数据同步。通过相同的 API 无缝查询边缘和云端数据。

在开始上手之前，请阅读以下文档，其包含了设置说明、基本概念、架构设计和教程：

- [立即开始][1]: 为刚接触 GreptimeDB 的用户提供指引，包括如何安装与数据库操作。
- [用户指南][2]: 应用程序开发人员可以使用 GreptimeDB 或建立自定义集成。
- [贡献者指南][3]: 有兴趣了解更多技术细节并想成为 GreptimeDB 的贡献者的开发者请阅读此文档。
- [最新 RoadMap][4]: 了解 GreptimeDB 当前研发进展和路线图
<!-- - [Changelog][4]: Presents the latest GreptimeDB roadmap and biweekly reports.
 [FAQ][5]: Presents the most frequently asked questions. -->

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./contributor-guide/overview.md
[4]: https://greptime.cn/blogs/2025-01-24-greptimedb-roadmap2025

<!-- [4]: ./changelog/overview.md
[5]: ./faq-and-others/faq.md -->
