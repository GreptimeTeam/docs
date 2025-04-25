---
keywords: [Datanode, gRPC 服务, HTTP 服务, Heartbeat Task, Region Manager]
description: 介绍了 Datanode 的主要职责和组件，包括 gRPC 服务、HTTP 服务、Heartbeat Task 和 Region Manager。
---

# Datanode

## Introduction

`Datanode` 主要的职责是为 GreptimeDB 存储数据，我们知道在 GreptimeDB 中一个 `table` 可以有一个或者多个 `Region`, 
而 `Datanode` 的职责便是管理这些 `Region` 的读写。`Datanode` 不感知 `table`，可以认为它是一个 `region server`。
所以 `Frontend` 和 `Metasrv` 按照 `Region` 粒度来操作 `Datanode`。

![Datanode](/datanode.png)

## Components

一个 datanode 包含了 region server 所需的全部组件。这里列出了比较重要的部分：

- 一个 gRPC 服务来提供对 `Region` 数据的读写，`Frontend` 便是使用这个服务来从 `Datanode` 读写数据。
- 一个 HTTP 服务，可以通过它来获得当前节点的 metrics、配置信息等
- `Heartbeat Task` 用来向 `Metasrv` 发送心跳，心跳在 GreptimeDB 的分布式架构中发挥着至关重要的作用，
  是分布式协调和调度的基础通信通道，心跳的上行消息中包含了重要信息比如 `Region` 的负载，如果 `Metasrv` 做出了调度
  决定（比如 Region 转移），它会通过心跳的下行消息发送指令到 `Datanode`
- `Datanode` 不包含物理规划器（Physical planner）、优化器（optimizer）等组件（这些被放置在 `Frontend` 中），用户对
  一个或多个 `Table` 的查询请求会在 `Frontend` 中被转换为 `Region` 的查询请求，`Datanode` 负责处理这些 `Region` 查询请求
- 一个 `Region Manager` 用来管理 `Datanode` 上的所有 `Region`s
- GreptimeDB 支持可插拔的多引擎架构，目前已有的 engine 包括 `File Engine` 和 `Mito Engine`
