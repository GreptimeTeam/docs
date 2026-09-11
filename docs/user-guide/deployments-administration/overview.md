---
keywords: [deployment, administration, Kubernetes, configuration, monitoring, disaster recovery, performance tuning, upgrade]
description: Running GreptimeDB on your own infrastructure — deployment, configuration, day-to-day operations, durability, and performance tuning.
---

# Deployments & Administration

This section covers running GreptimeDB on your own infrastructure. Start with [Architecture](/user-guide/concepts/architecture.md) to see which components you will deploy and operate. GreptimeCloud runs the same engine as a managed service, with deployment and maintenance handled for you.

## Deploy

- [Configuration](configuration.md) — protocol, storage, and runtime settings to review before the first deployment.
- [Deploy on Kubernetes](./deploy-on-kubernetes/overview.md) — deployment through the GreptimeDB Operator.
- [Capacity Planning](./capacity-plan.md) — sizing compute, memory, and local cache for the expected ingestion rate and query mix.
- [Authentication](./authentication/overview.md) — not enabled by default.
- [Run on Android](run-on-android.md) — for edge deployments on Android devices.

## Operate

- [Monitoring](./monitoring/overview.md) — cluster health and performance through metrics, tracing, and runtime information.
- [Table and Region Operations](./manage-data/overview.md) — table operations, sharding, Region migration and failover, repartition, compaction, and garbage collection.
- [Metadata Storage](./manage-metadata/overview.md) — the metadata backend the cluster depends on.
- [Maintenance](./maintenance/maintenance-mode.md) — maintenance mode, recovery mode, table reconciliation, and sequence management.
- [Upgrade](./upgrade.md) — moving a deployment to a newer version.
- [Troubleshooting](./troubleshooting.md) — collecting the information needed to diagnose a problem.

## Durability and recovery

- [Write-Ahead Logging (WAL)](./wal/overview.md) — local and Remote WAL, including the [Remote WAL setup](./wal/remote-wal/configuration.md) that cluster failover depends on.
- [Disaster Recovery](./disaster-recovery/overview.md) — backup, restore, and cross-region options.

## Performance

- [Performance Tuning](./performance-tuning/performance-tuning-tips.md) — cache, query, and ingestion settings to adjust from runtime evidence.
- [Design Table Schema](./performance-tuning/design-table.md) — primary keys, indexes, append-only mode, and partitioning.
