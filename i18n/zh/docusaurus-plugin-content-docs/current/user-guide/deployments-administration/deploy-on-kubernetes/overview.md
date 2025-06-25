---
keywords: [Kubernetes 部署, Operator 模式, 自动化管理, 集群部署, 单机实例, 私有云, 公有云]
description: 在 Kubernetes 上部署 GreptimeDB 的概述，介绍了 GreptimeDB Operator 的功能和使用方法。
---

# 在 Kubernetes 上部署 GreptimeDB

## GreptimeDB on Kubernetes

GreptimeDB 是专为云原生环境而设计的时序数据库，自诞生以来就支持在 Kubernetes 上部署。我们提供了一个 [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) 来管理 GreptimeDB 在 Kubernetes 上的部署、配置和扩容。基于 GreptimeDB Operator，你可以很轻松地部署、升级和管理 GreptimeDB 集群和单机实例。无论是私有还是公有云部署，GreptimeDB Operator 都将快速部署和扩容 GreptimeDB 变得简单易行。

我们**强烈建议**使用 GreptimeDB Operator 在 Kubernetes 上部署 GreptimeDB。

## 立即开始

- GreptimeDB Cluster：你可以将 [立即开始](./deploy-greptimedb-cluster.md) 作为你的第一篇指南以了解整体情况。在该指南中，我们提供了用于在 Kubernetes 上部署 GreptimeDB 集群的完整过程。
- [GreptimeDB Standalone](./deploy-greptimedb-standalone.md)

## GreptimeDB Operator

- [GreptimeDB Operator 管理](./greptimedb-operator-management.md)

## 配置

- [常见 Helm Chart 配置项](./common-helm-chart-configurations.md)
