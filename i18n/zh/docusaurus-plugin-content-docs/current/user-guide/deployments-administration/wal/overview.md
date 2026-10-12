---
title: "GreptimeDB WAL 概述"
keywords: [WAL, 预写日志, 本地 WAL, Remote WAL, GreptimeDB]
description: 介绍 GreptimeDB 中的 WAL（预写日志），包括本地 WAL 和远程 WAL 的优缺点。
---
# 预写日志（WAL）

[预写日志](/contributor-guide/datanode/wal.md#introduction)(WAL) 持久化记录每次数据修改操作，以确保内存中的数据在故障发生时不会丢失。GreptimeDB 支持四种 WAL 存储方案：


- **本地 WAL**: 使用嵌入式存储引擎 [raft-engine](https://github.com/tikv/raft-engine) ，直接集成在 [Datanode](/user-guide/concepts/architecture.md) 服务中。

- **Remote WAL**: 使用 [Apache Kafka](https://kafka.apache.org/) 作为外部的 WAL 存储组件。

- **对象存储 WAL**: 实验性的单机模式 WAL 提供者，把 WAL 以对象的形式写入 S3 等对象存储。

- **Noop WAL**: 无操作 WAL 提供者，用于 WAL 暂时不可用的紧急情况，不存储任何数据。

## 本地 WAL

### 优点

- **低延迟**: 本地 WAL 运行于 Datanode 进程内，避免了网络传输开销，提供更低的写入延迟。

- **无需额外组件**：WAL 与 Datanode 同进程，不需要再部署和运维其他组件。

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

## 对象存储 WAL

对象存储 WAL 是单机模式下的实验性 WAL 提供者。它把所有 Region 的 WAL 条目攒成批次，每个批次作为一个对象写入 S3 等对象存储。

### 优点

- **无需额外组件**：WAL 可以和数据文件共用同一个对象存储，不需要再部署和运维其他组件。

- **对象存储级别的持久性**：默认情况下，写入只有在对象存储中持久化之后才会确认，持久性与对象存储本身一致。

- **WAL 无需持久卷**：Datanode 不需要为 WAL 准备本地持久卷。不过单机模式的元数据仍然保存在数据目录下。

### 缺点

- **写入延迟更高**：默认情况下，一次写入要等所在批次写成对象后才返回，云对象存储上每次创建对象需要几十毫秒。

- **请求成本**：每个对象都是一次对象存储请求，在默认 flush 间隔下每个节点每秒最多 10 次。

- **实验性且仅支持单机模式**：不支持集群模式，配置和行为后续可能调整。

详细配置说明请参阅[对象存储 WAL](/user-guide/deployments-administration/wal/object-store-wal.md)。

## Noop WAL

Noop WAL 是一种特殊的 WAL 提供者，用于 WAL 暂时不可用的紧急情况。它不会存储任何 WAL 数据，仅在集群模式下可用。

详细配置说明请参阅 [Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md)。

## 后续步骤

- [本地 WAL](/user-guide/deployments-administration/wal/local-wal.md)——内置 WAL 的配置方式。

- [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md)——把 Kafka 作为 WAL 后端的配置方式。

- [对象存储 WAL](/user-guide/deployments-administration/wal/object-store-wal.md)——单机模式下把 WAL 存入对象存储的配置方式（实验性）。

- [Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md)——应急用的空实现 provider。