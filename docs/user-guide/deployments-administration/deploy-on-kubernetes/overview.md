---
keywords: [Kubernetes, deployment, GreptimeDB Operator, setup, provisioning, management]
description: Overview of deploying GreptimeDB on Kubernetes using the GreptimeDB Operator, including setup, provisioning, and management of clusters and standalone instances.
---

# Deploy GreptimeDB on Kubernetes

## GreptimeDB on Kubernetes

GreptimeDB is a time-series database built for cloud-native environments and can be deployed on Kubernetes since day one. We provide a [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) to manage GreptimeDB on Kubernetes, automating the setup, provisioning, and management of GreptimeDB cluster and standalone instances. This makes it easy to quickly deploy and scale GreptimeDB in any Kubernetes environment, whether on-premises or in the cloud.

We **highly recommend** using the GreptimeDB Operator to deploy GreptimeDB on Kubernetes.

## Getting Started

- GreptimeDB Cluster

You can take [Getting Started](./getting-started.md) as your first guide to understand the whole picture. This guide provides the complete process of deploying the GreptimeDB cluster on Kubernetes.

- [GreptimeDB Standalone](./deploy-greptimedb-standalone.md)

## GreptimeDB Operator

- [GreptimeDB Operator Management](./greptimedb-operator-management.md)

## Monitoring

- [Cluster Monitoring Deployment](./monitoring/cluster-monitoring-deployment.md)

## Configurations

- [Common Helm Chart Configurations](./common-helm-chart-configurations.md)
