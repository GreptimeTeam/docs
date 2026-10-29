---
keywords: [备份元数据, 备份数据库, GreptimeDB 备份]
description: GreptimeDB 备份指南，包括备份元数据和数据库的步骤。
---

# 备份

## 备份元数据

GreptimeDB 集群的元数据存储可以存储在 etcd 或者关系数据库中。对于重要的集群，建议使用云厂商提供的关系数据库服务（rds）并开启定期备份功能。

请参考[元数据导出与导入工具](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-meta-data.md) 了解更多细节。

## 备份数据库

由于对象存储一般会存储多个副本，如果 GreptimeDB 的数据存储在对象存储上，则通常无需再额外备份数据库。你也可以考虑开启对象存储的多版本特性，以避免出现误操作导致的数据丢失。

你还可以使用 GreptimeDB 的 `COPY DATABASE` 功能来创建备份。
请参考[数据导出和导入工具](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data.md)文档了解更多信息。

