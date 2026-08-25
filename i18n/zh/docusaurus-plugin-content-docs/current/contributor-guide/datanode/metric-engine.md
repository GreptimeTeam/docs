---
keywords: [Metric 引擎, 逻辑表, 物理表, Mito, Prometheus]
description: 介绍 Metric 引擎面向大量指标表的逻辑到物理存储模型。
---

# Metric 引擎

## 概述

Metric 引擎是一种 `RegionEngine` 实现，面向包含大量小指标表的 Prometheus 类 workload。它把多个逻辑表复用到共享的 Mito 物理 Region 中，在保留表级读写接口的同时，降低每张表的元数据和存储开销。

Metric 引擎不实现另一套磁盘格式。它重写逻辑请求，再将物理存储、索引和扫描委托给 Mito。

## 概念

### 逻辑表

逻辑表是对用户暴露的表，拥有独立的 Schema 和 Table ID。用户写入和查询都以逻辑表为目标；在内部，每个逻辑 Region 会记录实际存储数据的物理 Region。

写入时，Metric 引擎把逻辑表身份写入每一行，再将请求转发到物理数据 Region。读取时，它添加逻辑表过滤条件，只返回属于目标逻辑表的数据。

### 物理表

物理表持有共享 Region。每个物理 Region 由一对 Mito Region 表示：

- 数据 Region，保存多个逻辑表的数据行；
- 元数据 Region，保存 Metric 引擎使用的逻辑表和逻辑列映射。

直接写入物理 Region 会绕过逻辑表映射，因此会被拒绝；查询物理表仍然受支持。

## 架构及设计

关联到同一物理表的逻辑表使用相同的分区布局。逻辑 Region ID 映射到对应的物理数据 Region 和元数据 Region，映射关系由 Metric 引擎及表路由元数据共同维护。

`row_modifier.rs` 和 `batch_modifier.rs` 将逻辑表身份与时间序列身份编码到 Mito 内部列中。根据物理 Region 的主键编码方式，具体表示为 `__table_id` 与 `__tsid` 列，或稀疏编码的 `__primary_key`。读取路径在委托 Mito 扫描前始终添加逻辑 Table ID 条件。

Metric 引擎为影响大量逻辑表的操作提供批量 DDL 路径，避免在 Prometheus Remote Write 自动建表或物理 Region 迁移时为每张表单独修改元数据。这里的 DDL 指数据定义语言操作；逻辑表的普通插入、删除和查询仍使用标准 Region 请求路径。

主要实现位于 `src/metric-engine/src/`。修改保留列、Region ID 转换或元数据编码会影响持久化数据，必须审查向后兼容性。
