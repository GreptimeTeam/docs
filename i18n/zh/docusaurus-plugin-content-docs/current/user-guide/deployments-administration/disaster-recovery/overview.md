---
keywords: [灾难恢复, DR 解决方案, 备份与恢复, RTO, RPO, 组件架构, 单区域部署, Region Failover, 双活互备, 跨区域部署, 数据恢复]
description: 介绍 GreptimeDB 的灾难恢复（DR）解决方案，包括基本概念、组件架构、单集群单区域部署等不同的 DR 解决方案及其比较。
---

# 灾难恢复

作为分布式数据库，GreptimeDB 提供了不同的灾难恢复（DR）解决方案。

本文档包括以下内容：
* DR 中的基本概念
* GreptimeDB 中备份与恢复（BR）的部署架构。
* GreptimeDB 的 DR 解决方案。
* DR 解决方案的比较。

## 基本概念

* **恢复时间目标（RTO）**：指灾难发生后业务流程可以停止的最长时间，而不会对业务产生负面影响。
* **恢复点目标（RPO）**：指自上一个数据恢复点以来可接受的最大时间量，决定了上一个恢复点和服务中断之间可接受的数据丢失量。

下图说明了这两个概念：

![RTO-RPO-explain](/RTO-RPO-explain.png)

* **预写式日志（WAL）**：持久记录每个数据修改，以确保数据的完整性和一致性。

