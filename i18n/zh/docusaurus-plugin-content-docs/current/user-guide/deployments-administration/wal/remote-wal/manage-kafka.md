---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, 安装, 配置, 管理]
description: 介绍 Kafka 集群在 GreptimeDB Remote WAL 中的作用，以及部署和配置要求的查阅位置。
---

# 管理 Kafka

启用 [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) 后，GreptimeDB 集群不再把预写日志写到本地磁盘，而是写入 Kafka。Datanode 向 Kafka topic 追加 WAL entry，Metasrv 负责清理所有 region 都已 flush 到对象存储的部分。

也就是说，Kafka 集群里存放着尚未持久化到别处的数据。它是数据库的有状态依赖，不是传输层的缓冲区。

## 部署 Kafka 集群

安装、验证、监控和卸载步骤见[部署 Kafka 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md)，使用 Bitnami 提供的 Kafka Helm chart。

## Remote WAL 对 Kafka 的要求

在把 GreptimeDB 指向该集群之前，请先阅读[注意事项与限制](/user-guide/deployments-administration/wal/remote-wal/configuration.md#注意事项与限制)，其中说明了保留策略、Datanode 所需的 Kafka 权限，以及 `max_batch_bytes` 与 Kafka 最大消息大小的关系。

保留策略配错是这里最常见的数据丢失原因：Kafka 按自己的规则删除 segment，而 WAL entry 一旦在 GreptimeDB 回放之前被删除就无法恢复。

## 将 GreptimeDB 接入 Kafka

配置 GreptimeDB 侧请参考：

- [Remote WAL 配置](/user-guide/deployments-administration/wal/remote-wal/configuration.md)：Metasrv 和 Datanode 的 `[wal]` 配置项，包含 topic 自动创建、WAL 清理和 Kafka 认证。
- [配置 Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md)：Kubernetes 上完整的 Helm chart 示例。
