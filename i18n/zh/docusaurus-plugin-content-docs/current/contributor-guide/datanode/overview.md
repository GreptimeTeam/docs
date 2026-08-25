---
keywords: [Datanode, RegionServer, 存储引擎, 查询引擎, 心跳]
description: 介绍 Datanode 在 Region 级别的存储和查询职责。
---

# Datanode

<AnchorAlias id="introduction" />

## 介绍

Datanode 存储表数据，并在本地 Region 上执行查询。一张表可以包含多个 Region，但 Datanode 不把表作为元数据对象管理。Frontend 和 Metasrv 通过 Region 级请求访问 Datanode，因此它的核心抽象是 Region server。

<AnchorAlias id="components" />

## 组件

- `src/datanode/src/region_server.rs` 中的 `RegionServer` 将 Region 请求分发到已注册的存储引擎，并向查询层提供 Region 数据。
- gRPC 服务接收 Frontend 和 Metasrv 发出的 Region 读写及生命周期操作。
- 本地查询引擎规划并执行 Frontend 发送的逻辑子计划。Datanode 不解析客户端 SQL，也不负责协调分布式查询。
- 心跳任务向 Metasrv 报告节点和 Region 状态，并接收 Region 打开、关闭、迁移及缓存失效等控制消息。
- HTTP handler 提供指标、配置等运维端点。
- Datanode 注册 Mito、Metric 和 File 三种 Region engine。Mito 是主要的时序存储引擎；Metric 面向大量指标表的场景，并将物理存储委托给 Mito；File 用于访问外部文件中的数据。

单机模式下，同一个 Region server 在进程内运行，不需要 Metasrv 协调。分布式模式下，Region 的可写状态和生命周期变更由 Metasrv 租约及心跳消息协调。
