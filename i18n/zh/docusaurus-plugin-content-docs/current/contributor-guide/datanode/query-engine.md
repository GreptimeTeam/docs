---
keywords: [查询引擎, Apache DataFusion, 逻辑计划, 物理计划, Arrow, 索引]
description: 介绍 GreptimeDB 基于 DataFusion 的查询规划和执行链路。
---

# Query Engine

## 介绍

GreptimeDB 查询引擎基于 [Apache DataFusion][1] 构建。`query` crate 负责 SQL、PromQL 和日志查询规划，以及 GreptimeDB optimizer rule、物理计划和执行。

![执行流程](/execution-procedure.png)

查询首先转换为 DataFusion 逻辑计划。SQL 及其他查询语言的 planner 会生成逻辑计划；分布式执行期间，Frontend 也会把序列化后的逻辑子计划发送给 Datanode。

Analyzer 和 optimizer rule 会规范化计划、下推过滤与投影、裁剪 Region，并插入 `MergeScan` 等 GreptimeDB extension node。该阶段同时使用 DataFusion 原生规则和 `src/query/src/optimizer/` 下的自定义规则。

物理 planner 将优化后的逻辑计划转换为 DataFusion `ExecutionPlan` 实现。执行根计划会返回异步 Arrow `RecordBatch` stream。可以使用 `EXPLAIN` 或 `EXPLAIN VERBOSE` 查看 SQL 语句对应的计划。

## 数据表示

GreptimeDB 使用 [Apache Arrow][2] array 和 `RecordBatch` 在内存中交换数据。存储扫描、查询算子、RPC stream 和结果编码器共享同一种列式表示，避免在执行链路中逐行转换。

## 索引

索引构建和持久化格式属于存储引擎，而不是查询引擎。Mito 使用 Parquet 统计信息、倒排索引、跳数索引和全文索引裁剪 SST 文件、row group 及数据段；feature-gated vector index 为向量搜索提供候选行。参见[数据持久化与索引](./data-persistence-indexing.md)。

查询层向扫描提供谓词和投影。兼容的谓词可以通过索引减少读取的数据量，但查询计划仍需执行其余过滤算子。

## 分布式查询

Frontend 将兼容的逻辑计划片段重写为远端 `MergeScan` 输入，使用 Substrait 序列化，再向 Datanode 发送 Region 级请求。参见[分布式查询](../frontend/distributed-querying.md)。

[1]: https://datafusion.apache.org/
[2]: https://arrow.apache.org/
