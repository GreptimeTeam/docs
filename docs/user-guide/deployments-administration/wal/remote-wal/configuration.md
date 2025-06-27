---
keywords: [GreptimeDB Remote WAL, configuration, Kafka, Metasrv, Datanode, GreptimeDB]
description: This section describes how to configure the Remote WAL for GreptimeDB Cluster.
---
# Configuration

The configuration of Remote WAL contains two parts:

- Metasrv Configuration
- Datanode Configuration

If you are using Helm Chart to deploy GreptimeDB, you can refer to [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) to learn how to configure Remote WAL.

## Metasrv Configuration

On the Metasrv side, Remote WAL is primarily responsible for managing Kafka topics and periodically pruning stale WAL records.

```toml
[wal]
provider = "kafka"
broker_endpoints = ["127.0.0.1:9092"]

# WAL data pruning options
auto_prune_interval = "0s"
auto_prune_parallelism = 10

# Topic creation options
auto_create_topics = true
num_topics = 64
replication_factor = 1
topic_name_prefix = "greptimedb_wal_topic"
```

### Options

| Configuration Option     | Description                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `provider`               | Set to "kafka" to enable Remote WAL via Kafka.                                           |
| `broker_endpoints`       | List of Kafka broker addresses.                                                          |
| `auto_prune_interval`    | Interval to automatically prune stale WAL entries. Set to "0s" to disable.               |
| `auto_prune_parallelism` | Maximum number of concurrent pruning tasks.                                              |
| `auto_create_topics`     | Whether to automatically create Kafka topics. If false, topics must be created manually. |
| `num_topics`             | Number of Kafka topics used for WAL.                                                     |
| `replication_factor`     | Kafka replication factor for each topic.                                                 |
| `topic_name_prefix`      | Prefix for Kafka topic names. Must match regex `[a-zA-Z_:-][a-zA-Z0-9_:\-\.@#]*`.        |

#### Topic Setup and Kafka Permissions 

To ensure Remote WAL works correctly with Kafka, please check the following:

- If `auto_create_topics = false`:
  - All required topics must be created manually **before** starting Metasrv.
  - Topic names must follow the pattern `{topic_name_prefix}_{index}` where `index` ranges from `0` to `{num_topics - 1}`. For example, with the default prefix `greptimedb_wal_topic` and `num_topics = 64`, you need to create topics from `greptimedb_wal_topic_0` to `greptimedb_wal_topic_63`.
  - Topics must be configured to support **LZ4 compression**.
- The Kafka user must have the following permissions:
  - **Append** records to WAL topics (requires LZ4 compression support).
  - **Read** records from WAL topics (requires LZ4 compression support).
  - **Delete** records from WAL topics.
  - **Create** topics (only required if `auto_create_topics = true`).

## Datanode Configuration

The Datanode side is mainly used to write the data to the Kafka topics and read the data from the Kafka topics.

```toml
[wal]
provider = "kafka"
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]
max_batch_bytes = "1MB"
overwrite_entry_start_id = true
```

### Options

| Configuration Option       | Description                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `provider`                 | Set to "kafka" to enable Remote WAL via Kafka.                                                                                |
| `broker_endpoints`         | List of Kafka broker addresses.                                                                                               |
| `max_batch_bytes`          | Maximum size for each Kafka producer batch.                                                                                   |
| `overwrite_entry_start_id` | If true, the Datanode will skip over missing entries during WAL replay. Prevents out-of-range errors, but may hide data loss. |


#### Required Settings and Limitations

:::warning IMPORTANT: Kafka Retention Policy Configuration
Please configure Kafka retention policy very carefully to avoid data loss. GreptimeDB will automatically recycle unneeded WAL data, so in most cases you don't need to set the retention policy. However, if you do set it, please ensure the following:

- **Size-based retention**: Typically not needed, as the database manages its own data lifecycle
- **Time-based retention**: If you choose to set this, ensure it's **significantly greater than the auto-flush-interval** to prevent premature data deletion

Improper retention settings can lead to data loss if WAL data is deleted before GreptimeDB has processed it.
:::

- If you set `overwrite_entry_start_id = true`:
  - Ensure that `auto_prune_interval` is enabled in Metasrv to allow automatic WAL pruning.
  - Kafka topics **must not use size-based retention policies**.
  - If time-based retention is enabled, the retention period should be set to a value significantly greater than auto-flush-interval, preferably at least 2 times its value.

- Ensure the Kafka user used by Datanode has the following permissions:
  - **Append** records to WAL topics (requires LZ4 compression support).
  - **Read** records from WAL topics (requires LZ4 compression support).
- Ensure that `max_batch_bytes` does not exceed Kafka’s maximum message size (typically 1MB by default).

## Kafka Authentication Configuration

Kafka authentication settings apply to both Metasrv and Datanode under the `[wal]` section.

### SASL

Kafka supports several SASL mechanisms: `PLAIN`, `SCRAM-SHA-256`, and `SCRAM-SHA-512`.

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

[wal.sasl]
type = "SCRAM-SHA-512"
username = "user"
password = "secret"
```

### TLS

You can enable TLS encryption for Kafka connections by configuring the `[wal.tls]` section. There are three common modes:

#### Using System CA Certificate

To use system-wide trusted CAs, enable TLS without providing any certificate paths:

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

[wal.tls]
```

#### Using Custom CA Certificate

If your Kafka cluster uses a private CA, specify the server CA certificate explicitly:

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]

[wal.tls]
server_ca_cert_path = "/path/to/server.crt"
```

#### Using Mutual TLS (mTLS)

To enable mutual authentication, provide both the client certificate and private key along with the server CA:

```toml
[wal]
broker_endpoints = ["kafka.kafka-cluster.svc:9092"]
[wal.tls]
server_ca_cert_path = "/path/to/server_cert"
client_cert_path = "/path/to/client_cert"
client_key_path = "/path/to/key"
```

