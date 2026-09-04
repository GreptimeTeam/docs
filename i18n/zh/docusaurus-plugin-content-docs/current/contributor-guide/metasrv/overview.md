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
- 通过可恢复的 Procedure 执行 DDL、Region 迁移、故障转移和重分区；
- 通过心跳维护节点租约和 Region 统计信息；
- 元数据变更时向 Frontend、Datanode 和 Flownode 广播缓存失效；
- 向 Datanode 下发 Region 生命周期指令。

## 前端如何与 Metasrv 交互

Frontend 从 Metasrv 获取表元数据和 Region 路由，并缓存在本地。修改元数据的语句会发送给 Metasrv leader；普通读写则使用缓存的路由直接访问 Datanode。

控制链路和数据链路相互分离：

```text
Frontend
  |-- 元数据查询和 DDL -------------------> Metasrv leader
  `-- Region 读写 ------------------------> Datanode

Metasrv leader
  |-- Region 生命周期指令 ----------------> Datanode
  `-- 缓存失效 --------------------------> Frontend / Datanode / Flownode

Datanode
  `-- 心跳、租约续期和 Region 统计信息 ----> Metasrv leader
```

在稳定状态下，表路由为每个 Region 记录一个 leader peer 和零个或多个 follower peer。Leader 是写入目标；支持只读副本的部署可以把读取路由到 follower：

```text
Table route
  |-- Region 0
  |    |-- leader    -> Datanode A
  |    `-- followers -> Datanode B, Datanode C
  `-- Region 1
       `-- leader    -> Datanode D
```

Region 迁移或故障转移会改变 peer 角色，并可能使 Region 暂时没有 leader。Frontend 刷新缓存路由后，再把后续读写发送给当前 peer。

### 创建表

1. Frontend 向 Metasrv leader 提交 DDL 请求。
2. Metasrv 根据分区规则确定 Region，并[为每个 Region 选择 Datanode](/contributor-guide/metasrv/selector.md)。
3. 持久化的 Procedure 创建 Region，并写入表元数据和路由。发生 leader 切换后，Procedure 可以从已保存的状态继续执行。
4. 元数据提交后，Metasrv 通知 Frontend 刷新相关缓存。

### `Insert`

Frontend 解析表路由，按照分区规则拆分数据行，再把各 Region 的写入发送到对应 Datanode。路由发生变化时，相关缓存会失效，Frontend 随后从 Metasrv 重新获取元数据。

### `Select`

Frontend 在查询规划期间使用表和 Region 元数据。分区列上的谓词用于裁剪 Region，分布式查询引擎再把任务发送给持有这些 Region 的 Datanode。参见[分布式查询](../frontend/distributed-querying.md)。

## Metasrv 架构

主要协调路径如下：

```text
Leader election
      |
      v
Metasrv leader
├─ DDL manager -> Procedure manager
├─ Selector -> 新 Region 的放置
├─ Heartbeat handler chain -> 租约和 Region 统计信息
├─ Region supervisor -> Region 迁移 Procedure
├─ Mailbox -> 缓存失效和 Region 指令
└─ Metadata managers -> KV backend
```

这些机制共享元数据，但故障边界不同。进程重启可以丢弃缓存和 leader 本地状态；恢复所需的元数据和 Procedure 状态必须持久化。

## 分布式共识

Metasrv 将 leader 选举与元数据存储分开。只有选出的 Metasrv leader 执行协调和元数据变更操作，其他 Metasrv 节点会把 client 引导到当前 leader。

Key-value backend 保存表元数据、路由、Procedure 状态以及其他必须跨 leader 切换保留的信息。Metasrv 不使用这套选举为 Datanode Region 创建读写副本；Region 可用性由心跳、Region 故障检测和故障转移 Procedure 管理。

## 心跳管理

Datanode 与 Metasrv leader 保持心跳流。心跳请求报告节点身份、租约、Region 统计信息以及放置和监控所需的其他状态；响应则携带 Region 生命周期指令、缓存失效等控制消息。

心跳驱动两套相互独立的机制，调整心跳周期会同时影响两者：

- **节点租约**：keep-lease handler 为发送心跳的 Datanode 续期。Selector 和 `/node-lease` 端点据此判断 Datanode 是否仍然存活。
- **Region 故障检测**：Region supervisor 为每个 Region 维护一个基于心跳到达间隔的 Phi Accrual 检测器，其判定与租约是否过期无关。

只有开启 Region 故障转移时，故障判定才会提交故障转移迁移。该功能默认关闭，并且要求使用 remote WAL，除非显式允许在本地 WAL 上执行。维护模式同样会抑制故障转移。前置条件和开启方式参见 [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md)。
