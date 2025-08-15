---
keywords: [配置, 本地 WAL, GreptimeDB Datanode, GreptimeDB]
description: 介绍如何配置 GreptimeDB 中的本地 WAL。
---

# 本地 WAL

本节介绍如何配置 GreptimeDB Datanode 组件的本地 WAL。

```toml
[wal]
provider = "raft_engine"
file_size = "128MB"
purge_threshold = "1GB"
purge_interval = "1m"
read_batch_size = 128
sync_write = false
```

## 选项

如果你使用 Helm Chart 部署 GreptimeDB，可以参考[常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)了解如何通过注入配置文件以配置 Datanode。

| 配置项            | 描述                                                                                            | 默认值            |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----------------- |
| `provider`        | WAL 的提供者。可选项：`raft_engine`（本地文件系统存储）或 `kafka`（使用 Kafka 的远程 WAL 存储） | `"raft_engine"`   |
| `dir`             | 日志写入目录                                                                                    | `{data_home}/wal` |
| `file_size`       | 单个 WAL 日志文件的大小                                                                         | `128MB`           |
| `purge_threshold` | 触发清理的 WAL 总大小阈值                                                                       | `1GB`             |
| `purge_interval`  | 触发清理的时间间隔                                                                              | `1m`              |
| `read_batch_size` | 读取批次大小                                                                                    | `128`             |
| `sync_write`      | 是否在每次写入日志时调用 fsync                                                                  | `false`           |

## 最佳实践

### 使用单独的高性能卷作为 WAL 目录
在部署 GreptimeDB 时，配置单独的卷作为 WAL 目录具有显著优势。这样做可以：


- 使用高性能磁盘——包括专用物理卷或自定义的高性能 `StorageClass`，以提升 WAL 的写入吞吐量。
- 隔离 WAL I/O 与缓存文件访问，降低 I/O 竞争，提升整体系统性能。


如果你使用 Helm Chart 部署 GreptimeDB，可以参考[常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)了解如何配置专用 WAL 卷。

