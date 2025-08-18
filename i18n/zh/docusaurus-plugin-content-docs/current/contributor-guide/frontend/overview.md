---
keywords: [frontend, proxy, protocol, routing, distributed query, tenant management, authorization, flow control, cloud deployment, endpoints]
description: GreptimeDB Frontend 组件概述 - 为客户端请求提供服务的无状态代理服务。
---

# Frontend

**Frontend** 是一个无状态服务，作为 GreptimeDB 中客户端请求的入口点。它为多种数据库协议提供统一接口，并充当代理，将读写请求转发到分布式系统中的相应 Datanode。

## 核心功能

- **协议支持**：支持多种数据库协议，包括 SQL、PromQL、MySQL 和 PostgreSQL。详见[协议][1]
- **请求路由**：基于元数据将请求路由到相应的 Datanode
- **查询分发**：将分布式查询拆分到多个节点
- **响应聚合**：合并来自多个 Datanode 的结果
- **认证授权**：安全和访问控制验证

## 架构

### 关键组件
- **协议处理器**：处理不同的数据库协议
- **目录管理器**：缓存来自 Metasrv 的元数据以实现高效的请求路由和 Schema 校验
- **分布式规划器**：将逻辑计划转换为分布式执行计划
- **请求路由器**：为每个请求确定目标 Datanodes

### 请求流程

![request flow](/request_flow.png)

### 部署

下图是 GreptimeDB 在云上的一个典型的部署。`Frontend` 实例组成了一个集群处理来自客户端的请求：

![frontend](/frontend.png)

## 详细信息

- [表分片][2]
- [分布式查询][3]

[1]: /user-guide/protocols/overview.md
[2]: ./table-sharding.md
[3]: ./distributed-querying.md
