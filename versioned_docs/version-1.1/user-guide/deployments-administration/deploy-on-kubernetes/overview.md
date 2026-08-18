---
keywords: [Kubernetes, deployment, GreptimeDB Operator, setup, provisioning, management]
description: Overview of deploying GreptimeDB on Kubernetes using the GreptimeDB Operator, including setup, provisioning, and management of clusters and standalone instances.
---

# Deploy GreptimeDB on Kubernetes

GreptimeDB runs on Kubernetes, on-premises or on any cloud provider such as AWS, Alibaba Cloud, or Google Cloud.

## Deploy GreptimeDB Standalone

For development, testing, or small-scale production use cases, you can [deploy a standalone GreptimeDB instance](deploy-greptimedb-standalone.md) on Kubernetes, without running a full cluster.

## Deploy GreptimeDB Cluster

For production environments requiring high availability and horizontal scaling,
[deploy a GreptimeDB cluster](deploy-greptimedb-cluster.md) using the GreptimeDB Operator on Kubernetes.

## Configurations

You can apply custom configurations to GreptimeDB by creating a `values.yaml` file
when deploying either GreptimeDB clusters or standalone instances.
For a complete list of available configuration options, see [Common Helm Chart Configurations](./common-helm-chart-configurations.md).

## Manage GreptimeDB Operator

The GreptimeDB Operator automates the setup, provisioning, and management of GreptimeDB instances on Kubernetes.
Learn how to [manage the GreptimeDB Operator](./greptimedb-operator-management.md),
including installation and upgrades.

## Advanced Deployments

Once you know [the architecture and components of GreptimeDB](/user-guide/concepts/architecture.md), you can move on to these deployment scenarios:

- [Deploy GreptimeDB Infrastructure test](deploy-greptimedb-infra-test.md): Prerequisite infrastructure testing for installing GreptimeDB.
- [Deploy MinIO cluster](deploy-minio.md): Learn how to deploy, configure, and monitor a MinIO cluster.
- [Deploy Kafka cluster](deploy-kafka.md): Learn how to deploy, configure, and monitor a Kafka cluster.
- [Deploy GreptimeDB Cluster with Remote WAL](configure-remote-wal.md): Configure Kafka as a remote write-ahead log (WAL) for your GreptimeDB cluster to persistently record every data modification and ensure no loss of memory-cached data.
- [Use MySQL/PostgreSQL as Metadata Store](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md#configuring-metasrv-backend-storage): Store cluster metadata in a MySQL or PostgreSQL database.
- [Deploy Multi-Frontend GreptimeDB Cluster](configure-frontend-groups.md): Set up a GreptimeDB cluster on Kubernetes with a frontend group consisting of multiple frontend instances for improved load distribution and availability.

