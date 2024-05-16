# 概览

## 简介


Flownode “为数据库提供了一种简单的流式处理能力（称为 `flow`）。
Flownode “管理 `flow`，`flow` 是主动从作为数据源的表接收数据并将计算结果发送到结果表的任务。

在当前版本中，`Flownode` 仅支持 Standalone 模式。未来，我们将支持分布式模式。

## 组件

一个 `Flownode` 包含流的流处理过程所需的所有组件。在此，我们列出了其中的重要部分：

- `FlownodeManager`，用于接收从 ”前端 "转发的插入信息，并将结果发送回流的汇表。
- 一定数量的 `FlowWorker` 实例，每个实例在单独的线程中运行。目前，Standalone 模式下只有一个 `FlowWorker`，但将来可能会改变。
- `flow` 是一个主动从作为数据源的表接收数据，并向结果表发送数据的任务。它由 `FlownodeManager` 管理，并由 `FlowWorker` 运行。