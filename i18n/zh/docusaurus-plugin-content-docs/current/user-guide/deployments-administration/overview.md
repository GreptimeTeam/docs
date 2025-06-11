---
keywords: [配置项, 鉴权, Kubernetes 部署, Android 运行, 容量规划, GreptimeCloud]
description: GreptimeDB 部署概述，包括配置项、鉴权、在 Kubernetes 上部署、在 Android 上运行、容量规划和 GreptimeCloud 的介绍。
---

# 部署

## 配置项

在部署 GreptimeDB 之前，你需要[配置服务器](configuration.md)以满足需求，
其中包括设置协议选项、存储选项等。

## 鉴权

GreptimeDB 默认不启用鉴权认证。
了解如何为你的部署手动[配置鉴权](./authentication/overview.md)。

## 部署到 Kubernetes

[在 Kubernetes 集群上部署 GreptimeDB](./deploy-on-kubernetes/overview.md)的逐步说明。

## 在 Android 上运行

[在 Android 设备上运行 GreptimeDB](run-on-android.md)的指南。

## 容量规划

了解如何[规划容量](/user-guide/administration/capacity-plan.md)以确保你的 GreptimeDB 部署能够处理你的工作负载。

## GreptimeCloud

比起管理自己的 GreptimeDB 集群，
你可以使用 [GreptimeCloud](https://greptime.cloud) 来管理 GreptimeDB 实例、监控指标和设置警报。
GreptimeCloud 是由完全托管的无服务器 GreptimeDB 提供支持的云服务，为时间序列数据平台和 Prometheus 后端提供了可扩展和高效的解决方案。
有关更多信息，请参阅[GreptimeCloud 文档](https://docs.greptime.cn/nightly/greptimecloud/overview)。

本文档介绍了在 GreptimeDB 管理中使用的策略和实践。

* [安装](/getting-started/installation/overview.md) GreptimeDB 和 [g-t-control](/reference/gtctl.md) 命令行工具
* 根据工作负载进行 GreptimeDB 的[容量规划](/user-guide/administration/capacity-plan.md)
* [管理数据](/user-guide/administration/manage-data/overview.md) 以避免数据丢失、降低成本和提高性能
* 数据库配置，请阅读[配置](/user-guide/deployments/configuration.md)参考文档
* GreptimeDB 的[灾难恢复方案](/user-guide/administration/disaster-recovery/overview.md)
* 通过[设置 Remote WAL](./remote-wal/quick-start.md) 实现 GreptimeDB 的集群容灾
* GreptimeDB 的[监控指标](/user-guide/administration/monitoring/export-metrics.md)和[链路追踪](/user-guide/administration/monitoring/tracing.md)
* [性能调优技巧](/user-guide/administration/performance-tuning-tips.md)
* 查看[数据建模指南](./design-table.md)了解常见场景下的表结构设计方式。
* [升级](/user-guide/administration/upgrade.md) GreptimeDB 到新版本
* 获取集群的[运行时信息](/user-guide/administration/runtime-info.md)