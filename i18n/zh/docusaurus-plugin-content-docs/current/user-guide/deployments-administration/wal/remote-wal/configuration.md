---
keywords: [GreptimeDB Remote WAL, 配置, Kafka, Metasrv, Datanode, GreptimeDB]
description: 本节介绍如何配置 GreptimeDB 集群的 Remote WAL。
---
# 配置

GreptimeDB 支持使用 Kafka 实现 Remote WAL 存储。要启用 Remote WAL，需要分别配置 Metasrv 和 Datanode。

如果你使用 Helm Chart 部署 GreptimeDB，可以参考[常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)了解如何配置 Remote WAL。

## Metasrv 配置

Metasrv 负责 Kafka topics 的管理及过期 WAL 数据的自动清理。

```toml
[wal]
provider = "kafka"
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

# WAL 数据清理策略
auto_prune_interval = "0s"
auto_prune_parallelism = 10

# Topic 自动创建配置
auto_create_topics = true
num_topics = 64
replication_factor = 1
topic_name_prefix = "greptimedb_wal_topic"
```

### 配置

| 配置项                   | 说明                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| `provider`               | 设置为 `"kafka"` 以启用 Remote WAL。                                   |
| `broker_endpoints`       | Kafka broker 的地址列表。                                              |
| `auto_prune_interval`    | 自动清理过期 WAL 的间隔时间，设为 `"0s"` 表示禁用。                    |
| `auto_prune_parallelism` | 并发清理任务的最大数量。                                               |
| `auto_create_topics`     | 是否自动创建 Kafka topic，设为 `false` 时需手动预创建。                |
| `num_topics`             | 用于存储 WAL 的 Kafka topic 数量。                                     |
| `replication_factor`     | 每个 topic 的副本数量。                                                |
| `topic_name_prefix`      | Kafka topic 名称前缀，必须匹配正则 `[a-zA-Z_:-][a-zA-Z0-9_:\-\.@#]*`。 |

#### Kafka Topic 与权限要求

请确保以下设置正确，以保证 Remote WAL 正常运行：

- 如果 `auto_create_topics = false`：
  - 必须**在启动 Metasrv 之前**手动创建好所有 WAL topics；
  - Topic 名称必须符合 `{topic_name_prefix}_{index}` 的格式，其中 index 的取值范围是 `0` 到 `{num_topics - 1}`。例如，默认前缀为 `greptimedb_wal_topic`，且 `num_topics = 64` 时，需要创建从 `greptimedb_wal_topic_0` 到 `greptimedb_wal_topic_63` 的 topic。
  - Topic 必须配置为支持**LZ4 压缩**。
- Kafka 用户需具备以下权限：
  - 对 topics 追加数据；
  - 读取 topics 中数据；
  - 删除 topics 中数据； 
  - 若启用自动创建（`auto_create_topics = true`），还需具备 创建 topic 的权限。

## Datanode 配置

Datanode 负责将数据写入 Kafka 并从中读取数据。

```toml
[wal]
provider = "kafka"
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]
max_batch_bytes = "1MB"
overwrite_entry_start_id = true
```

### 配置

| 配置项                     | 说明                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `provider`                 | 设置为 `"kafka"` 以启用 Remote WAL。                                                         |
| `broker_endpoints`         | Kafka broker 的地址列表。                                                                    |
| `max_batch_bytes`          | 每个写入批次的最大大小，默认不能超过 Kafka 配置的单条消息上限（通常为 1MB）。                |
| `overwrite_entry_start_id` | 若设为 `true`，在 WAL 回放时跳过缺失的 entry，避免 out-of-range 错误（但可能掩盖数据丢失）。 |


#### 注意事项与限制

:::warning 重要：Kafka 保留策略配置
请非常小心地配置 Kafka 保留策略以避免数据丢失。GreptimeDB 会自动回收不需要的 WAL 数据，因此在大多数情况下你不需要设置保留策略。但是如果你确实需要设置，请确保以下几点：

- **基于大小的保留策略**：通常不需要设置，因为数据库会管理自己的数据生命周期
- **基于时间的保留策略**：如果你选择设置此项，请确保它**远大于自动刷新间隔（auto-flush-interval）**以防止过早删除数据

不当的保留设置可能导致数据丢失，如果 WAL 数据在 GreptimeDB 处理之前被删除。
:::

- 如果 `overwrite_entry_start_id = true`：
  - 确保 Metasrv 中的 `auto_prune_interval` 已启用，以允许自动清理 WAL；
  - Kafka topics 不应使用**基于大小保留策略**；
  - 如果启用基于时间的保留策略，请确保保留期**远大于自动刷新间隔（auto-flush-interval）**，至少是它的两倍。

- 确保 Datanode 使用的 Kafka 用户具有以下权限：
  - 对 topics 追加数据；
  - 读取 topics 中数据；
- 确保 `max_batch_bytes` 不超过 Kafka topic 的最大消息大小（通常为 1MB）。

## Kafka 认证配置

Kafka 的认证参数在 Metasrv 和 Datanode 的 `[wal]` 段中配置。

### SASL 认证

支持的 SASL 机制包括：`PLAIN`、`SCRAM-SHA-256` 和 `SCRAM-SHA-512`。

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

[wal.sasl]
type = "SCRAM-SHA-512"
username = "user"
password = "secret"
```

### TLS

要启用 TLS，可在 `[wal.tls]` 段进行配置，支持以下几种方式：

#### 使用系统 CA 证书

无需提供证书路径，自动使用系统信任的 CA：

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

[wal.tls]
```

#### 使用自定义 CA 证书

用于 Kafka 集群使用私有 CA 的场景：

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

[wal.tls]
server_ca_cert_path = "/path/to/server.crt"
```

#### 使用双向 TLS（mTLS）

同时提供客户端证书与私钥：

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]
[wal.tls]
server_ca_cert_path = "/path/to/server_cert"
client_cert_path = "/path/to/client_cert"
client_key_path = "/path/to/key"
```

