---
keywords: [deployment, configuration, authentication, Kubernetes, Android, capacity planning, GreptimeCloud]
description: Overview of deploying GreptimeDB, including configuration, authentication, Kubernetes deployment, running on Android, capacity planning, and using GreptimeCloud.
---

# Deployments & Administration

GreptimeDB can be deployed and managed either on your own infrastructure or through GreptimeCloud.
This guide provides an overview of deployment strategies, configuration, monitoring, and administration.

## Self-Managed GreptimeDB Deployment

This section outlines the key aspects of deploying and administering GreptimeDB in your own environment.

### Configuration and Deployment

- **Configuration:** Before deployment, [check the configuration](configuration.md) to suit your requirements, including protocol settings, storage options, and more.
- **Authentication:** By default, authentication is not enabled. Learn how to [enable and configure authentication](./authentication/overview.md) for secure deployments.
- **Kubernetes Deployment:** Follow the [step-by-step guide](./deploy-on-kubernetes/overview.md) to deploy GreptimeDB on Kubernetes.
- **Capacity Planning:** Ensure your deployment can handle your workload by [planning for capacity](/user-guide/deployments-administration/capacity-plan.md).

### Component Management

- **Cluster Failover:** Set up [Remote WAL](./wal/remote-wal/configuration.md) for high availability.
- **Manage Metadata:** Set up [Metadata Storage](./manage-data/overview.md) for GreptimeDB.

### Monitoring

- **Monitoring:** [Monitor cluster's health and performance](./monitoring/overview.md) through metrics, tracing, and runtime information.

### Data Management and Performance

- **Data Management:** [Manage your data](/user-guide/deployments-administration/manage-data/overview.md) to prevent data loss, reduce costs, and optimize performance.
- **Performance Tuning:** Review [performance tuning tips](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md) and learn how to [design your table schema](/user-guide/deployments-administration/performance-tuning/design-table.md) for optimal efficiency.

### Disaster Recovery

- **Disaster Recovery:** Implement [disaster recovery strategies](/user-guide/deployments-administration/disaster-recovery/overview.md) to protect your data and ensure business continuity.

### Additional Topics

- **Run on Android:** Learn how to [run GreptimeDB on Android devices](run-on-android.md).
- **Upgrade:** Follow the [upgrade guide](/user-guide/deployments-administration/upgrade.md) to keep the version of GreptimeDB up to date.

## GreptimeCloud

For a fully managed experience,
consider [GreptimeCloud](https://greptime.cloud).
GreptimeCloud enables you to deploy, monitor,
and scale GreptimeDB instances effortlessly, with built-in metrics monitoring and alerting.
It is designed to provide a scalable, efficient,
and serverless solution for time-series data platforms and Prometheus backends.

For more details, refer to the [GreptimeCloud documentation](https://docs.greptime.com/nightly/greptimecloud/overview).
