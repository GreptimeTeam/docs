---
keywords: [查询引擎, DataFusion, 逻辑计划, 物理计划]
description: 介绍了 GreptimeDB 的查询引擎架构，基于 Apache DataFusion 构建，涵盖逻辑计划、物理计划、优化和执行过程。
---

# Query Engine

## 介绍

GreptimeDB 的查询引擎基于 [Apache DataFusion][1]。DataFusion 提供逻辑计划、物理计划、优化器框架和执行运行时；GreptimeDB 在此基础上增加各查询语言的 planner、存储相关优化规则、自定义计划节点和分布式执行。

DDL 和其他控制面操作由 statement executor 分发。Query engine 接收数据处理计划，包括 `INSERT ... SELECT` 等操作中读取输入数据的部分。

## 查询生命周期

1. SQL、PromQL 或日志查询 planner 通过 catalog 解析表，并生成 DataFusion logical plan。DataFusion 不直接支持的操作由 GreptimeDB plan extension 表示。
2. DataFusion 的 analyzer 和 optimizer rule 与 GreptimeDB rule 共同运行。这些规则规范化表达式和类型、改写时间范围操作、将 projection 和 filter 下推到 scan，并在需要时引入分布式计划节点。
3. Physical planner 将优化后的 logical plan 转换为流式 operator。GreptimeDB 随后应用 scan 并行度、排序和分布式执行相关的 physical rule。
4. 执行阶段通过 physical plan 拉取 Arrow record batch。存储 scan 接收 projection 和 predicate，下游 operator 消费数据流，无需先物化完整结果。

使用 [`EXPLAIN`](/reference/sql/explain.md) 查看逻辑和物理计划。`EXPLAIN ANALYZE` 还会执行计划并报告运行时指标。

## 数据表示

GreptimeDB 使用 [Apache Arrow][2] record batch 作为内存数据表示。一个 record batch 包含等长的列数组和 schema。查询 operator 交换这些 batch 组成的数据流，使 Region scan 到结果编码的执行路径保持列式处理。

## 索引

索引构建和持久化格式属于存储引擎。查询层向 scan 提供 predicate 和 projection，Mito 再利用时间范围、Parquet 统计信息和索引跳过不可能匹配的数据。参见[数据持久化与索引](./data-persistence-indexing.md)。

<AnchorAlias id="分布式查询" />

## 分布式执行

分布式模式下，Frontend 规划集群级查询，Datanode 执行 Region 本地子计划。[`MergeScan`][6] 是两个阶段之间的边界。

[1]: https://datafusion.apache.org/
[2]: https://arrow.apache.org/
[6]: ../frontend/distributed-querying.md
