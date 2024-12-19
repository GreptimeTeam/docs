---
keywords: [简介, 核心功能, 特点, 文档链接, 时序数据库, 实时数据洞察, GreptimeCloud]
description: 介绍了 GreptimeDB 的核心功能和特点，并提供了相关文档的链接，帮助用户快速上手和深入了解。
---

# 简介

<p align="center">
    <img src="/logo-greptimedb.png" alt="GreptimeDB Logo" width="400"/>
</p>

GreptimeDB 是开源的统一时序数据库，能同时处理**指标**（Metrics）、**日志**（Logs）、**事件**（Events）和**追踪**（Traces）。从云到端，GreptimeDB 能从任意规模的时序数据中获取实时数据洞察。

GreptimeDB 经由 [GreptimeCloud](https://greptime.cn/product/cloud) 提供云服务。
GreptimeCloud 是一个完全托管的时序数据库服务，具有无服务器的可扩展性、与生态系统的无缝集成和 Prometheus 兼容性。

我们的核心开发人员多年深耕于建立时序数据平台。基于他们的丰富经验，GreptimeDB 应运而生，并为用户提供：

- 统一的时序数据处理；GreptimeDB 将所有时序数据统一抽象成带有时间戳和上下文的事件，从而统一了指标、日志和事件的存储和分析。同时，GreptimeDB 支持使用 SQL 和 PromQL 进行分析，以及通过持续聚合能力来实现流处理。
- 为处理时序数据而优化的列式布局；经过压缩、整理，并存储在各种存储后端，尤其是可以节省 50 倍成本效率的云对象存储。
- 完全开源的分布式集群架构，利用云原生弹性计算资源的强大功能。
- 从边缘节点的单机部署到云端强大、高可用的分布式集群的无缝扩展，为开发人员和管理员提供透明的体验。
- 灵活的索引功能和分布式、并行处理查询引擎，解决高基数的问题。
- 适配广泛采用的数据库协议和 API，包括 MySQL、PostgreSQL 和 Prometheus 远程存储等。
- Schemaless 写入，自动为数据创建表格。

在开始上手之前，请阅读以下文档，其包含了设置说明、基本概念、架构设计和教程：

- [立即开始][1]: 为刚接触 GreptimeDB 的用户提供指引，包括如何安装与数据库操作。
- [用户指南][2]: 应用程序开发人员可以使用 GreptimeDB 或建立自定义集成。
- [贡献者指南][3]: 有兴趣了解更多技术细节并想成为 GreptimeDB 的贡献者的开发者请阅读此文档。
<!-- - [Changelog][4]: Presents the latest GreptimeDB roadmap and biweekly reports.
 [FAQ][5]: Presents the most frequently asked questions. -->

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./contributor-guide/overview.md

<!-- [4]: ./changelog/overview.md
[5]: ./faq-and-others/faq.md -->
