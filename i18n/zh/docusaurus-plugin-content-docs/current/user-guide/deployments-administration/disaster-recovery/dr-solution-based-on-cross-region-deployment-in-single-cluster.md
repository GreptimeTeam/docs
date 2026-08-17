---
keywords: [跨区域部署, 单集群, 灾难恢复, 数据中心, 高可用性, 元数据, Region Failover]
description: 设计和验证跨可用区或 Region 的 GreptimeDB 集群，并明确各层实际提供的故障域保证。
---

# 单集群跨 Region 部署

GreptimeDB 集群可以跨可用区或 Region 部署，但 GreptimeDB 本身不会自动让所有依赖都具备跨 Region 能力。只有覆盖下面列出的故障边界后，才能把这种部署作为容灾方案。

## 恢复模型

一张表被划分成多个 Region，每个 Region 在一台 Datanode 上打开。GreptimeDB 社区版不会为每个已打开的 Region 维护一个同步 Datanode 副本。启用 Region Failover 后，Metasrv 检测到 Region 不可用，选择健康的 Datanode，更新路由并在目标节点打开 Region。目标 Datanode 从共享存储和 Remote WAL 恢复持久化数据。

这意味着：

- 目标 Datanode 必须能够访问故障 Datanode 使用的同一份数据存储和 WAL。
- 如果共享依赖与故障站点一起丢失，Region Failover 无法完成恢复。

Region Failover 默认关闭。启用前阅读 [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md)，并按文档处理初始化等待时间和维护模式。

## 定义故障域

可用区、数据中心和地理 Region 都是基础设施概念。先确定部署需要容忍哪类故障，再把每个组件映射到相应故障域。GreptimeDB 不会推断某台 Datanode 属于哪个城市或数据中心。

在 Kubernetes 中，使用节点 Label、Affinity、Topology Spread Constraint 和 PodDisruptionBudget 放置副本，并在每次部署变更后检查实际分布。GreptimeDB 社区版内置 Selector 根据轮询、Lease 或负载从可用 Datanode 中选择目标，不会强制跨可用区放置。

## 必要依赖

### 数据存储

使用在目标故障域失效后仍可读写的共享对象存储。根据存储服务的规则配置复制、版本控制、凭证、Endpoint 和故障切换。即使 Datanode 分布在多个 Region，只位于一个 Region 的 Bucket 仍然是单 Region 依赖。

### Remote WAL

安全执行 Region Failover 需要使用 Kafka Remote WAL。存活的 Datanode 必须能够访问 Kafka，Kafka 也必须保留 GreptimeDB 仍可能引用的全部 WAL Entry。Kafka 的复制和跨 Region 恢复能力应覆盖与 GreptimeDB 集群相同的故障边界。

`overwrite_entry_start_id = true` 时不要使用基于大小的 Kafka 保留策略，否则可能删除 GreptimeDB 仍需要的 Entry。参见 [Remote WAL 配置](/user-guide/deployments-administration/wal/remote-wal/configuration.md)和 [Remote WAL 的 Kafka 管理](/user-guide/deployments-administration/wal/remote-wal/manage-kafka.md)。

### 元数据

Metasrv 使用 etcd、MySQL 或 PostgreSQL 等元数据后端。Metasrv 和元数据后端都必须按照目标故障边界部署。增加 Metasrv 副本不会自动为元数据后端建立 Quorum 或跨 Region 复制。

跨 Region 共识会增加元数据操作的写入延迟。应遵循元数据后端自身的 Quorum 和故障切换规则，而不是简单按照 GreptimeDB 站点数量放置成员。

### 请求路由

应用需要存活的 Frontend Endpoint。在 GreptimeDB 外部配置带健康检查的负载均衡或 DNS 故障切换，并让客户端重试策略符合可接受的最长中断时间。

### 备用容量

存活的 Datanode 在承载原有流量的同时，还要接收故障域中的 Region。容量规划必须测试计划容忍的最大故障，而不只是稳态负载。参见[容量规划](/user-guide/deployments-administration/capacity-plan.md)。

## 选择拓扑

使用能够覆盖已声明故障的最小拓扑：

- 如果目标是容忍可用区故障，应按照各依赖自身的 Quorum 和复制策略，把 GreptimeDB 组件和所有有状态依赖分布到足够多的可用区。
- 如果目标是容忍整个 Region 故障，每个必要依赖都必须跨 Region 部署，或者具备经过验证的 Region 故障切换能力，包括对象存储、Kafka、元数据、Frontend 路由、凭证和可观测系统。
- 如果跨 Region 延迟使单集群不可行，应使用独立集群以及明确的数据复制或备份恢复方案，而不是声明未经测量的单集群 RTO。

拓扑图中的网络数字不是产品属性。应测量实际站点之间的延迟、带宽和丢包，并在确定拓扑前测试它们对 Kafka ACK、元数据操作、查询和恢复过程的影响。

## 验证恢复能力

生产上线前以及基础设施发生重大变更后执行故障演练：

1. 停止一台 Datanode，确认其 Region 在预期节点上重新打开。
2. 隔离整个可用区或 Region，包括对应网络路径。
3. 从存活站点验证 Kafka、对象存储和元数据后端。
4. 确认 Frontend 路由和客户端重试恢复访问。
5. 对比最后一批已确认写入和恢复后的查询结果。
6. 测量故障检测、Region 恢复、积压追平和服务完全恢复的耗时。
7. 恢复故障站点且不触发非预期 Failover；计划内重启期间使用维护模式。

用实测的数据丢失窗口和恢复时间作为部署的 RPO、RTO 依据。只有完整故障演练在目标负载下证明结果后，才能声明零 RPO 或分钟级 RTO。
