---
keywords: [Metasrv, 元数据, 路由, Leader 选举, Procedure, 心跳]
description: 介绍 Metasrv 提供的元数据及集群协调机制。
---

# Metasrv

## Metasrv 包含什么

Metasrv 是 GreptimeDB 分布式集群中的元数据和协调服务，不参与数据读写链路。它主要负责：

- 存储 Catalog、Schema、Table、Region、路由和节点元数据；
- 为新 Region 选择 Datanode，并维护表路由；
- 选举一个 Metasrv leader 负责协调元数据变更；
- 通过可恢复的 Procedure 执行 DDL、Region 迁移、故障转移和 repartition；
- 通过心跳维护节点租约和 Region 统计信息；
- 在缓存元数据或 Region 状态变化时通知 Frontend 和 Datanode。

## 前端如何与 Metasrv 交互

Frontend 从 Metasrv 获取表元数据和 Region 路由，并缓存在本地。修改元数据的语句会发送给 Metasrv leader；普通读写则使用缓存的路由直接访问 Datanode。

控制链路和数据链路相互分离：

```text
Frontend
  |-- 元数据查询和 DDL -------------------> Metasrv leader
  `-- Region 读写 ------------------------> Datanode

Metasrv leader
  |-- Region 生命周期 Procedure ----------> Datanode
  `-- 缓存和 Region 状态通知 -------------> Frontend / Datanode

Datanode
  `-- 心跳、租约续期和 Region 统计信息 ----> Metasrv leader
```

表路由把每个 Region 映射到当前 Datanode peer，其中没有单独的只读副本列表：

```text
Table route
  |-- Region 0 -> Datanode A
  |-- Region 1 -> Datanode B
  `-- Region 2 -> Datanode C
```

Region 迁移或故障转移会修改这项映射。Frontend 刷新缓存路由后，再把后续读写发送给新的 peer。

### 创建表

1. Frontend 向 Metasrv leader 提交 DDL 请求。
2. Metasrv 根据分区规则确定 Region，并为每个 Region 选择 Datanode。
3. 持久化的 Procedure 创建 Region，并写入表元数据和路由。发生 leader 切换后，Procedure 可以从已保存的状态继续执行。
4. 元数据提交后，Metasrv 通知 Frontend 刷新相关缓存。

### `Insert`

Frontend 解析表路由，按照分区规则拆分数据行，再把各 Region 的写入发送到对应 Datanode。路由发生变化时，相关缓存会失效，Frontend 随后从 Metasrv 重新获取元数据。

### `Select`

Frontend 在查询规划期间使用表和 Region 元数据。分区列上的谓词用于裁剪 Region，分布式查询引擎再把任务发送给持有这些 Region 的 Datanode。参见[分布式查询](../frontend/distributed-querying.md)。

## Metasrv 架构

Metasrv 由几类协调机制组成：

- 元数据层通过 key-value backend 保存集群状态。
- Leader 选举保证同一时间只有一个 Metasrv 负责元数据变更和集群管理。
- Procedure Manager 执行多步骤操作，并持久化恢复执行所需的状态。
- 心跳处理链更新租约和 Region 统计信息，并传递控制消息。
- Region 监控根据租约判断 Region 是否不可用，并在需要时启动故障转移。

这些机制共享元数据，但故障边界不同。进程重启可以丢弃缓存和 leader 本地状态；恢复所需的元数据和 Procedure 状态必须持久化。

## 分布式共识

Metasrv 将 leader 选举与元数据存储分开。只有选出的 Metasrv leader 执行协调和元数据变更操作，其他 Metasrv 节点会把 client 引导到当前 leader。

Key-value backend 保存表元数据、路由、Procedure 状态以及其他必须跨 leader 切换保留的信息。Metasrv 不使用这套选举为 Datanode Region 创建读写副本；Region 可用性由租约、心跳和故障转移 Procedure 管理。

## 心跳管理

Datanode 与 Metasrv leader 保持心跳流。心跳请求报告节点身份、租约、Region 统计信息以及放置和监控所需的其他状态；响应则携带 Region 生命周期指令、缓存失效等控制消息。

对 Metasrv 而言，心跳不仅是指标上报，也是租约续期。租约过期会参与故障检测，并可能触发 Region 故障转移。因此，修改心跳周期时必须同时考虑租约和监控周期。
