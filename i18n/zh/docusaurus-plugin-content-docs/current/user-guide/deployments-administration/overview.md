---
keywords: [配置项, 鉴权, Kubernetes 部署, Android 运行, 容量规划, GreptimeCloud]
description: GreptimeDB 部署概述，包括配置项、鉴权、在 Kubernetes 上部署、在 Android 上运行、容量规划和 GreptimeCloud 的介绍。
---

# 运维部署及管理

GreptimeDB 可以部署在你自己的基础设施上，也可以通过全托管云服务 GreptimeCloud 进行管理。
本指南概述了部署策略、配置、监控和管理的相关内容。

## 自托管 GreptimeDB 部署

本节概述了自托管环境中部署和管理 GreptimeDB 的关键点。

### 配置和部署

- **配置：** 在部署 GreptimeDB 前，[检查配置](configuration.md)以确保满足你的相关需要，包括协议设置、存储选项等。
- **鉴权：** 默认情况下鉴权没有被启动。了解如何[启用和配置鉴权](./authentication/overview.md)。
- **Kubernetes 部署：** 按照[部署指南](./deploy-on-kubernetes/overview.md)在 Kubernetes 上部署 GreptimeDB。
- **容量规划：** 通过[容量规划](/user-guide/deployments-administration/capacity-plan.md)确保集群能够处理业务所需的工作负载。

### 组件管理

- **Cluster Failover：** 通过设置 [Remote WAL](./wal/remote-wal/quick-start.md) 以实现高可用性。
- **管理元数据：** 为 GreptimeDB 设置[元数据存储](./manage-data/overview.md)。

### 监控

- **监控：** 通过指标、Traces 和运行时信息[监控集群的健康状况和性能](./monitoring/overview.md)。

### 数据管理和性能

- **数据管理：** 通过[管理数据策略](/user-guide/deployments-administration/manage-data/overview.md) 以防止数据丢失、降低成本并优化性能。
- **性能调优：** 查看[性能调优技巧](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md)并学习如何[设计表结构](/user-guide/deployments-administration/performance-tuning/design-table.md)以提高性能。

### 灾难恢复

- **灾难恢复：** 实施[灾难恢复策略](/user-guide/deployments-administration/disaster-recovery/overview.md)以保护你的数据并确保业务连续性。

### 其他

- **在 Android 上运行：** 了解如何[在 Android 设备上运行 GreptimeDB](run-on-android.md)。
- **升级：** 按照[升级指南](/user-guide/deployments-administration/upgrade.md)升级 GreptimeDB。

## GreptimeCloud

对于完全托管的体验，
请考虑 [GreptimeCloud](https://greptime.cloud)。
GreptimeCloud 使你能够轻松部署、监控和扩展 GreptimeDB 实例，内置指标监控和告警功能。
它旨在为时序数据平台和 Prometheus 后端提供可扩展、高效的无服务器解决方案。

更多详情，请参阅 [GreptimeCloud 文档](https://docs.greptime.com/nightly/greptimecloud/overview)。
