---
keywords: [表分片, 分区, Region, 数据存储, Region 自动移动]
description: 介绍 GreptimeDB 中表数据的分片方法，包括分区和 Region 的定义及其关系。
---

# 表分片

GreptimeDB 将一张表分为多个 Region。分区表达式定义每行数据属于哪个 Region，Region 路由则定义当前由哪个 Datanode 持有该 Region。

<AnchorAlias id="partition" />

## 分区

分区是由一个或多个列上的表达式描述的逻辑行集合。分区布局需要覆盖表的输入域，使每一行都能找到唯一的目标 Region。SQL 语法和支持的表达式参见[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md)。

## Region

每个分区对应一个 Region。Region ID 是 Frontend、Datanode 和 Metasrv 用于存储和路由的标识。同一张表的多个 Region 可以放在同一个 Datanode 上。

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

## 路由与剪枝

写入时，Frontend 对每行数据计算分区规则，按 Region 分组，再根据路由表把 Region 请求发送到当前 leader。

查询时，分布式 planner 将查询谓词与分区表达式比较，只扫描可能满足谓词的 Region。如果分区元数据缺失或无法安全解释，planner 会退化为扫描所有 Region，避免漏掉数据。

## 调整分区布局

[Repartition](/user-guide/deployments-administration/manage-data/repartition.md) 通过显式的 split 或 merge 调整已有布局。Metasrv 以持久化 procedure 执行变更，更新 Region 路由和分区表达式，并使旧的表路由缓存失效。Frontend 刷新到新元数据后，后续请求使用新的布局。
