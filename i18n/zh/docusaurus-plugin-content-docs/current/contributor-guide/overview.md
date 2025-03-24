---
keywords: [架构, 关键概念, 数据处理, 组件交互, 数据库]
description: 介绍 GreptimeDB 的架构、关键概念和工作原理，包括各组件的交互方式和数据处理流程。
---

# 概述

## 架构

`GreptimeDB` 由以下关键组件组成：

- `Frontend`：通过多种协议提供读写服务，并将请求转发到 `Datanode`。
- `Datanode`：负责数据的持久化存储，例如存储到本地磁盘、S3 和 Azure Blob Storage 等。
- `Metasrv` 元数据存储和分布式调度：协调 `Frontend` 和 `Datanode` 之间的操作。

![Architecture](/architecture-3.png)

## 概念

为了更好地理解 `GreptimeDB`，需要介绍一些概念：

- `table` 是 `GreptimeDB` 中存储用户数据的地方，有表结构和有序的主键。`table` 通过其分区键被分割成称为 `region`。
- `region` 是表中的一个连续段，在某些关系型数据库中被视为分区。`region` 可以在多个 `datanode` 上复制，其中任何一个副本都可以支持读请求，但只有一个副本支持写请求。
- `datanode` 存储并为 `frontend` 提供 `region` 服务。一个 `datanode` 可以服务多个 `region`，一个 `region` 可以由多个 `datanode` 服务。
- `metasrv` 服务器存储集群的元数据，例如表、`datanode`、每个表的 `region` 等。它还协调 `frontend` 和 `datanode`。
- `frontend` 有一个 catalog 实现，它从 `metasrv` 中获取元数据，告诉相应的组件哪个 `table` 的 `region` 由哪个 `datanode` 提供服务。
- `frontend` 是一个无状态服务，用于接收客户端的请求。它作为 proxy 根据 catalog 中的信息将读取和写入请求转发到相应的 `datanode`。
- 表引擎（也称为存储引擎）决定了数据在数据库中的存储、管理和处理方式。每种引擎提供不同的功能特性、性能表现和权衡取舍。有关更多信息，请参阅[表引擎](/reference/about-greptimedb-engines.md)。
- 一个 `table` 的时间线 (time-series) 由其主键标识。因为 `GreptimeDB` 是一个时间序列数据库，所以每个 `table` 必须有一个时间戳列。`table` 中的数据将按其主键和时间戳排序，但顺序的实际实现方式比较特殊，可能会在将来发生变化。

## 工作原理

![Interactions between components](/how-it-works.png)

在深入了解每个组件之前，让我们先从高层次上了解一下 GreptimeDB 的工作原理。

- 用户可以通过各种协议与数据库交互，例如使用 `InfluxDB line Protocol` 插入数据，然后使用 SQL 或 PromQL 查询数据。`frontend` 是用户或客户端连接和操作数据库的组件，因此在其后面隐藏了 `datanode` 和 `metasrv`。
- 假设用户向 `frontend` 实例发送了 HTTP 请求来插入数据。当 `frontend` 接收到请求时，它会使用相应的协议解析器解析请求正文，并从 `metasrv` 的 catalog 中找到要写入的表。
- `frontend` 依靠推拉结合的策略缓存来自 `metasrv` 的元数据，因此它知道应将请求发送到哪个 `datanode`，或者更准确地说，应该发送到哪个 `region`。如果请求的内容需要存储在不同的 `region` 中，则请求可能会被拆分并发送到多个 `region`。
- 当 `datanode` 接收到请求时，它将数据写入 `region` 中，然后将响应发送回 `frontend`。写入 `region` 也意味着将数据写入底层的存储引擎中，该引擎最终将数据放置在持久化存储中。
- 当 `frontend` 从目标 `datanode`s 接收到所有响应时，就会将结果返回给用户。

有关每个组件的更多详细信息，请参阅以下指南：

- [frontend][1]
- [datanode][2]
- [metasrv][3]

[1]: frontend/overview.md
[2]: datanode/overview.md
[3]: metasrv/overview.md
