---
keywords: [灾难恢复, DR 解决方案, 备份与恢复, RTO, RPO, Region Failover, 跨区域部署]
description: 说明 GreptimeDB 灾难恢复的组成部分、故障边界以及恢复目标的验证方法。
---

# 灾难恢复

GreptimeDB 不会为某种部署方式直接给出固定的 RPO 或 RTO。恢复结果取决于 WAL、数据存储、元数据后端、故障检测、备用容量、网络和运维流程。应把这些依赖作为一个完整的恢复系统来设计和测试。

## 恢复目标

- **恢复点目标（RPO）**是可以接受的数据丢失上限，以时间衡量。
- **恢复时间目标（RTO）**是故障发生后恢复服务的最长可接受时间。

只有目标故障发生后所有必要依赖仍然可用，部署架构才能满足恢复目标。例如，只把 Datanode 部署到多个 Region 并不能实现 Region 级容灾；Kafka、对象存储、元数据或请求路由中的任何单 Region 依赖仍可能阻止恢复。

## 持久化状态

GreptimeDB 的恢复涉及三类持久化状态：

- **WAL** 保存已接收但尚未写入 SST 文件的数据。Local WAL 依赖 Datanode 的本地磁盘；Remote WAL 将日志写入 Kafka，是安全启用 Region 自动故障转移的前提。
- **数据存储**保存 SST 和索引文件。分布式部署执行 Region Failover 时，目标 Datanode 必须能够访问共享存储，例如对象存储。
- **元数据存储**保存 Catalog、Schema、表路由、Procedure 和其他控制面状态。它的复制和备份策略独立于数据存储。

三类状态都必须受到保护。对象存储的持久性不能保护 WAL 或元数据，元数据快照也不包含表数据。

## 恢复方式

### 使用本地存储的 Standalone

使用 Local WAL 和本地数据目录的 Standalone 实例依赖所在主机和磁盘卷。通常使用卷级备份，或者 GreptimeDB 的数据与元数据导出进行恢复。RPO 取决于最近一次可恢复备份或仍可重放的源数据；RTO 包括资源准备、恢复和验证时间。

Standalone 使用 Remote WAL 和对象存储后，持久化数据不再绑定进程所在主机，可以减少重启所需的本地状态，但这并不等于 RPO 为零，也不保证固定的恢复时间。Kafka 和对象存储的持久性、WAL 保留情况、元数据可用性和重启流程仍然决定实际结果。

### 使用 Region Failover 的分布式集群

满足以下条件时，GreptimeDB 可以在健康 Datanode 上重新打开故障节点的 Region：

- 数据位于目标 Datanode 可访问的共享存储中。
- 使用 Remote WAL。在 Local WAL 上强制启用 Failover 并不安全，可能丢失尚未刷盘的数据。
- 显式启用 Metasrv 的 Region Failover；该功能默认关闭。
- 集群中有健康且容量足够的备用 Datanode。

配置方式和启动注意事项参见 [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md)。如果部署跨越多个故障域，另请参见[跨 Region 部署](./dr-solution-based-on-cross-region-deployment-in-single-cluster.md)。

Region Failover 会修改 Region 路由，并在另一台 Datanode 上打开 Region。它本身不会跨 Region 复制 Kafka、对象存储、元数据后端或应用流量，这些系统需要单独配置高可用和恢复能力。

### 备份与恢复

备份适合处理逻辑损坏、误删除或超出在线部署容错能力的故障：

- [Export/Import V2](./export-import-v2.md) 导出表 Schema 和数据。
- [元数据导出和导入](./back-up-&-restore-meta-data.md)为元数据后端创建快照。

数据导出和元数据导出是两个独立操作，不构成一个原子的集群快照。如果恢复点要求两者一致，应在导出期间控制数据写入和元数据变更，尽可能保留原始写入源，并测试完整的联合恢复流程。

RPO 取决于备份频率和可重放的源数据；RTO 取决于快照大小、存储和网络吞吐量、导入并发度、Schema 对账和验证时间。

### 双活故障转移

GreptimeDB 企业版支持 Standalone 实例之间的双活故障转移。复制是异步的，因此源节点及其本地存储在复制完成前同时丢失时，待同步的数据可能尚未出现在对端。故障模型和操作流程参见[双活故障转移](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md)。

<AnchorAlias id="solution-comparison" />
<AnchorAlias id="解决方案比较" />

## 比较和验证

| 方式 | 主要保护范围 | RPO 的主要影响因素 | RTO 的主要影响因素 |
| --- | --- | --- | --- |
| Standalone 备份恢复 | 备份覆盖范围内的主机或磁盘卷故障 | 备份间隔和源数据重放能力 | 资源准备和恢复耗时 |
| 分布式 Region Failover | 共享依赖仍然可用时的 Datanode 故障 | Remote WAL 和存储持久性 | 故障检测、Region 打开和备用容量 |
| 跨 Region 集群 | 已测试且其他依赖仍可用的故障域 | 每一层状态的跨 Region 持久性 | 故障检测、依赖切换、路由和备用容量 |
| 数据和元数据导出导入 | 导出内容覆盖的逻辑故障或整个部署故障 | 导出周期和源数据重放能力 | 导入和验证耗时 |
| 企业版双活 | 一个 Standalone 对端或站点故障 | 复制延迟和故障类型 | 外部流量切换和对端就绪状态 |

通过故障演练测量 RPO 和 RTO。测试应包含依赖组件故障，而不只是终止 Datanode；确认查询结果达到预期恢复点后，才能判断服务已经恢复。
