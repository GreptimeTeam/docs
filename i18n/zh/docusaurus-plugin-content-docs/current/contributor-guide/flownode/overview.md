---
keywords: [流处理, flow 管理, 单机模式, Flownode 组件, Flownode 限制]
description: Flownode 概览，一个为数据库提供流处理能力的组件，包括其组件和当前的限制。
---

# Flownode

## 简介

`Flownode` 为数据库提供了一种简单的流处理（称为 `flow`）能力。
`Flownode` 管理 `flow`，这些 `flow` 是从 `source` 接收数据并将数据发送到 `sink` 的任务。

`Flownode` 支持 `standalone`（单机）和 `distributed`（分布式）两种模式。在 `standalone` 模式下，`Flownode` 与数据库运行在同一进程中。在 `distributed` 模式下，`Flownode` 运行在单独的进程中，并通过网络与数据库通信。

一个 flow 有两种执行模式：
- **流处理模式 (Streaming Mode)**: 原始的模式，数据在到达时即被处理。
- **批处理模式 (Batching Mode)**: 一种为持续数据聚合设计的较新模式。它在离散的、微小的时间窗口上周期性地执行用户定义的 SQL 查询。目前所有的聚合查询都使用此模式。更多详情，请参阅[批处理模式开发者指南](./batching_mode.md)。

## 组件

`Flownode` 包含了执行一个 flow 所需的所有组件。所涉及的具体组件取决于执行模式（流处理 vs. 批处理）。在较高的层面上，关键部分包括：

- **Flow Manager**: 一个负责管理所有 flow生命周期的中心组件。
- **Task Executor**: flow 逻辑执行的运行时环境。在流处理模式下，这通常是一个 `FlowWorker`；在批处理模式下，它是一个 `BatchingTask`。
- **Flow Task**: 代表一个独立的、单个的数据流，包含将数据从 source 转换为 sink 的逻辑。
