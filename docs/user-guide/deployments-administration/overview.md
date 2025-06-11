---
keywords: [deployment, configuration, authentication, Kubernetes, Android, capacity planning, GreptimeCloud]
description: Overview of deploying GreptimeDB, including configuration, authentication, Kubernetes deployment, running on Android, capacity planning, and using GreptimeCloud.
---

# Deployments & Administration

## Deploy and Administer GreptimeDB Yourself

This document addresses strategies and practices used in deployments and administration of GreptimeDB.

- Configuration: Before deploying GreptimeDB, you need to [configure the server](configuration.md) to meet your requirements. This includes setting up protocol options, storage options, and more.
- Authentication: By default, GreptimeDB does not have authentication enabled. Learn how to [configure authentication](./authentication/overview.md) for your deployment manually.
- Deploy on Kubernetes: The step-by-step instructions for [deploying GreptimeDB on a Kubernetes cluster](./deploy-on-kubernetes/overview.md).
- Run on Android: Learn how to [run GreptimeDB on Android devices](run-on-android.md).
- Capacity Plan: Understand how to [plan for capacity](/user-guide/deployments-administration/capacity-plan.md) to ensure your GreptimeDB deployment can handle your workload.
- [Installation](/getting-started/installation/overview.md) for GreptimeDB and the [g-t-control](/reference/gtctl.md) command line tool
- [Manage Data](/user-guide/deployments-administration/manage-data/overview.md) for avoiding data loss, lower cost and better performance
- Database Configuration, please read the [Configuration](/user-guide/deployments-administration/configuration.md) reference
- GreptimeDB [Disaster Recovery](/user-guide/deployments-administration/disaster-recovery/overview.md)
- Cluster Failover for GreptimeDB by [Setting Remote WAL](./remote-wal/quick-start.md)
- [Monitoring metrics](/user-guide/deployments-administration/monitoring/export-metrics.md) and [Tracing](/user-guide/deployments-administration/monitoring/tracing.md) for GreptimeDB
- [Performance Tuning Tips](/user-guide/deployments-administration/performance-tuning-tips.md)
- Read [Design Your Table Schema](./design-table.md) to learn how to design your table schema in GreptimeDB for optimal performance and query efficiency
- [Upgrade](/user-guide/deployments-administration/upgrade.md) GreptimeDB to a new version
- Get the [runtime information](/user-guide/deployments-administration/runtime-info.md) of the cluster

## GreptimeCloud

Instead of managing your own GreptimeDB cluster,
you can use [GreptimeCloud](https://greptime.cloud) to manage GreptimeDB instances, monitor metrics, and set up alerts.
GreptimeCloud is a cloud service powered by fully-managed serverless GreptimeDB, providing a scalable and efficient solution for time-series data platforms and Prometheus backends.
For more information, see the [GreptimeCloud documentation](https://docs.greptime.com/nightly/greptimecloud/overview).
