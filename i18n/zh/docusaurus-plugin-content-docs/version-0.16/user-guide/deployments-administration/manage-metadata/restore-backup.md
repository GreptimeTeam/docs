---
 keywords: [GreptimeDB, 元数据备份, 恢复, 迁移, etcd, MySQL, PostgreSQL, 灾难恢复]
 description: 介绍如何在不同的存储后端（etcd、MySQL、PostgreSQL）之间备份、恢复和迁移 GreptimeDB 元数据，以及确保数据一致性的最佳实践。
---

# 备份、恢复和迁移

GreptimeDB 通过其 CLI 工具提供元数据备份和恢复功能。该功能支持所有主要的元数据存储后端，包括 etcd、MySQL 和 PostgreSQL。有关使用这些功能的详细说明，请参阅[备份和恢复](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data.md)指南。

## 备份

为了获得最佳的备份可靠性，建议在 DDL（数据定义语言）操作（即建表、删表、修改表结构等）较少的时段进行元数据备份。这有助于确保数据一致性，并降低部分或不完整备份的风险。

执行备份的步骤：

1. 确认 GreptimeDB 集群处于正常运行状态
2. 使用 CLI 工具执行备份，按照[备份和恢复](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md)指南中的导出元数据步骤操作
3. 确保备份输出文件已创建，且文件大小大于 0

## 恢复

从备份恢复的步骤：

1. 使用 CLI 工具恢复元数据，按照[备份和恢复](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md)指南中的导入元数据步骤操作
2. 重启 GreptimeDB 集群以应用恢复的元数据

## 迁移

我们建议在 DDL（数据定义语言）操作（即建表、删表、修改表结构等）较少的时段进行元数据迁移，以确保数据一致性并降低部分或不完整迁移的风险。

将元数据从一个存储后端迁移到另一个存储后端的步骤：

1. 从源存储备份元数据
2. 将元数据恢复到目标存储
3. 重启整个 GreptimeDB 集群（所有组件）以应用恢复的元数据