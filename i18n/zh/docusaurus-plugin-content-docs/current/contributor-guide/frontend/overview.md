---
keywords: [Frontend, 协议, 请求路由, 分布式查询, 权限校验]
description: GreptimeDB 无状态请求入口和查询协调组件 Frontend 的实现概览。
---

# Frontend

Frontend 是 GreptimeDB 的无状态请求入口和编排层。它实现协议服务背后的业务逻辑，负责查询规划、写入与 Region 读取路由，以及分布式查询协调。

网络监听和 wire format 属于 `servers` crate。`frontend` crate 为 SQL、gRPC、MySQL、PostgreSQL、InfluxDB、OpenTelemetry、Prometheus、OpenTSDB、Jaeger 等接口实现对应的 handler trait。

<AnchorAlias id="核心功能" />

## 职责

- 解析和规划 SQL、PromQL 及日志查询。
- 校验权限，并在请求处理链路中传递 session context。
- 使用 Catalog 和路由元数据分发插入、删除及 Region 查询。
- 将分布式查询片段发送到 Datanode，并合并执行结果。

面向用户的接口参见[协议概览](/user-guide/protocols/overview.md)。

## 架构

### 关键组件

- `src/frontend/src/instance.rs` 中的 `Instance` 是主要业务逻辑容器，实现各类 server handler trait。
- `src/frontend/src/instance/` 下的模块处理不同请求类型和协议。
- `operator` crate 中的 `StatementExecutor` 负责语句及写入侧操作。
- `query` crate 负责逻辑计划、优化和分布式计划。
- `instance/region_query.rs` 中的 `FrontendRegionQueryHandler` 解析 Region 目标并向 Datanode 发送查询请求。

### 请求流程

单机模式下，Frontend 通过本地 `RegionServer` adapter 访问内嵌的 Datanode。分布式模式下，Frontend 使用 Metasrv 提供的元数据和 RPC client 访问远端 Datanode。

### 部署

Frontend 不持有表数据。多个 Frontend 实例可以共同服务同一组 Metasrv 和 Datanode。

<AnchorAlias id="详细信息" />

## 实现指南

- [表分片](./table-sharding.md)
- [分布式查询](./distributed-querying.md)
