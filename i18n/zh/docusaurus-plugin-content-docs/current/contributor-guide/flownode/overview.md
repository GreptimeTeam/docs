---
keywords: [Flownode, 流处理, FlownodeManager, FlowWorker]
description: 介绍了 Flownode 的基本概念、组件和当前版本的支持情况，包括 FlownodeManager、FlowWorker 和 Flow 的功能。
---

# Flownode

## 简介

`Flownode` 为数据库提供了一种简单的流处理（称为 `flow`）能力。
`Flownode` 管理 `flow`，这些 `flow` 是从 `source` 接收数据并将数据发送到 `sink` 的任务。

`Flownode` 支持 `standalone` 和 `distributed` 两种模式。在 `standalone` 模式下，`Flownode` 与数据库运行在同一进程中。在 `distributed` 模式下，`Flownode` 运行在单独的进程中，并通过网络与数据库通信。

## 组件

`Flownode` 包含了 flow 流式处理的所有组件，以下是关键部分：

- `FlownodeManager`：用于接收从 `Frontend` 转发的插入数据并将结果发送回 flow 的 sink 表。
- 一定数量的 `FlowWorker` 实例，每个实例在单独的线程中运行。当前在单机模式中只有一个 flow worker，但这可能会在未来发生变化。
- `Flow` 是一个主动从 `source` 接收数据并将数据发送到 `sink` 的任务。由 `FlownodeManager` 管理并由 `FlowWorker` 运行。
