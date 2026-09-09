---
keywords: [分布式查询, 逻辑计划, MergeScan, Substrait, Region 裁剪]
description: 介绍 GreptimeDB 如何把逻辑查询计划划分为 Frontend 和 Datanode 上的执行任务。
---

# 分布式查询

Frontend 和 Datanode 使用同一套基于 DataFusion 的查询引擎。在分布式模式下，Frontend 会增加一个规划步骤，将 Datanode 上执行的工作与 Frontend 上完成的工作分开。

![Frontend query](/frontend-query.png)

## 分布式规划

分布式规划器重写逻辑计划，把可以下推的算子移向表扫描，并用 `MergeScan` 节点包装远端子计划。分区列上的谓词还会在任务调度前用于裁剪 Region。

算子能否下推取决于计划形态和算子本身的性质。不支持的部分会保留在 Frontend。初始设计及交换律规则参见[分布式规划器 RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-05-09-distributed-planner.md)。

## 分布式计划

远端输入是完整的逻辑子计划，并不局限于表扫描。Frontend 使用 [Substrait](https://substrait.io) 序列化子计划，再向持有相应数据的 Datanode 发送 Region 级请求。Datanode 在本地规划并执行子计划，将结果流返回 Frontend。Frontend 合并远端数据流，并执行没有下推的算子。
