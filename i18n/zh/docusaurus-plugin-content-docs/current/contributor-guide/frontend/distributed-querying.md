---
keywords: [分布式查询, DistPlannerAnalyzer, MergeScan, Substrait, Region 裁剪]
description: GreptimeDB 如何将逻辑查询计划划分为本地和远端执行阶段。
---

# 分布式查询

Frontend 和 Datanode 使用同一套基于 DataFusion 的查询引擎。在分布式模式下，Frontend 会增加一个规划步骤，将 Datanode 上执行的工作与 Frontend 上完成的工作分开。

![Frontend query](/frontend-query.png)

## 分布式规划器

`src/query/src/dist_plan/analyzer.rs` 中的 `DistPlannerAnalyzer` 会重写 DataFusion 逻辑计划。它将可下推的算子移向表扫描，并用 `MergeScan` 节点包装远端子计划。规划器根据算子的交换律和计划形态判断哪些工作可以安全地在各 Datanode 执行；不支持的计划形态保留在 Frontend，或使用配置允许的 fallback 路径。

分区列上的过滤条件同时用于裁剪 Region。执行前，Frontend 通过 `FrontendRegionQueryHandler` 将每个入选 Region 解析到对应 Datanode。

初始设计及交换律规则参见[分布式规划器 RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2023-05-09-distributed-planner.md)。

## 分布式计划

`MergeScan` 的远端输入是一个完整的逻辑子计划。Frontend 使用 Substrait 对子计划进行序列化，并向选定的 Datanode 发送 Region 级查询请求。Datanode 针对本地 Region 规划并执行该子计划，再以 Arrow RecordBatch stream 返回结果。

Frontend 合并远端数据流，并执行无法下推的算子。这个边界并不局限于逻辑计划中的 `TableScan` 节点：过滤、投影、部分聚合以及其他兼容算子都可能进入远端子计划。
