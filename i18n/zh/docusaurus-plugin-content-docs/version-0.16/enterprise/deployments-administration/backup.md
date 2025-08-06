---
keywords: [备份元数据, 备份数据库, GreptimeDB 备份]
description: GreptimeDB 备份指南，包括备份元数据和数据库的步骤。
---

# 备份

## 备份元数据

GreptimeDB 集群的元数据存储可以存储在 etcd 或者关系数据库中。对于重要的集群，建议使用云厂商提供的关系数据库服务（rds）并开启定期备份功能。如果使用的是 etcd，可以定期使用 [etcd 官方提供的工具](https://etcd.io/docs/v3.5/op-guide/recovery/)备份 etcd 的数据。

## 备份数据库

由于对象存储一般会存储多个副本，如果 GreptimeDB 的数据存储在对象存储上，则通常无需再额外备份数据库。你也可以考虑开启对象存储的多版本特性，以避免出现误操作导致的数据丢失。

如果你需要导出一个数据库的数据，可以使用 GreptimeDB 的 `COPY DATABASE` 功能。
GreptimeDB 的导出功能可以是增量的，即只备份当天写入的数据。
其原理是使用 `COPY DATABASE` 命令时，带上当天的起止时间；
GreptimeDB在执行时将该 database 当天写入的增量数据导出为 GreptimeDB 自己的数据文件并保存在硬盘上，供未来做数据恢复。

请参考 [COPY DATABASE](/reference/sql/copy.md#copy-database) 的文档了解更多信息。

