---
keywords: [Flownode, batching mode, streaming mode, Dataflow, 脏时间窗口]
description: 介绍 Flownode 如何选择并运行 batching 和旧 streaming 两条执行路径。
---

# 数据流

Flownode 内部有两条执行路径：

- **Batching mode** 是聚合和 TQL workload 的主要执行路径。它查询已经持久化的 source 数据，并将物化结果写入 sink table。
- **Streaming mode** 是为兼容已有 workload 而保留的旧执行路径，不推荐新 workload 使用。Frontend 会把新到达的行同步给它进行增量处理。

用户不能直接选择执行模式。创建 Flow 时，GreptimeDB 根据查询和 source table 的属性选择执行路径。聚合、`DISTINCT` 和 TQL 查询使用 batching mode；简单的非聚合查询，以及任何 source table 使用 `ttl = 'instant'` 的 Flow，目前仍使用 streaming mode。如果 source table 尚不存在并选择延迟创建，Flow 会先成为 pending batching Flow。

## Batching mode

Batching mode 复用 GreptimeDB 的查询引擎，不需要为每一行输入维护一张算子图。对于基于时间窗口的 Flow，主循环如下：

1. Source table 收到写入后，把受影响的时间窗口标记为 dirty。
2. `BatchingTask` 按求值调度或自适应轮询节奏运行，并在该次求值时收集待处理的 dirty window。标记 dirty window 不会唤醒任务。
3. 任务把这些窗口转换成时间谓词，加入 Flow 查询，再请求 Frontend 查询 source table。
4. 查询结果写入 sink table，更新已重新计算窗口对应的物化结果。
5. 成功处理的窗口从 dirty set 中移除；执行失败的工作仍可在后续调度中处理。

设置了 evaluation interval、但查询中没有时间窗口表达式的 Flow，会在每次调度时执行完整查询。这条路径还可以使用 streaming renderer 尚未实现的查询引擎能力。任务和 dirty window 组件的进一步说明见 [Flownode 批处理模式开发者指南](./batching_mode.md)。

## Streaming mode

Dataflow 模块（参见 `flow::compute` 模块）是 `flow` 的核心计算模块。
它接收 SQL 查询并将其转换为 `flow` 的内部执行计划。
然后，该执行计划被转化为实际的数据流，而数据流本质上是一个由带有输入和输出端口的函数组成的有向无环图（DAG）。
新到达的行变更会增量驱动这张图执行。

Renderer 支持 map/filter/project 和 reduce 操作。执行计划中已经有 join 和 union 节点，但 streaming renderer 尚未实现它们。

在内部，数据流使用 `tuple(row, time, diff)` 以行格式处理数据。
这里 `row` 表示实际传递的数据，可能包含多个 `value` 对象。
`time` 是系统时间，用于跟踪数据流的进度，`diff` 通常表示行的插入或删除（+1 或 -1）。
因此，`tuple` 表示给定系统时间的 `row` 的插入/删除操作。有状态算子通过 [Arrangement](./arrangement.md) 保存这些变更的索引 trace。
