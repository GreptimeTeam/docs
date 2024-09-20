# Overview

This guide provides a walkthrough on how to deploy a GreptimeDB cluster on Kubernetes.

## Prerequisites

- Kubernetes >= 1.18

  :::tip NOTE
  You can use [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) or [Minikube](https://minikube.sigs.k8s.io/docs/start/) to create a local Kubernetes cluster for testing.
  :::

- [Helm v3](https://helm.sh/docs/intro/install/): A package manager for Kubernetes.

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): A command-line tool for interacting with Kubernetes clusters.

## Add Helm repository

Use the command below to add the GreptimeDB Helm chart repository.

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

You can find the maintained [Helm charts](https://github.com/GreptimeTeam/helm-charts) in the GitHub repository.

## Components

The deployment on Kubernetes involves the following components:

- GreptimeDB Operator: Assists engineers in managing GreptimeDB clusters effectively on Kubernetes.
- GreptimeDB Cluster: The main database cluster.
- etcd Cluster: etcd is a consistent and highly available key value store used for GreptimeDB cluster metadata storage.

## Next Steps

To deploy GreptimeDB on Kubernetes, follow these steps:

- [GreptimeDB Operator](./manage-greptimedb-operator/deploy-greptimedb-operator.md): This section guides you on installing the GreptimeDB Operator.
- [Deploy GreptimeDB Cluster](deploy-greptimedb-cluster.md): This section provides instructions on how to deploy etcd cluster and GreptimeDB cluster on Kubernetes.
- [Destroy Cluster](destroy-cluster.md): This section describes how to uninstall the GreptimeDB Operator and the GreptimeDB cluster.
