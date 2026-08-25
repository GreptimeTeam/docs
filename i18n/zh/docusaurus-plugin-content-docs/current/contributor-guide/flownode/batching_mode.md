---
keywords: [批处理模式, BatchingEngine, 脏时间窗口, checkpoint, 持续聚合]
description: 介绍批处理模式的任务生命周期、脏窗口处理和恢复不变量。
---

# Flownode 批处理模式开发者指南

批处理模式通过重新执行可能受源数据变更影响的 Flow 查询来维护 sink 表，是当前持续开发的 Flownode 执行路径。模式选择属于内部行为，参见 [Flownode 概览](./overview.md)。

## 概述

对于按时间窗口计算的 Flow，源表写入会把对应窗口标记为脏。后台任务消费这些窗口；如果查询形态允许，任务会给 Flow 查询添加时间谓词，然后把 insert plan 发送到 Frontend。Frontend 执行查询并将结果写入 sink 表。

按固定间隔执行的 Flow 和 TQL Flow 可能需要执行完整查询，不能使用脏窗口过滤。因此，batching 路径会根据 Flow 定义，把脏窗口视为需要重算的精确范围，或视为需要执行完整查询的信号。

## 架构

### `BatchingEngine`

`src/flow/src/batching_mode/engine.rs` 中的 `BatchingEngine` 持有 `FlowId` 到 `BatchingTask` 的映射。它负责创建和删除任务、处理 flush 请求，并将脏窗口通知分发给所有读取相关源表的 Flow。

创建任务时会解析 Flow 查询，记录源表和 sink 表，在需要时创建 sink 表，并初始化执行状态。Flow 自身的元数据由 `common-meta` 持久化。

### `BatchingTask`

每个 `BatchingTask` 对应一个 Flow。`TaskConfig` 保存不可变的查询、表、窗口、过期时间及调度配置，`TaskState` 保存可变的执行状态。

后台循环等待调度时间或通知，生成下一次 insert plan，通过 `FrontendClient` 执行并记录结果。Execution lock 会串行化后台执行、手动 flush、计划生成和 checkpoint 更新，避免两个执行过程同时消费同一份状态。

### `TaskState` 和 `DirtyTimeWindows`

`DirtyTimeWindows` 保存需要重新计算且互不重叠的时间范围。生成计划时会从队列中取出数量受限的一组范围。如果计划生成或执行失败，这些范围会重新放回队列；任务不会因为一次执行已经开始就直接丢弃它们。

`TaskState` 还为实验性的增量读取路径保存每个 Region 的 checkpoint。只有执行结果为参与查询的 Region 提供完整 watermark 证明时，增量模式才会推进 checkpoint。按范围执行 full-snapshot repair 时，任务会冻结 high watermark 并逐步处理脏窗口；期间的新写入仍保留在 live queue。Repair 失败或 watermark 证明不完整时，尚未完成的窗口会返回队列。

增量读取通过 `experimental_enable_incremental_read` 控制，默认关闭。关闭该选项或查询形态不兼容时，任务使用 full-snapshot 执行。

### `TimeWindowExpr`

`src/flow/src/batching_mode/time_window.rs` 中的 `TimeWindowExpr` 负责计算 `date_bin` 等窗口表达式。它把输入时间戳映射到窗口边界，并提供合并范围及生成谓词所需的窗口大小。

## 查询执行流程

1. 源表写入或显式 mark-dirty 请求确定受影响的 Flow 和时间范围。
2. `BatchingEngine` 将范围加入任务的 `DirtyTimeWindows`，并在需要时唤醒任务。
3. `BatchingTask` 取出数量受限的一组窗口，构建带过滤条件的 insert plan；无法安全限定范围的 Flow 则执行完整查询。
4. `FrontendClient` 将序列化逻辑计划发送到 Frontend。Frontend 执行查询并把结果写入 sink 表。
5. 执行成功后，任务提交执行状态，并且只推进有返回 watermark 证明的 checkpoint；执行失败时，先恢复已取出的窗口，再等待下一次重试。

修改 plan coverage、checkpoint 推进或脏窗口恢复逻辑会影响正确性。尚未反映到 sink 表的工作不能被清除，checkpoint 也不能越过结果已证明包含的数据范围。
