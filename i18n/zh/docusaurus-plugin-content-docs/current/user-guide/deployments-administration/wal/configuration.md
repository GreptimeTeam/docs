---
keywords: [配置, 本地 WAL, GreptimeDB Datanode, GreptimeDB]
description: 介绍如何配置 GreptimeDB 中的本地 WAL。
---

# 配置

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

| Configuration Option | Description                                                                                                          | Default Value     | Provider      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| `provider`           | The provider of the WAL. Options: `raft_engine` (local file system storage) or `kafka` (remote WAL storage in Kafka) | `"raft_engine"`   | All           |
| `dir`                | The directory where to write logs                                                                                    | `{data_home}/wal` | `raft_engine` |
| `file_size`          | The maximum size of the WAL log file                                                                                 | `128MB`           | `raft_engine` |
| `purge_threshold`    | The threshold of the WAL size to trigger purging                                                                     | `1GB`             | `raft_engine` |
| `purge_interval`     | The interval to trigger purging                                                                                      | `1m`              | `raft_engine` |
| `read_batch_size`    | The read batch size                                                                                                  | `128`             | `raft_engine` |
| `sync_write`         | Whether to call fsync when writing every log                                                                         | `false`           | `raft_engine` |

## 最佳实践

### 使用单独的高性能卷作为 WAL 目录
在部署 GreptimeDB 时，配置单独的卷作为 WAL 目录具有显著优势。这样做可以：


- 使用高性能磁盘——包括专用物理卷或自定义的高性能 `StorageClass`，以提升 WAL 的写入吞吐量。
- 隔离 WAL I/O 与缓存文件访问，降低 I/O 竞争，提升整体系统性能。


如果你使用 Helm Chart 部署 GreptimeDB，可以参考[常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)了解如何配置专用 WAL 卷。

