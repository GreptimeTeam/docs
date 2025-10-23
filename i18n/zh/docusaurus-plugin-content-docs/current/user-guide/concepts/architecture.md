---
keywords: [基础架构, Metasrv, Frontend, Datanodes, 集群, 路由, 监测, 伸缩扩容, 数据存储, 读写请求]
description: 介绍 GreptimeDB 的基础架构，包括 Metasrv、Frontend 和 Datanodes 三个主要组成部分及其功能。
---

# 基础架构

![architecture](/architecture-3.png)

## 组件

为了形成一个强大的数据库集群，并控制其复杂性，GreptimeDB 架构中有三个主要组成部分：Metasrv，Frontend 和 Datanode。

- [**Metasrv**（元数据服务器）](/contributor-guide/metasrv/overview.md) 控制着 GreptimeDB 集群的核心命令。在典型的部署结构中，至少需要两个节点才能建立一个可靠的 Metasrv 小集群。Metasrv 管理着数据库和表的信息，包括数据如何在集群中传递、请求的转发地址等。它还负责监测 `Datanode` 的可用性和性能，以确保路由表的最新状态和有效性。

- [**Frontend**（前端服务）](/contributor-guide/frontend/overview.md) 作为无状态的组件，可以根据需求进行伸缩扩容。它负责接收请求并鉴权，将多种协议转化为 GreptimeDB 集群的内部 gRPC 协议，并根据 Metasrv 中的表的分片路由信息将请求转发到相应的 Datanode。

- [**Datanode**（数据节点）](/contributor-guide/datanode/overview.md) 负责 GreptimeDB 集群中的表的 `region` 数据存储，接收并执行从 Frontend 发来的读写请求，处理查询和写入，并返回对应的结果。

通过灵活的架构设计，以上三个组件既可以是集群分布式部署，也可以合并打包在一个二进制包内，支持本地部署下的单机模式，我们称之为 standalone 模式。

## 组件交互

![Interactions between components](/how-it-works.png)

- 你可以通过多种协议与数据库交互，例如使用 InfluxDB line Protocol 插入数据，然后使用 SQL 或 PromQL 查询数据。Frontend 是客户端连接和操作数据库的组件，因此在其后面隐藏了 Datanode 和 Metasrv。
- 假设客户端向 Frontend 实例发送了 HTTP 请求来插入数据。当 Frontend 接收到请求时，它会使用相应的协议解析器解析请求正文，并从 Metasrv 的 catalog 中找到要写入的表。
- Frontend 依靠推拉结合的策略缓存来自 Metasrv 的元数据，因此它知道应将请求发送到哪个 Datanode，或者更准确地说，应该发送到哪个 Region。如果请求的内容需要存储在不同的 Region 中，则请求可能会被拆分并发送到多个 Region。
- 当 Datanode 接收到请求时，它将数据写入 Region 中，然后将响应发送回 Frontend。写入 Region 也意味着将数据写入底层的存储引擎中，该引擎最终将数据放置在持久化存储中。
- 当 Frontend 从目标 Datanode 接收到所有响应时，就会将结果返回给用户。


