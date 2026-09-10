---
keywords: [Datanode, gRPC 服务, HTTP 服务, Heartbeat Task, Region Manager]
description: 介绍了 Datanode 的主要职责和组件，包括 gRPC 服务、HTTP 服务、Heartbeat Task 和 Region Manager。
---

# Datanode

## Introduction

Datanode 存储并处理 Region 数据。一张表可以包含多个 Region，但 Datanode 不负责表级路由。Frontend 按 Region 发送数据请求，Metasrv 则控制 Region 的放置和生命周期。

这个边界使同一个 Region server 可以承载不同的存储引擎，而不向 Frontend 或 Metasrv 暴露引擎实现。

![Frontend 向 Datanode Region server 发送 Region 请求，Metasrv 通过 heartbeat task 与 Datanode 交换生命周期指令。Region server 使用本地 query engine，并将请求分发给 Mito、Metric 或 File Region engine。](/datanode-architecture.zh.svg)

## Components

Datanode 包含以下主要组件：

- Region server 记录已打开的 Region，并把读写和生命周期请求分发给该 Region 注册的 engine。
- `Mito` 是主要的时序 Region engine。`Metric` 将多个逻辑指标 Region 映射到共享的 Mito Region，`File` 通过 Region 接口访问外部文件。
- 本地 query engine 执行 Region 查询计划。它不解析客户端 SQL，也不进行集群级规划。
- Heartbeat task 向 Metasrv 上报节点和 Region 状态，并接收 open、close、upgrade、downgrade 和迁移步骤等指令。
- gRPC 承载发往 Datanode 的 Region 请求；HTTP 提供 metrics 和配置等节点诊断信息。

## Region 请求生命周期

Mito 写入到达 Region server 后，Region server 根据 Region 元数据选择 Mito。Mito 将 mutation 追加到 WAL，写入 memtable，并在之后把 memtable flush 为 SST 文件。Metric 写入会先补充逻辑表标识，再委托给对应的物理 Mito Region。

读取时，本地 query engine 在 Region engine 提供的 table provider 上执行 Region 计划。Mito scan 获取不可变的 Region version，读取相关 memtable 和 SST 文件，合并并去重数据，最后返回 Arrow record batch 流。

Region 所有权可以在不重启 Datanode 的情况下改变。Metasrv 通过心跳流下发生命周期指令；Region server 将指令应用到对应 engine，并在后续心跳中上报新的 Region role 和统计信息。
