---
keywords: [frontend, proxy, protocol, routing, distributed query, tenant management, authorization, flow control, cloud deployment, endpoints]
description: GreptimeDB Frontend 组件概述 - 为客户端请求提供服务的无状态代理服务。
---

# Frontend

Frontend 是 GreptimeDB 中负责请求编排的无状态服务。Server 层负责终止协议并转换线上消息；Frontend 为这些协议处理器提供数据库行为，包括权限检查、语句执行、路由和分布式查询规划。

Frontend 不存储表数据。它缓存从 Metasrv 获取的 catalog 和路由元数据；元数据发生变化时，Metasrv 通过心跳响应通知 Frontend 失效相应缓存。

## 核心功能

- 为支持的[协议][1]提供查询和写入行为。
- 解析 catalog、schema、table 和 Region 路由。
- 在执行请求前完成权限检查。
- 规划分布式查询并合并 Datanode 返回的结果。
- 将表级写入和删除转换为 Region 请求。

## 架构

### 关键组件

- 协议处理器将 SQL、PromQL、gRPC 写入和可观测性协议转换为 Frontend 的内部请求接口。
- Catalog manager 和 partition manager 提供表元数据、分区规则和 Region 路由。
- Statement executor 将查询、DML 和 DDL 分发到各自的执行路径。
- 分布式规划器把表扫描替换为可跨 Datanode 执行的 `MergeScan` 计划。

### 请求流程

不同操作会走不同的请求路径。

#### 查询

1. 协议处理器创建查询上下文，并完成认证和权限检查。
2. 对应查询语言的 planner 生成逻辑计划。分布式模式下，planner 根据分区元数据选择 Region 并生成分布式计划。
3. Frontend 将 Region 子计划发送到对应 Datanode。Datanode 在本地 Region engine 上执行，并返回 Arrow record batch 流。
4. Frontend 执行剩余算子、合并数据流，再按客户端协议编码结果。

#### 写入和删除

1. Frontend 根据表 schema 校验请求。支持 schema-on-write 的协议可以先创建缺失的表或新增列，再重试写入。
2. 分区规则把每一行分配给 Region。Frontend 为各目标 Region 构造请求，并路由到当前 Region leader。
3. Datanode 的 Region server 将请求分发到对应的 Region engine。单机模式下，请求直接发送给内嵌的 Region server。

#### DDL

Statement executor 将 DDL 转换为 task。分布式模式下，Metasrv 以持久化 procedure 执行 task、更新元数据，并协调 Datanode 上的 Region 操作。单机模式复用相同的语句边界，但使用本地元数据和 procedure 实现。

### 部署

下图展示了 GreptimeDB 的一种云上部署。多个 Frontend 实例共同处理客户端请求：

![frontend](/frontend.png)

## 详细信息

- [表分片][2]
- [分布式查询][3]

[1]: /user-guide/protocols/overview.md
[2]: ./table-sharding.md
[3]: ./distributed-querying.md
