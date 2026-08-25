---
keywords: [Flownode, 持续聚合, 批处理模式, 流处理模式, Flow]
description: 介绍 Flownode 的执行模式、路由边界和实现目录。
---

# Flownode

## 简介

Flownode 是 GreptimeDB Flow 的执行组件，负责根据源表持续计算结果并写入 sink 表。单机模式下它运行在 GreptimeDB 进程内，分布式模式下则作为独立服务运行。

Flownode 包含两条执行路径：

- **批处理模式**是当前持续开发的路径。它跟踪受影响的时间窗口，并定期通过 Frontend 执行聚合查询。参见[批处理模式开发者指南](./batching_mode.md)。
- **流处理模式**是旧的增量 dataflow 路径。它在 worker 持有的计算图中处理行级变更，目前仅为兼容性保留。

用户不能直接选择执行模式。`flow_type` 是保留的内部元数据。创建 Flow 时，`src/operator/src/statement/ddl.rs` 中的 `StatementExecutor::determine_flow_type` 决定执行模式，Flownode 内部再由 `FlowDualEngine` 完成兼容路由。

## 组件

- `src/flow/src/engine.rs` 中的 `FlowEngine` 定义两条路径共用的创建、删除、flush 和 insert 生命周期。
- `src/flow/src/adapter/flownode_impl.rs` 中的 `FlowDualEngine` 把每个 Flow 路由到 batching engine 或 streaming engine。
- `src/flow/src/batching_mode/` 包含时间窗口跟踪、任务调度、Frontend RPC、sink 表创建和 checkpoint 逻辑。
- `src/flow/src/adapter/`、`compute/`、`expr/` 和 `plan.rs` 实现旧的 streaming 路径。
- `src/flow/src/server.rs` 提供 Flownode gRPC 服务；`heartbeat.rs` 向 Metasrv 报告 Flownode 状态。
- 持久化 Flow 元数据和 DDL Procedure 位于 `src/common/meta/`，不属于 `flow` crate。

修改某一种执行模式时，必须同时检查 `FlowDualEngine` 和共享元数据契约，不能默认一条路径的修复也适用于另一条路径。
