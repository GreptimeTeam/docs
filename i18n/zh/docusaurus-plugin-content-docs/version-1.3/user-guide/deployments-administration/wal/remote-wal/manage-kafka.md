---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, 安装, 配置, 管理]
description: 介绍 Kafka 集群在 GreptimeDB Remote WAL 中的作用，以及部署和配置要求的查阅位置。
---

# Kafka

启用 [Remote WAL](/user-guide/deployments-administration/wal/overview.md#remote-wal) 后，GreptimeDB 集群不再把预写日志写到本地磁盘，而是写入 Kafka。Datanode 向 Kafka topic 追加 WAL entry，Metasrv 负责清理恢复时不再需要的 entry。

在 region flush 到对象存储之前，Kafka 可能是这些写入唯一的持久副本。它是数据库的有状态依赖，不是传输层的缓冲区。保留策略配错是这里最常见的数据丢失原因：Kafka 按自己的规则删除 segment，而 WAL entry 一旦在 GreptimeDB 回放之前被删除就无法恢复。

- [部署 Kafka 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md) —— 使用 Bitnami Kafka Helm chart 的安装、验证、监控和卸载步骤。
- [Remote WAL 配置](/user-guide/deployments-administration/wal/remote-wal/configuration.md) —— Metasrv 和 Datanode 的 `[wal]` 配置项，以及 Kafka 集群必须满足的[注意事项与限制](/user-guide/deployments-administration/wal/remote-wal/configuration.md#注意事项与限制)。
- [配置 Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md) —— Kubernetes 上完整的 Helm chart 示例。
