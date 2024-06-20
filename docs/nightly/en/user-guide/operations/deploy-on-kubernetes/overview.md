# Overview

This guide provides a walkthrough on how to deploy a GreptimeDB cluster on Kubernetes.

## Components

The deployment on Kubernetes involves the following components:

- GreptimeDB Operator: Assists engineers in managing GreptimeDB clusters effectively on Kubernetes.
- etcd Cluster. etcd is a consistent and highly-available key value store used for GreptimeDB cluster metadata storage.
- GreptimeDB Cluster: The main database cluster.

## Prerequisites

Before initiating the deployment of GreptimeDB on Kubernetes,
ensure you have the necessary tools downloaded,
the Kubernetes cluster prepared, and the namespaces created.

### Tools

During the deployment process,
you will need to use the following tools in addition to [Kubernetes](https://kubernetes.io/):

- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/): A tool for creating Kubernetes clusters.
- [Helm](https://helm.sh/docs/intro/install/): A package manager for Kubernetes.
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl): A command-line tool for interacting with Kubernetes clusters.

### Create a Kubernetes Cluster

You can use [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) to create a Kubernetes cluster for GreptimeDB:

```shell
kind create cluster --name greptimedb
```

### Create Namespaces

For better isolation and scalability.
It is recommended to use separate namespaces for the GreptimeDB Operator, etcd cluster, and GreptimeDB cluster.

The following example shows how to create these namespaces:

```shell
kubectl create namespace greptimedb-admin
kubectl create namespace etcd
kubectl create namespace greptimedb-cluster
```

### Add Helm repository

You can find the maintained [Helm charts](https://github.com/GreptimeTeam/helm-charts) in the Github repository.
Use the command below to add the GreptimeDB Helm chart repository.

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
```

```shell
helm repo update
```

## Next Steps

Once the cluster is set up，proceed with the following steps to deploy GreptimeDB on Kubernetes:

- [GreptimeDB Opertator](greptimedb-operator.md): This section guides you on installing the GreptimeDB Operator, which manages GreptimeDB clusters on Kubernetes.
- [Deploy GreptimeDB Cluster](deploy-greptimedb.md): This section provides instructions on how to deploy a GreptimeDB cluster on Kubernetes.
- [Destroy Cluster](destroy-cluster.md): This section explains how to uninstall the GreptimeDB Operator and the GreptimeDB cluster.
