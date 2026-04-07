---
keywords: [Kubernetes, 部署, GreptimeDB, Remote WAL, Kafka, 配置]
description: 本指南将逐步介绍如何在 Kubernetes 上部署启用了 Remote WAL 的 GreptimeDB 集群，包括前置条件、依赖组件、配置说明、安装步骤。
---

# 部署启用 Remote WAL 的 GreptimeDB 集群

本指南将介绍如何在 Kubernetes 集群中部署启用了 Remote WAL（远程写前日志）的 GreptimeDB。在开始之前，建议先阅读 [部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) 文档。


## 前置条件

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## 所需依赖

在部署启用了 Remote WAL 的 GreptimeDB 之前，请确保元数据存储和 Kafka 集群已经部署完成，或者已准备好可用的实例：

- 元数据存储：请参考 [管理元数据概述](/user-guide/deployments-administration/manage-metadata/overview.md) 了解更多详情。在本示例中，我们使用 etcd 作为元数据存储。
- Kafka 集群：请参考 [管理 Kafka](/user-guide/deployments-administration/wal/remote-wal/manage-kafka.md) 了解更多详情。

## Remote WAL 配置

:::tip NOTE
chart 版本之间的配置结构已发生变化:

- 旧版本: `meta.etcdEndpoints`
- 新版本: `meta.backendStorage.etcd.endpoints`

请参考 chart 仓库中配置 [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) 以获取最新的结构。
:::

本示例假设你已经部署了一个 Kafka 集群，运行在 `kafka-cluster` 命名空间中，并且一个 etcd 集群运行在 `etcd-cluster` 命名空间中。`values.yaml` 文件如下：

```yaml
meta:
  backendStorage:
    etcd:
      endpoints: ["etcd.etcd-cluster.svc.cluster.local:2379"]
  configData: |
    [wal]
    provider = "kafka"
    replication_factor = 1
    topic_name_prefix = "gtp_greptimedb_wal_topic"
    auto_prune_interval = "30m"
datanode:
  configData: |
    [wal]
    provider = "kafka"
    overwrite_entry_start_id = true
remoteWal:
  enabled: true
  kafka:
    brokerEndpoints: ["kafka.kafka-cluster.svc.cluster.local:9092"]
```

## 部署 GreptimeDB 集群

你可以使用以下命令部署 GreptimeDB 集群：

```bash
helm upgrade --install mycluster  \
    --values values.yaml \
    greptime/greptimedb-cluster \
    -n default
```

## 最佳实践

- **不要在已部署的集群中切换 WAL 存储类型**. 如果需要将 WAL 存储从本地更换为远程，必须 删除整个集群并重新部署，包括：
  - 删除集群使用的所有 PersistentVolumeClaims（PVCs）
  - 清空对象存储中的集群目录
  - 删除或清理使用的元数据存储
- 建议先使用一个**最小可行部署**来验证集群是否运行正常，例如执行建表和插入数据等基本操作，确保数据库正常工作。

## 后续步骤

- 请参考 [部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) 指南访问你的 GreptimeDB 集群。
- 请参考 [快速开始](/getting-started/quick-start.md) 指南创建表并写入数据。
- 请参考 [Remote WAL 配置](/user-guide/deployments-administration/wal/remote-wal/configuration.md) 了解更多关于 Remote WAL 配置的信息。

