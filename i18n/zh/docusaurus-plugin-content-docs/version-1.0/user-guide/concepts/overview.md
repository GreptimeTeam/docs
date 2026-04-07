---
keywords: [GreptimeDB, 特性, 数据模型, 架构, 存储位置, 核心概念]
description: GreptimeDB 概念概览，包括为什么选择 GreptimeDB、数据模型、架构、存储位置、核心概念和常见问题。
---

# 概念

GreptimeDB 是一个可观测性数据库，在单一引擎中统一处理 metrics、logs 和 traces。这里介绍理解 GreptimeDB 所需的核心概念。

**从这里开始：**
- [为什么选择 GreptimeDB](./why-greptimedb.md) — 三支柱架构的问题，GreptimeDB 怎么解决
- [数据模型](./data-model.md) — Metrics、logs、traces 如何用 Tag + Timestamp + Field 统一表示
- [架构](./architecture.md) — 计算存储分离、无状态 Frontend、GreptimeDB 如何扩展

**深入了解：**
- [Observability 2.0](./observability-2.md) — 宽事件、统一数据模型，超越三支柱的演进
- [存储位置](./storage-location.md) — 对象存储、本地盘、多引擎存储
- [核心概念](./key-concepts.md) — 表、Region、时间索引、数据类型、视图、Flow
- [常见问题](./features-that-you-concern.md) — 更新、删除、TTL、压缩、高基数等 FAQ

## 延伸阅读

- [什么是可观测性 2.0？什么是可观测性 2.0 原生数据库？](https://greptime.cn/blogs/2025-04-24-observability2.0-greptimedb.html) — 下一代可观测性的愿景
- [事件管理革命：监控系统中统一日志和指标](https://greptime.cn/blogs/2024-06-25-logs-and-metrics)
- [GreptimeDB 存储引擎设计内幕](https://greptime.cn/blogs/2022-12-21-storage-engine-design)
