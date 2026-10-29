---
title: "GreptimeDB 概念概述"
keywords: [GreptimeDB, 特性, 数据模型, 架构, 存储位置, 核心概念]
description: GreptimeDB 概念概览，包括产品定位、数据模型、架构、存储位置和核心概念。
---

# 概念

GreptimeDB 是开源的可观测性数据库。它用同一个列式引擎处理 metrics、logs 和 traces，并支持以对象存储为持久化存储的可扩展部署。三类信号共享 Tag、Timestamp、Field 列语义，但可以使用不同的表、schema 和留存策略。

**从这里开始：**
- [为什么选择 GreptimeDB](./why-greptimedb.md) — 产品边界、统一处理、扩展方式、协议边界和部署形态
- [数据模型](./data-model.md) — Metrics、logs、traces 和事件数据共用的 Tag、Timestamp、Field 语义
- [架构](./architecture.md) — 单机与分布式部署、计算存储分离和组件职责

**深入了解：**
- [Observability 2.0 与宽事件](./observability-2.md) — 宽事件与原生信号的关系及工程取舍
- [语义层](./semantic-layer.md) — 描述每张表代表什么、遥测数据描述了哪些实体和关系的可选元数据
- [存储位置](./storage-location.md) — 本地存储、对象存储和按表选择的存储后端
- [核心概念](./key-concepts.md) — 表、Region、时间索引、数据类型、View 和 Flow
- [常见问题](./features-that-you-concern.md) — 更新、删除、TTL、压缩、高基数等技术边界

## 延伸阅读

- [什么是可观测性 2.0？什么是可观测性 2.0 原生数据库？](https://greptime.cn/blogs/2025-04-24-observability2.0-greptimedb.html) — 对宽事件思路的早期介绍
- [事件管理革命：监控系统中统一日志和指标](https://greptime.cn/blogs/2024-06-25-logs-and-metrics)
- [GreptimeDB 存储引擎设计内幕](https://greptime.cn/blogs/2022-12-21-storage-engine-design)
