---
keywords: [升级 GreptimeDB, Metasrv 运维模式]
description: 在 Kubernetes 上升级 GreptimeDB 的步骤，包括直接升级和不使用 GreptimeDB Operator 升级集群的方式。
---

# 升级

## 直接升级

单独升级 GreptimeDB 企业版的镜像非常简单，只需要在 helm chart 中修改 `tag` 后重启即可。

## 不使用 GreptimeDB Operator 升级集群

在不使用 GreptimeDB Operator 升级集群时，在操作各组件之前（例如，滚动升级 Datanode 节点），必须手动开启 Metasrv 的运维模式。升级完成后，需等待所有组件状态恢复健康，再关闭 Metasrv 的运维模式。在开启 Metasrv 运维模式后，集群中的 Auto Balancing（如启用）以及 Region Failover（如启用）机制将暂停触发，直至运维模式关闭。

请参考[管理运维模式](/user-guide/deployments-administration/maintenance/maintenance-mode.md#管理维护模式)了解如何开启和关闭运维模式。

