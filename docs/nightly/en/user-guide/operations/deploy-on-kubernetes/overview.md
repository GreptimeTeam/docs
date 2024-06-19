# Overview

This guide will walk you through the process of deploying a GreptimeDB cluster on Kubernetes.

## Create a Kubernetes Cluster

Before beginning, you can use [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) to create a Kubernetes cluster for GreptimeDB:

```shell
kind create cluster --name greptimedb
```

## Next Steps

Once the cluster is set up，follow the steps below to deploy GreptimeDB on Kubernetes:

- [GreptimeDB Opertator](greptimedb-operator.md): Install GreptimeDB Operator to manage GreptimeDB clusters on Kubernetes.
- [Deploy GreptimeDB Cluster](deploy-greptimedb.md): Learn how to deploy GreptimeDB cluster on Kubernetes.
- [Destroy Cluster](destroy-cluster.md): Uninstall GreptimeDB Operator and the GreptimeDB cluster.
