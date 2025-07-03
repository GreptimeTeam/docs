---
keywords: [Kubernetes 部署, Operator 模式, 自动化管理, 集群部署, 单机实例, 私有云, 公有云]
description: 在 Kubernetes 上部署 GreptimeDB 的概述，介绍了 GreptimeDB Operator 的功能和使用方法。
---

# 在 Kubernetes 上部署 GreptimeDB

GreptimeDB 专为云原生环境而构建，从第一天起就可以在 Kubernetes 上部署。

## 部署 GreptimeDB 单机版

对于开发、测试或小规模生产用例，你可以在 Kubernetes 上[部署 GreptimeDB 单机实例](deploy-greptimedb-standalone.md)。
这种方式较为简单，无需管理完整集群的复杂性。

## 部署 GreptimeDB 集群

对于需要高可用性和可扩展性的生产环境，
你可以使用 GreptimeDB Operator 在 Kubernetes 上[部署 GreptimeDB 集群](deploy-greptimedb-cluster.md)以建立分布式 GreptimeDB 集群，
水平扩展并高效处理大量数据。

## 配置

在部署 GreptimeDB 集群或单机实例时，你可以通过创建 `values.yaml` 文件
来对 GreptimeDB 应用自定义配置。
有关可用配置选项的完整列表，请参阅[通用 Helm Chart 配置](./common-helm-chart-configurations.md)。

## 管理 GreptimeDB Operator

基于 GreptimeDB Operator，你可以很轻松地部署、升级和管理 GreptimeDB 集群和单机实例。
无论是私有还是公有云部署，GreptimeDB Operator 都将快速部署和扩容 GreptimeDB 变得简单易行。
了解如何[管理 GreptimeDB Operator](./greptimedb-operator-management.md)，
包括安装和升级。

## 进阶部署

在熟悉了 [GreptimeDB 的架构和组件](/user-guide/deployments-administration/architecture.md)之后，你可以进一步探索高级部署场景：

- [部署带有 Remote WAL 的 GreptimeDB 集群](configure-remote-wal.md)：将 Kafka 配置为 GreptimeDB 集群的远程预写日志 (WAL)，以持久记录每个数据修改并确保不丢失内存缓存的数据。
- [使用 MySQL/PostgreSQL 作为元数据存储](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#配置-metasrv-后端存储)：集成 MySQL/PostgreSQL 数据库以提供强大的元数据存储功能，增强可靠性和性能。
- [部署多 Frontend 的 GreptimeDB 集群](configure-frontend-groups.md)：GreptimeDB 集群的 Frontend 组由多个 Frontend 实例组成，以改善负载分配和可用性。

