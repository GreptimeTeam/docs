---
description: GreptimeDB 部署概述，包括配置项、鉴权、在 Kubernetes 上部署、在 Android 上运行、容量规划和 GreptimeCloud 的介绍。
---

# 概述

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
