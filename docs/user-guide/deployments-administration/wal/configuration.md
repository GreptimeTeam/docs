---
keywords: [Configuration, Local WAL, GreptimeDB Datanode, GreptimeDB]
description: This section describes how to configure the Local WAL for GreptimeDB Datanode component.
---
# Configuration

This section describes how to configure the Local WAL for GreptimeDB Datanode component. 

```toml
[wal]
provider = "raft_engine"
file_size = "128MB"
purge_threshold = "1GB"
purge_interval = "1m"
read_batch_size = 128
sync_write = false
```

## Options

If you are using Helm Chart to deploy GreptimeDB, you can refer to [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) to learn how to configure the Datanode by injecting configuration files.

| Configuration Option | Description                                                                                                          | Default Value     | Provider      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| `provider`           | The provider of the WAL. Options: `raft_engine` (local file system storage) or `kafka` (remote WAL storage in Kafka) | `"raft_engine"`   | All           |
| `dir`                | The directory where to write logs                                                                                    | `{data_home}/wal` | `raft_engine` |
| `file_size`          | The maximum size of the WAL log file                                                                                 | `128MB`           | `raft_engine` |
| `purge_threshold`    | The threshold of the WAL size to trigger purging                                                                     | `1GB`             | `raft_engine` |
| `purge_interval`     | The interval to trigger purging                                                                                      | `1m`              | `raft_engine` |
| `read_batch_size`    | The read batch size                                                                                                  | `128`             | `raft_engine` |
| `sync_write`         | Whether to call fsync when writing every log                                                                         | `false`           | `raft_engine` |

## Best practices

### Using a separate High-Performance Volume for WAL
It is beneficial to configure a separate volume for the WAL (Write-Ahead Log) directory when deploying GreptimeDB. This setup allows you to:

- Leverage a high-performance disk—either a dedicated physical volume or one provisioned via a custom `StorageClass`.
- Isolate WAL I/O from cache file access, reducing I/O contention and enhancing overall system performance.

If you are using Helm Chart to deploy GreptimeDB, you can refer to [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) to learn how to configure a dedicated WAL volume.