GreptimeDB 存储引擎是一个典型的 [LSM 树](https://en.wikipedia.org/wiki/Log-structured_merge-tree)：

![LSM-tree-explain](/LSM-tree-explain.png)

写入的数据首先持久化到 WAL，然后应用到内存中的 Memtable。
在特定条件下（例如超过内存阈值时），
Memtable 将被刷新并持久化为 SSTable。
因此，WAL 和 SSTable 的备份恢复是 GreptimeDB 灾难恢复的关键。

* **Region**：表的连续段，也可以被视为某些关系数据库中的分区。请阅读[表分片](/contributor-guide/frontend/table-sharding.md#region)以获取更多详细信息。

## 组件架构

### GreptimeDB

在深入了解具体的解决方案之前，让我们从灾难恢复的角度看一下 GreptimeDB 组件的架构：

![Component-architecture](/Component-architecture.png)

GreptimeDB 基于存储计算分离的云原生架构设计：

* **Frontend**：数据插入和查询的服务层，将请求转发到 Datanode 并处理和合并 Datanode 的响应。
* **Datanode**：GreptimeDB 的存储层，是一个 LSM 存储引擎。Region 是在 Datanode 中存储和调度数据的基本单元。Region 是一个表分区，是一组数据行的集合。Region 中的数据保存在对象存储中（例如 AWS S3）。未刷新的 Memtable 数据被写入 WAL，并可以在灾难发生时恢复。
* **WAL**：持久化内存中未刷新的 Memtable 数据。当 Memtable 被刷新到 SSTable 文件时，WAL 将被截断。它可以是基于本地磁盘的（本地 WAL）或基于 Kafka 集群的（远程 WAL）。
* **对象存储**：持久化 SSTable 数据和索引。

GreptimeDB 将数据存储在对象存储（如 [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/DataDurability.html)）或兼容的服务中，这些服务在年度范围内提供了 99.999999999％ 的持久性和 99.99％ 的可用性。像 S3 这样的服务提供了[单区域或跨区域的复制](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)，天然具备灾难恢复能力。

同时，WAL 组件是可插拔的，例如使用 Kafka 作为 WAL 服务以提供成熟的[灾难恢复解决方案](https://www.confluent.io/blog/disaster-recovery-multi-datacenter-apache-kafka-deployments/)。

### 备份与恢复

![BR-explain](/BR-explain.png)

备份与恢复（BR）工具可以在特定时间对数据库或表进行完整快照备份，并支持增量备份。
当集群遇到灾难时，你可以使用备份数据恢复集群。
一般来说，BR 是灾难恢复的最后手段。

## 解决方案介绍

### GreptimeDB Standalone 的 DR 方案

如果 GreptimeDB Standalone 在本地磁盘上运行 WAL 和数据，那么：

* RPO：取决于备份频率。
* RTO：在 Standalone 没有意义，主要取决于要恢复的数据大小、故障响应时间和操作基础设施。

选择将 GreptimeDB Standalone 部署到具有备份和恢复解决方案的 IaaS 平台中是一个很好的开始，例如亚马逊 EC2（结合 EBS 卷）提供了全面的[备份和恢复解决方案](https://docs.aws.amazon.com/zh_cn/prescriptive-guidance/latest/backup-recovery/backup-recovery-ec2-ebs.html)。

但是如果使用远程 WAL 和对象存储运行 Standalone，有一个更好的 DR 解决方案：

![DR-Standalone](/DR-Standalone.png)

把 WAL 写入 Kafka、数据存入对象存储之后，已写入的数据不再依赖节点本地磁盘；灾难发生时可以借助远程 WAL 和对象存储恢复实例。

但节点并非完全无状态：单机实例的元数据，即 catalog、schema 和表定义，存放在本地 `<data_home>/metadata` 下的键值存储中（参见[存储位置](/user-guide/concepts/storage-location.md)），Kafka 和对象存储都无法重建。主机连同磁盘一起损坏时，若事先没有单独备份，这部分元数据就会丢失。请用[元数据导出与导入](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md)把它一并纳入灾备方案。

RPO=0 和分钟级 RTO 是该拓扑的设计目标，成立需要三个前提：Kafka 集群与对象存储都在你要防范的故障中幸存、尚未 flush 的那部分写入所对应的 WAL 仍在、元数据能够恢复。请在自己的部署上通过故障演练验证。

### 基于单集群单区域部署的 DR 解决方案

![Single-region-single-cluster](/Single-region-single-cluster.svg)

在跨区域之前，集群首先要能扛住一个区域内单个节点或单个 AZ 的故障。这里的 AZ 与跨区域方案中的定义一致，是灾难恢复的逻辑单元：一个机房，或机房中的一部分。这套拓扑是常见的生产基线，下面的跨区域方案都建立在它之上。

集群部署在一个区域内，各角色分散在该区域的多个 AZ 上：

* **Frontend** 是无状态的。在负载均衡后面部署多个副本，某个副本挂掉只影响它上面正在处理的请求。参见[服务运行副本数配置](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#服务运行副本数配置)。
* **Metasrv** 以多副本运行并选举 leader，丢一个 follower 对上层透明，丢掉 leader 的代价是一次重新选举。元数据本身存放在外部后端（etcd、MySQL 或 PostgreSQL），Metasrv 不会替你复制它，因此该后端需要自己的高可用和备份。参见[元数据管理](/user-guide/deployments-administration/manage-metadata/overview.md)与[元数据导出与导入](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md)。
* **Datanode** 承载 Region。某个 Datanode 故障时，[Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) 会把它的 Region 在存活节点上重新打开。该功能**默认关闭**，且要求集群使用[共享存储](/user-guide/deployments-administration/configuration.md#storage-options)配合 Remote WAL。在本地 WAL 上通过 `allow_region_failover_on_local_wal=true` 也能开启，但可能丢数据，因为故障节点的 WAL 仍留在它自己的磁盘上。
* **Kafka**（Remote WAL）和**对象存储**保存着必须比节点活得更久的状态。Kafka 的副本数要能容忍你所防范的 broker 故障，并把 broker 和 Datanode 分散到多个 AZ，而不是堆在同一个 AZ 里。

延迟：
- 只有区域内的往返；写入和复制都不需要付跨区域的延迟代价

支持的高可用能力：
- 单个节点不可用，其 Region 在别处重新打开后，性能几乎不受影响
- 单个 AZ 不可用，性能会下降，除非存活 AZ 在容量上就按接管它的负载来规划
- 区域本身不在覆盖范围内；在这套拓扑里，它是单一故障域

此解决方案面向节点或 AZ 故障场景下的零 RPO 和分钟级 RTO。和其他方案一样，这些指标取决于你需要逐项确认的前提：

- Region Failover **默认关闭**，需要显式开启。
- 存活的 Datanode 需要预留出接管故障节点 Region 的容量，否则故障转移只是把过载搬了个地方。
- 恢复时间主要由 WAL 回放决定：共享同一个 Kafka topic 的 Region 越多，这些 Region 重新提供服务前需要读取的冗余数据就越多。相关模型参见 [Region Failover 的恢复用时](/user-guide/deployments-administration/manage-data/region-failover.md)。

最终的 RPO 和 RTO 请通过故障演练确认。如果区域整体、Kafka 集群或对象存储不可用，仍然需要下面的方案之一，或者把备份定期存放到另一个区域。

### 基于双活互备的 DR 解决方案

![Active-active failover](/active-active-failover.png)

在某些边缘或中小型场景中，或者如果你没有资源部署 Remote WAL 或对象存储，双活互备相对于 Standalone 的灾难恢复提供了更好的解决方案。
两个独立节点都能提供服务，并异步复制数据变更。
对端或站点间网络故障时，健康节点可以继续服务，将待同步的数据变更保留在本地存储，并在对端恢复后继续发送。

只有源节点的本地存储仍然可用时，待同步的数据变更才可恢复。如果复制完成前同时丢失节点及其本地存储，对端可能缺少这些变更。

在不同区域部署节点也可以满足区域级灾难恢复要求，但可扩展性有限。

:::tip 注意
**双活互备功能仅在 GreptimeDB 企业版中提供。**
:::

有关此解决方案的更多信息，请参阅[基于双活 - 备份的 DR 解决方案](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md)。

### 基于单集群跨区域部署的 DR 解决方案

![Cross-region-single-cluster](/Cross-region-single-cluster.png)

对于需要零 RPO 的中大型场景，强烈推荐此解决方案。
在此部署架构中，整个集群跨越三个 Region，每个 Region 都能处理读写请求。
两者都必须启用跨 Region DR 并使用远程 WAL 和对象存储实现数据复制。
如果 Region 1 因灾难而完全不可用，其中的表 Region 将在其他 Region 中打开和恢复。
Region 3 作为副本遵循 Metasrv 的多种协议。

此解决方案的目标是 Region 级别的容错、可扩展的写入能力、零 RPO 以及分钟级或更低的 RTO。能否达到这些指标取决于整条依赖链，而不只是集群的部署形态：

- Region Failover **默认关闭**，需要显式开启。
- Kafka、对象存储、元数据后端和流量入口都必须跨越你要防范的故障域。Metasrv 部署在三个区域，并不会替你把外部的 MySQL 或 PostgreSQL 元数据后端复制过去。
- 自动 Datanode selector 按 round-robin、lease 或负载挑选目标，并不是可用区感知的调度策略，因此存活区域必须留有足够余量才能接管。

最终的 RPO 和 RTO 请通过端到端的故障演练确认。
有关此解决方案的更多信息，请参阅[基于单集群跨区域部署的 DR 解决方案](./dr-solution-based-on-cross-region-deployment-in-single-cluster.md)。

### 基于备份恢复的 DR 解决方案

![/BR-DR](/BR-DR.png)

在此架构中，GreptimeDB Cluster 1 部署在 Region 1。
BR 进程持续定期将数据从 Cluster 1 备份到 Region 2。
如果 Region 1 遭遇灾难导致 Cluster 1 无法恢复，
你可以使用备份数据恢复 Region 2 中的新集群（Cluster 2）以恢复服务。

基于 BR 的 DR 解决方案提供的 RPO 取决于备份频率，RTO 随要恢复的数据大小而变化。

阅读[备份与恢复数据](./back-up-&-restore-data.md)获取详细信息。

### 解决方案比较

通过比较这些 DR 解决方案，你可以根据其特定场景、需求和成本选择最终的选项。表中的 RPO 和 RTO 是各拓扑在上述条件下的设计目标，并非对任意部署都成立的保证，请通过故障演练确认。


|     DR 解决方案 | 容错目标 |  RPO | RTO | TCO | 场景 | 远程 WAL 和对象存储 | 备注 |
| ------------- | ------------------------- | ----- | ----- | ----- | ---------------- | --------- | --------|
|  独立模式的 DR 解决方案 | 单区域 | 备份间隔 | 分钟或小时级 | 低 | 小型场景中对可用性和可靠性要求较低 |  可选 | |
|  基于单集群单区域部署的 DR 解决方案 | 单区域，节点与 AZ 级 | 0 | 分钟级 | 中 | 部署在单个区域内的集群，常见的生产基线 | 必需 | Region Failover 默认关闭 |
|  基于双活互备的 DR 解决方案 | 跨区域 | 取决于待同步的数据变更和故障类型 | 取决于外部故障切换 | 低 | 中小型场景中对可用性和可靠性要求较高 |  可选 | 商业功能 |
|  基于单集群跨区域部署的 DR 解决方案 | 多区域 | 0 | 分钟级 | 高 | 中大型场景中对可用性和可靠性要求较高 |  必需 | |
|  基于 BR 的 DR 解决方案 | 单区域 | 备份间隔 | 分钟或小时级 | 低 | 可接受的可用性和可靠性要求 | 可选 | |


## 参考资料

* [备份与恢复数据](./back-up-&-restore-data.md)
* [基于双活 - 备份的 DR 解决方案](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md)
* [基于单集群跨区域部署的 DR 解决方案](./dr-solution-based-on-cross-region-deployment-in-single-cluster.md)
* [S3 对象副本概述](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html)
