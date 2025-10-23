---
keywords: [WAL, 预写日志, 本地 WAL, Remote WAL, GreptimeDB]
description: 介绍 GreptimeDB 中的 WAL（预写日志），包括本地 WAL 和远程 WAL 的优缺点。
---
# 概述

[预写日志](/contributor-guide/datanode/wal.md#introduction)(WAL) 是 GreptimeDB 的关键组件之一，负责持久化记录每次数据修改操作，以确保内存中的数据在故障发生时不会丢失。GreptimeDB 支持三种 WAL 存储方案：


- **本地 WAL**: 使用嵌入式存储引擎 [raft-engine](https://github.com/tikv/raft-engine) ，直接集成在 [Datanode](/user-guide/concepts/why-greptimedb.md) 服务中。

- **Remote WAL**: 使用 [Apache Kafka](https://kafka.apache.org/) 作为外部的 WAL 存储组件。

- **Noop WAL**: 无操作 WAL 提供者，用于 WAL 暂时不可用的紧急情况，不存储任何数据。

## 本地 WAL

### 优点

- **低延迟**: 本地 WAL 运行于 Datanode 进程内，避免了网络传输开销，提供更低的写入延迟。

- **易于部署**: 由于 WAL 与 Datanode 紧耦合，无需引入额外组件，部署和运维更加简便。

- **零 RPO**: 在云环境中部署 GreptimeDB 时，可以结合云存储服务（如 AWS EBS 或 GCP Persistent Disk）将 WAL 数据持久化存储，从而实现零[恢复点目标](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Point_Objective) (RPO)，即使发生故障也不会丢失任何已写入的数据。

### 缺点

- **高 RTO**: 由于 WAL 与 Datanode 紧密耦合，[恢复时间目标](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective) (RTO) 相对较高。在 Datanode 重启后，必须重放 WAL 以恢复最新数据，在此期间节点保持不可用。

- **单点访问限制**: 本地 WAL 与 Datanode 进程紧密耦合，仅支持单个消费者访问，限制了区域热备份和 [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md) 等功能的实现。

## Remote WAL

### 优点

- **低 RTO**: 通过将 WAL 与 Datanode 解耦，[恢复时间目标](https://en.wikipedia.org/wiki/Disaster_recovery#Recovery_Time_Objective) (RTO) 得以最小化。当 Datanode 崩溃时，Metasrv 会发起 [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) ，将受影响 Region 迁移至健康节点，无需本地重放 WAL。


- **多消费者订阅**: Remote WAL 支持多个消费者同时订阅 WAL 日志，实现 Region 热备和 [Region Migration](/user-guide/deployments-administration/manage-data/region-migration.md) 等功能，提升系统的高可用性和灵活性。


### 缺点

- **外部依赖**: Remote WAL 依赖外部 Kafka 集群，增加了部署和运维复杂度。

- **网络开销**: WAL 数据需通过网络传输，需合理规划集群网络带宽，确保低延迟与高吞吐量，尤其在写入密集型负载下。

## Noop WAL

Noop WAL 是一种特殊的 WAL 提供者，用于 WAL 暂时不可用的紧急情况。它不会存储任何 WAL 数据，仅在集群模式下可用。

详细配置说明请参阅 [Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md)。

## 后续步骤

- 如需配置本地 WAL 存储，请参阅[本地 WAL](/user-guide/deployments-administration/wal/local-wal.md)。

- 想了解更多 Remote WAL 相关信息，请参阅 [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md)。

- 想了解更多 Noop WAL 相关信息，请参阅 [Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md)。