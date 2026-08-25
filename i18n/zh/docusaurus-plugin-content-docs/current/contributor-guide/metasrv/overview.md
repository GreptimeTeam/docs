---
keywords: [Metasrv, 元数据, 路由, Leader 选举, 心跳, 分布式 Procedure]
description: 介绍 Metasrv 的元数据、协调和集群管理职责。
---

# Metasrv

<AnchorAlias id="metasrv-包含什么" />

## 职责

Metasrv 是分布式部署中的元数据和协调服务，负责：

- 通过 KV backend 持久化 Catalog、Schema、Table、Region、路由和节点元数据；
- 通过 Leader 选举保证协调操作和元数据修改只在一个 Leader 上执行；
- 通过心跳流跟踪节点租约和 Region 统计信息；
- 建表时为 Region 选择 Datanode；
- 执行可恢复的 DDL、Region 迁移、故障转移、repartition 等分布式 Procedure；
- 向 Frontend 和 Datanode 发布缓存失效及其他控制消息。

数据模型、KV 抽象、选举接口、key 编码和 DDL manager 位于 `src/common/meta/`。`src/meta-srv/` crate 实现服务端、状态机、心跳 handler 和控制 Procedure。

<AnchorAlias id="前端如何与-metasrv-交互" />

## Frontend 与 Metasrv 的交互

Frontend 通过 `meta-client` crate 获取表元数据和 Region 路由，并提交修改元数据的操作。Frontend 在本地缓存元数据；Procedure 修改元数据后，Metasrv 会发送缓存失效消息。

### 创建表

1. Frontend 向 Metasrv Leader 提交 DDL 请求。
2. DDL manager 校验请求，根据分区规则生成 Region，并为 Region 选择 Datanode。
3. 持久化的 Procedure 创建 Region，随后记录表和路由元数据。Procedure 状态持久化后，可以在服务重启或 Leader 切换后恢复执行。
4. 元数据提交后，Metasrv 使相关缓存失效。

### `Insert`

Frontend 获取表路由，按分区拆分数据行，并把 Region 写请求发送到对应 Datanode。路由元数据保存在本地缓存中；收到缓存失效消息或 stale-route 错误时，Frontend 会从 Metasrv 刷新路由。

### `Select`

Frontend 在查询规划期间使用表和 Region 元数据。分区谓词用于裁剪 Region，分布式查询引擎再将远端子计划发送到持有这些 Region 的 Datanode。参见[分布式查询](../frontend/distributed-querying.md)。

<AnchorAlias id="metasrv-架构" />

## 源码结构

主要实现目录如下：

- `src/meta-srv/src/service/`：gRPC 服务和 HTTP Admin API。
- `src/meta-srv/src/handler/`：心跳 handler chain。
- `src/meta-srv/src/procedure/`：Region 迁移、repartition、WAL 清理等分布式 Procedure。
- `src/meta-srv/src/region/`：Region 租约、监控和故障转移触发逻辑。
- `src/meta-srv/src/selector/`：为 Region 选择 Datanode。

<AnchorAlias id="分布式共识" />

## Leader 与持久化

Metasrv 通过 `common-meta` 中的接口隔离 Leader 选举与持久化元数据存储。协调操作和元数据修改在 Leader 上执行；非 Leader 节点返回 not-leader 响应，client 随后连接到当前 Leader。

Leader 切换后仍需保留的数据必须写入 KV backend。进程内缓存和 Leader 本地状态会在切换时重建或清空。分布式 Procedure 会持久化状态，其每个执行步骤必须保持幂等，才能安全恢复。

<AnchorAlias id="心跳管理" />

## 心跳不变量

Datanode 和 Frontend 与 Metasrv Leader 保持心跳流。请求携带节点身份、租约、Region 统计信息及其他状态。`src/meta-srv/src/handler/` 下的 handler chain 负责检查 Leader、更新租约与统计信息，并处理 mailbox 消息。

心跳响应携带 Region 生命周期指令、缓存失效等控制消息。Region supervisor 根据租约状态发现不可用 Region，并触发故障转移 Procedure。修改心跳间隔时，必须同步检查 `common-meta` 和 `meta-srv` 中的租约与 supervisor 时序。
