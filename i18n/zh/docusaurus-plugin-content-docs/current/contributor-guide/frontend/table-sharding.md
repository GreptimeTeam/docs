---
keywords: [表分片, 分区, Region, 数据存储, Region 自动移动]
description: 介绍 GreptimeDB 中表数据的分片方法，包括分区和 Region 的定义及其关系。
---

# 表分片

对于任何分布式数据库来说，数据的分片都是必不可少的。本文将描述 GreptimeDB 中的表数据如何进行分片。

## 分区

有关创建分区表的语法，请参阅用户指南中的[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md)部分。

## Region

在创建分区后，表中的数据被逻辑上分割。你可能会问："在 GreptimeDB 中，被逻辑上分区的数据是如何存储的？" 答案是保存在 `Region` 当中。

每个 `Region` 对应一个分区，并保存分区的数据。所有的 `Region` 分布在各个 `Datanode` 之中。我们的 `Metasrv` 会根据 `Datanode`
的状态在它们之间自动移动 `Region`。此外，`Metasrv` 还可以根据数据量或访问模式拆分或合并 `Region`。

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
