---
keywords: [贡献者指南, 架构, Frontend, Datanode, Metasrv, Flownode]
description: 介绍 GreptimeDB 内部架构及各子系统源码入口的贡献者文档。
---

# 贡献者指南

本指南介绍 GreptimeDB 的内部架构，并提供各子系统的源码入口。构建、测试及贡献要求以源码仓库的 [CONTRIBUTING.md](https://github.com/GreptimeTeam/greptimedb/blob/main/CONTRIBUTING.md) 为准。

## 架构

[架构概览](/user-guide/concepts/architecture.md) 从用户视角说明系统组件和请求链路。以下贡献者文档进一步说明各组件的实现边界：

- [Frontend](./frontend/overview.md)：协议处理、请求编排、路由和分布式查询规划。
- [Datanode](./datanode/overview.md)：Region 管理、查询执行和存储引擎。
- [Metasrv](./metasrv/overview.md)：元数据、集群协调和分布式 Procedure。
- [Flownode](./flownode/overview.md)：单机及分布式部署中的持续聚合。

本地构建 GreptimeDB 请继续阅读[快速开始](./getting-started.md)。
