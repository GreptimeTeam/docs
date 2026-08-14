---
keywords: [架构, 计算存储分离, Metasrv, Frontend, Datanode, Flownode, 对象存储, WAL]
description: GreptimeDB 单机与分布式架构概览，包括组件职责，以及写入、查询和 Flow 路径。
---

# 架构

GreptimeDB 可以作为一个 standalone 进程运行，也可以组成分布式集群。Standalone 使用配置的本地存储或对象存储；分布式部署可以使用共享对象存储，把持久化数据文件与计算节点分离，分别调整计算和存储容量。

对象存储不是系统中唯一的状态。WAL 记录已接收的写入，Metasrv 管理集群 metadata 和 Region 路由，本地磁盘可以缓存远端数据。可用性和 failover 取决于 WAL 模式、Metasrv 部署、Region 放置、共享存储和可用 Datanode 等配置。

## 实时监控与历史分析，共用一套系统

分布式部署使用对象存储时，近期数据可以直接从内存读取，也可以由本地 cache 加速；长期数据保存在对象存储中，并通过同一个存储引擎和查询路径读取。实时监控和历史分析因此可以共用存储与查询基础，不需要分别维护一套在线系统和一套分析系统。

两类访问模式的资源需求仍然不同。Cache 大小、留存周期、compaction、查询并发、计算容量和资源隔离，都要根据近期查询和历史查询的实际比例规划。

## 高层架构

![GreptimeDB 分布式架构，包括数据路径、控制路径和各类存储的职责。](/greptimedb-distributed-architecture.zh.svg)

## 组件

分布式模式包含三个核心组件，以及一个可选的 Flow 运行时：

- [**Metasrv**](/contributor-guide/metasrv/overview.md)：管理 catalog、schema、table、Region 路由、procedure 和调度 metadata。
- [**Frontend**](/contributor-guide/frontend/overview.md)：接收客户端协议请求，执行鉴权和分布式查询规划，并根据 Metasrv metadata 转发读写请求。
- [**Datanode**](/contributor-guide/datanode/overview.md)：承载 Region，执行读写，记录 WAL，运行 compaction，并把数据文件持久化到配置的本地或对象存储后端。
- [**Flownode（可选）**](/contributor-guide/flownode/overview.md)：运行 [Flow](/user-guide/flow-computation/overview.md)任务，持续计算并把派生数据物化到 sink table。

Standalone 模式由一个 GreptimeDB 进程提供这些数据库能力，不需要分别部署各组件。

## 工作方式

下面描述分布式模式的处理路径。Standalone 在同一个进程中完成相应的数据库操作。

### 写入路径

1. 客户端通过支持的写入协议发送数据。
2. Frontend 从 Metasrv metadata 中解析 table 和 Region 路由。
3. Frontend 拆分请求，把数据行转发到承载目标 Region 的 Datanode。
4. Datanode 写入内存和配置的 [WAL](/user-guide/deployments-administration/wal/overview.md)，之后在达到 flush 条件时，最终将不可变数据文件写入表指定的[存储后端](./storage-location.md)。

### 查询路径

1. 客户端提交 SQL、PromQL，或明确支持的查询 API，例如 Jaeger 兼容接口。
2. Frontend 规划查询，并把任务下发到承载相关 Region 的 Datanode。
3. Datanode 读取内存数据和持久化文件，在适用时使用本地 cache 加速，并通过数据裁剪和索引执行查询，返回部分结果。
4. Frontend 合并结果并返回客户端。

### Flow 路径（可选）

启用 Flow 后，Flownode 持续处理写入源表的数据，维护计算结果，并把结果物化到 sink table。源表和 sink table 分别使用自己的 schema、TTL、索引和存储设置。详见 [Flow 计算](/user-guide/flow-computation/overview.md)。

各类存储的职责参见[存储位置](./storage-location.md)，实现细节参见 [Contributor Guide](/contributor-guide/overview.md)。
