---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, installation, configuration, management]
description: How a Kafka cluster is used as GreptimeDB Remote WAL storage, and where to find its deployment and configuration requirements.
---
# Manage Kafka

When [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) is enabled, the GreptimeDB cluster writes its write-ahead log to Kafka instead of local disks. Datanodes append WAL entries to Kafka topics, and Metasrv prunes entries that every region has already flushed to object storage.

This means the Kafka cluster holds data that has not been persisted anywhere else yet. Treat it as a stateful dependency of the database, not as a transport buffer.

## Deploy the Kafka cluster

Follow [Deploying Kafka Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md) for installation, verification, monitoring, and uninstallation with the Bitnami Kafka Helm chart.

## Requirements for Remote WAL

Before pointing GreptimeDB at the cluster, review [Required Settings and Limitations](/user-guide/deployments-administration/wal/remote-wal/configuration.md#required-settings-and-limitations). It covers the retention policy, the Kafka permissions Datanode needs, and the relationship between `max_batch_bytes` and Kafka's maximum message size.

Getting the retention policy wrong is the most common way to lose data here: Kafka deletes segments on its own schedule, and a WAL entry deleted before GreptimeDB replays it cannot be recovered.

## Connect GreptimeDB to Kafka

To configure the GreptimeDB cluster itself, see:

- [Remote WAL Configuration](/user-guide/deployments-administration/wal/remote-wal/configuration.md) for the Metasrv and Datanode `[wal]` options, including topic creation, WAL pruning, and Kafka authentication.
- [Configure Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md) for a complete Helm chart example on Kubernetes.
