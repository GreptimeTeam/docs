---
keywords: [基础架构, Metasrv, Frontend, Datanodes, 集群, 路由, 监测, 伸缩扩容, 数据存储, 读写请求]
description: 介绍 GreptimeDB 的基础架构，包括 Metasrv、Frontend 和 Datanodes 三个主要组成部分及其功能。
---

# 基础架构

![architecture](/architecture-3.png)

为了形成一个强大的数据库集群，并控制其复杂性，GreptimeDB 架构中有三个主要组成部分：Metasrv，Frontend 和 Datanode。

- [**Metasrv**](/contributor-guide/metasrv/overview.md) 控制着 GreptimeDB 集群的核心命令。在典型的部署结构中，至少需要三个节点才能建立一个可靠的 _Metasrv_ 小集群。_Metasrv_ 管理着数据库和表的信息，包括数据如何在集群中传递、请求的转发地址等。它还负责监测 `Datanode` 的可用性和性能，以确保路由表的最新状态和有效性。

- [**Frontend**](/contributor-guide/frontend/overview.md) 作为无状态的组件，可以根据需求进行伸缩扩容。它负责接收请求并鉴权，将多种协议转化为 GreptimeDB 集群的内部 gRPC 协议，并根据 _Metasrv_ 中的表的分片路由信息将请求转发到相应的 _Datanode_。

- [**Datanode**](/contributor-guide/datanode/overview.md) 负责 GreptimeDB 集群中的表的 `region` 数据存储，接收并执行从 _Frontend_ 发来的读写请求，处理查询和写入，并返回对应的结果。

通过灵活的架构设计，以上三个组件既可以是集群分布式部署，也可以合并打包在一个二进制包内，支持本地部署下的单机模式，我们称之为 standalone 模式。
