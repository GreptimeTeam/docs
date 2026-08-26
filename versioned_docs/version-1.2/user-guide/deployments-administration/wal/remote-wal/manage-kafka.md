---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, installation, configuration, management]
description: How a Kafka cluster is used as GreptimeDB Remote WAL storage, and where to find its deployment and configuration requirements.
---
# Kafka

When [Remote WAL](/user-guide/deployments-administration/wal/overview.md#remote-wal) is enabled, the GreptimeDB cluster writes its write-ahead log to Kafka instead of local disks. Datanodes append WAL entries to Kafka topics, and Metasrv prunes entries that are no longer needed for recovery.

Until a region flushes to object storage, Kafka may hold the only durable copy of those writes. Treat it as a stateful dependency of the database, not as a transport buffer. Getting the retention policy wrong is the most common way to lose data here: Kafka deletes segments on its own schedule, and a WAL entry deleted before GreptimeDB replays it cannot be recovered.

- [Deploying Kafka Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-kafka.md) — installation, verification, monitoring, and uninstallation with the Bitnami Kafka Helm chart.
- [Remote WAL Configuration](/user-guide/deployments-administration/wal/remote-wal/configuration.md) — the Metasrv and Datanode `[wal]` options, plus the [required settings and limitations](/user-guide/deployments-administration/wal/remote-wal/configuration.md#required-settings-and-limitations) the Kafka cluster must satisfy.
- [Configure Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md) — a complete Helm chart example on Kubernetes.
