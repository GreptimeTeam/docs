---
keywords: [Kubernetes 部署, Operator 模式, 自动化管理, 集群部署, 单机实例, 私有云, 公有云]
description: 在 Kubernetes 上部署 GreptimeDB 的概述，介绍了 GreptimeDB Operator 的功能和使用方法。
---

# 在 Kubernetes 上部署 GreptimeDB

GreptimeDB 可以运行在 Kubernetes 上，既可以部署在自有机房，也可以部署在 AWS、阿里云、谷歌云等公有云上。

## 部署 GreptimeDB 单机版

对于开发、测试或小规模生产用例，你可以在 Kubernetes 上[部署 GreptimeDB 单机实例](deploy-greptimedb-standalone.md)，无需运行完整集群。

## 部署 GreptimeDB 集群

对于需要高可用和水平扩展的生产环境，
使用 GreptimeDB Operator 在 Kubernetes 上[部署 GreptimeDB 集群](deploy-greptimedb-cluster.md)。

## 配置

在部署 GreptimeDB 集群或单机实例时，你可以通过创建 `values.yaml` 文件
来对 GreptimeDB 应用自定义配置。
有关可用配置选项的完整列表，请参阅[通用 Helm Chart 配置](./common-helm-chart-configurations.md)。

## 管理 GreptimeDB Operator

GreptimeDB Operator 在 Kubernetes 上自动完成 GreptimeDB 实例的部署、初始化和日常管理。
了解如何[管理 GreptimeDB Operator](./greptimedb-operator-management.md)，
包括安装和升级。

## 进阶部署

了解 [GreptimeDB 的架构和组件](/user-guide/concepts/architecture.md)之后，可以继续下面这些部署场景：

- [部署 GreptimeDB 基础设施测试](deploy-greptimedb-infra-test.md)： 安装 GreptimeDB 的前置基础设施测试检查。
- [部署 MinIO 集群](deploy-minio.md)：学习如何部署，配置和监控 MinIO 集群。
- [部署 Kafka 集群](deploy-kafka.md)：学习如何部署，配置和监控 Kafka 集群。
- [部署带有 Remote WAL 的 GreptimeDB 集群](configure-remote-wal.md)：将 Kafka 配置为 GreptimeDB 集群的远程预写日志 (WAL)，以持久记录每个数据修改并确保不丢失内存缓存的数据。
- [使用 MySQL/PostgreSQL 作为元数据存储](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#配置-metasrv-后端存储)：用 MySQL 或 PostgreSQL 数据库存储集群元数据。
- [部署多 Frontend 的 GreptimeDB 集群](configure-frontend-groups.md)：GreptimeDB 集群的 Frontend 组由多个 Frontend 实例组成，以改善负载分配和可用性。

