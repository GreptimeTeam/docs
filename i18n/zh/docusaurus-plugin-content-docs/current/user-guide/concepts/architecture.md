---
keywords: [基础架构, Metasrv, Frontend, Datanodes, 集群, 计算存储分离]
description: 介绍 GreptimeDB 的基础架构，包括 Metasrv、Frontend 和 Datanodes 三个主要组件及其协作方式。
---

# 基础架构

GreptimeDB 采用计算存储分离架构，数据持久化在对象存储（S3、Azure Blob 等），计算节点独立扩展。相比依赖本地盘做主存储的架构，弹性扩展更容易，成本也显著更低。

![architecture](/architecture-3.png)

## 组件

GreptimeDB 集群由三个核心组件构成：Datanode、Frontend 和 Metasrv。

- [**Metasrv**](/contributor-guide/metasrv/overview.md)：集群的控制中心。典型部署至少需要三个节点组成高可用小集群。负责管理数据库和表的元数据，包括数据在集群中的分布和请求路由。同时监控 Datanode 的可用性和性能，保持路由表最新。

- [**Frontend**](/contributor-guide/frontend/overview.md)：无状态组件，可按需水平扩展。接收客户端请求、鉴权、将多种协议转为内部 gRPC，根据 Metasrv 的分片路由信息将请求转发到对应的 Datanode。

- [**Datanode**](/contributor-guide/datanode/overview.md)：持有表的 Region 数据。接收 Frontend 转发的读写请求，执行查询和写入，返回结果。

这三个组件可以合并成一个二进制文件（standalone 模式），用于本地开发和嵌入式部署。

详细的组件协作机制参见 Contributor Guide 中的[架构说明](/contributor-guide/overview.md)。

## 工作流程

![组件交互](/how-it-works.png)

- 客户端通过多种协议与数据库交互，比如用 InfluxDB line protocol 写入数据，用 SQL 或 PromQL 查询。Frontend 是客户端连接的入口，Datanode 和 Metasrv 对客户端透明。
- 以 HTTP API 写入为例：Frontend 收到请求后，用对应的协议解析器解析请求体，从 Metasrv 的 catalog 中找到目标表。
- Frontend 通过推拉结合的策略缓存 Metasrv 的元数据，知道请求该发到哪个 Datanode 的哪个 Region。如果数据需要写到不同 Region，请求会被拆分并发到多个 Region。
- Datanode 收到请求后写入 Region，经由底层存储引擎最终落盘，然后向 Frontend 返回响应。
- Frontend 收齐所有 Datanode 的响应后，将结果返回给客户端。
