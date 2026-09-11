---
keywords: [部署, 运维, Kubernetes, 配置, 监控, 容灾, 性能调优, 升级]
description: 在自有基础设施上运行 GreptimeDB——部署、配置、日常运维、持久性与性能调优。
---

# 运维部署及管理

本章覆盖如何在自有基础设施上运行 GreptimeDB。先看[架构](/user-guide/concepts/architecture.md)，明确需要部署和运维哪些组件。GreptimeCloud 运行同一套引擎，以托管服务的形式提供，部署和维护由平台负责。

## 部署

- [配置](configuration.md)——首次部署前需要确认的协议、存储和运行时设置。
- [在 Kubernetes 上部署](./deploy-on-kubernetes/overview.md)——通过 GreptimeDB Operator 部署。
- [容量规划](./capacity-plan.md)——按写入量和查询负载规划计算资源、内存和本地缓存。
- [鉴权](./authentication/overview.md)——默认不启用。
- [在 Android 上运行](run-on-android.md)——用于 Android 设备上的边缘部署。

## 运维

- [监控](./monitoring/overview.md)——通过指标、trace 和运行时信息掌握集群健康状况与性能。
- [表与 Region 运维](./manage-data/overview.md)——表操作、分片、Region 迁移与 failover、重分区、compaction 和垃圾回收。
- [元数据存储](./manage-metadata/overview.md)——集群依赖的元数据后端。
- [维护操作](./maintenance/maintenance-mode.md)——集群维护模式、集群恢复模式、表元数据修复和资源标识管理。
- [升级](./upgrade.md)——把部署升级到新版本。
- [故障排查](./troubleshooting.md)——收集定位问题所需的信息。

## 持久性与恢复

- [预写日志（WAL）](./wal/overview.md)——本地 WAL 与 Remote WAL，其中 [Remote WAL 配置](./wal/remote-wal/configuration.md)是集群 failover 的前提。
- [容灾](./disaster-recovery/overview.md)——备份、恢复和跨区域方案。

## 性能

- [性能调优](./performance-tuning/performance-tuning-tips.md)——根据运行指标调整缓存、查询和写入相关配置。
- [表结构设计](./performance-tuning/design-table.md)——主键、索引、append-only 模式和分区。
