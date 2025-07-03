---
keywords: [Kubernetes, deployment, GreptimeDB Operator, setup, provisioning, management]
description: Overview of deploying GreptimeDB on Kubernetes using the GreptimeDB Operator, including setup, provisioning, and management of clusters and standalone instances.
---

# Deploy GreptimeDB on Kubernetes

GreptimeDB is built for cloud-native environments and can be deployed on Kubernetes since day one.

## Deploy GreptimeDB Standalone

For development, testing, or small-scale production use cases, you can [deploy a standalone GreptimeDB instance](deploy-greptimedb-standalone.md) on Kubernetes.
This provides a simple way to get started with GreptimeDB without the complexity of managing a full cluster.

## Deploy GreptimeDB Cluster

For production environments requiring high availability and scalability,
you can [deploy a GreptimeDB cluster](deploy-greptimedb-cluster.md) using the GreptimeDB Operator on Kubernetes.
This enables you to set up a distributed GreptimeDB cluster that scales horizontally and efficiently handles large volumes of data.

## Configurations

You can apply custom configurations to GreptimeDB by creating a `values.yaml` file
when deploying either GreptimeDB clusters or standalone instances.
For a complete list of available configuration options, see [Common Helm Chart Configurations](./common-helm-chart-configurations.md).

## Manage GreptimeDB Operator

The GreptimeDB Operator manages GreptimeDB deployments on Kubernetes,
automating the setup, provisioning, and management of GreptimeDB cluster instances.
This enables quick deployment and scaling of GreptimeDB in any Kubernetes environment,
whether on-premises or in the cloud.
Learn how to [manage the GreptimeDB Operator](./greptimedb-operator-management.md),
including installation and upgrades.

## Advanced Deployments

After familiarizing yourself with [the architecture and components of GreptimeDB](/user-guide/deployments-administration/architecture.md), you can explore advanced deployment scenarios:

- [Deploy GreptimeDB Cluster with Remote WAL](configure-remote-wal.md): Configure Kafka as a remote write-ahead log (WAL) for your GreptimeDB cluster to persistently record every data modification and ensure no loss of memory-cached data.
- [Use MySQL/PostgreSQL as Metadata Store](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#configuring-metasrv-backend-storage): Integrate MySQL/PostgreSQL databases to provide robust metadata storage capabilities for enhanced reliability and performance.
- [Deploy Multi-Frontend GreptimeDB Cluster](configure-frontend-groups.md): Set up a GreptimeDB cluster on Kubernetes with a frontend group consisting of multiple frontend instances for improved load distribution and availability.

