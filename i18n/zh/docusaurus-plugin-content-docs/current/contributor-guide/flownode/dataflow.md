---
keywords: [旧流处理模式, Dataflow, DFIR, 差分数据, Flow]
description: 介绍 Flownode 旧 streaming 执行路径使用的内部计算图。
---

# 数据流

本文说明 Flownode 旧 streaming 模式使用的计算图。新的持续聚合工作使用[批处理模式](./batching_mode.md)，不能根据本页推断 batching 行为。

Streaming 路径通过 `src/flow/src/transform.rs` 将 Flow 定义转换为 `plan.rs` 中的 typed plan。`src/flow/src/compute/render.rs` 把受支持的 plan node 渲染为 DFIR 风格的 dataflow graph，`src/flow/src/adapter/` 下的 worker 持有并执行这些 graph。

内部记录使用差分行 `(row, timestamp, diff)`。`row` 保存值，`timestamp` 跟踪 dataflow 进度，`diff` 表示插入（`+1`）、删除（`-1`）等 multiplicity 变更。算子沿执行图传递这些变更，从而增量更新聚合状态和 sink 输出。

Typed plan 可以表示 map/filter/project、reduce、join 和 union 节点。当前 streaming renderer 可以执行 map/filter/project 和 reduce；join 与 union 的渲染仍返回 not-implemented 错误。添加算子时必须同时检查 `plan.rs` 和 `compute/render.rs`，因为能出现在计划中并不等于已经可以执行。
