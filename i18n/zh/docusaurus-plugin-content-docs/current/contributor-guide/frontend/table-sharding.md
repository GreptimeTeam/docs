---
keywords: [表分片, 分区, Region, 数据存储, Region 自动移动]
description: 介绍 GreptimeDB 中表数据的分片方法，包括分区和 Region 的定义及其关系。
---

# 表分片

GreptimeDB 将表拆分为分区，并把每个分区存储在一个 Region 中。本文说明这两个对象在实现上的关系。

<AnchorAlias id="partition" />

## 分区

有关创建分区表的语法，请参阅用户指南中的[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md)部分。

## Region

每个分区对应一个 Region。Region 是由 Datanode 管理的存储和调度单元，Metasrv 保存 Region 到 Datanode 的路由信息。如果建表后需要调整分区布局，
GreptimeDB 支持通过显式的 [repartition](/user-guide/deployments-administration/manage-data/repartition.md) 操作拆分或合并分区。

分区和 Region 的关系参见下图：

```text
                       ┌───────┐
                       │       │
                       │ Table │
                       │       │
                       └───┬───┘
                           │
        Range [Start, end) │ Horizontally Split Data
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │                  │                  │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │           │      │           │      │           │
  │ Partition │      │ Partition │      │ Partition │
  │           │      │           │      │           │
  │    P0     │      │    P1     │      │    Px     │
  └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
        │                  │                  │
        │                  │                  │
┌───────┼──────────────────┼───────┐          │  Partition 和 Region 是一一对应的
│       │                  │       │          │
│ ┌─────▼─────┐      ┌─────▼─────┐ │    ┌─────▼─────┐
│ │           │      │           │ │    │           │
│ │   Region  │      │   Region  │ │    │   Region  │
│ │           │      │           │ │    │           │
│ │     R0    │      │     R1    │ │    │     Ry    │
│ └───────────┘      └───────────┘ │    └───────────┘
│                                  │
└──────────────────────────────────┘
     可以放在同一个 Datanode 之中
```
