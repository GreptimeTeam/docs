# 概述

本指南提供了在 Kubernetes 上部署 GreptimeDB 集群的步骤。

## 准备工作

在开始部署 GreptimeDB 到 Kubernetes 之前，
请确保你已经下载了必要的工具，
准备好 Kubernetes，并创建了命名空间。

### 工具

在部署过程中，除了 [Kubernetes](https://kubernetes.io/) 之外，
你还需要使用以下工具：

- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/)：用于创建 Kubernetes 集群。
- [Helm](https://helm.sh/docs/intro/install/)：用于 Kubernetes 的包管理器。
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)：用于与 Kubernetes 集群交互的命令行工具。

### 创建 Kubernetes 集群

你可以使用 [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) 创建一个用于 GreptimeDB 的 Kubernetes 集群：

```shell
kind create cluster --name greptime
```

### 创建 namespace

为了更好地隔离和扩展性，
建议给 GreptimeDB Operator、etcd 集群和 GreptimeDB 集群使用单独的命名空间。

```shell
kubectl create namespace greptimedb-admin
kubectl create namespace etcd
kubectl create namespace greptimedb-cluster
```

### 添加 Helm 仓库

使用以下命令添加GreptimeDB Helm chart仓库。

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
```

```shell
helm repo update
```

你可以在 Github 仓库中找到维护的 [Helm charts](https://github.com/GreptimeTeam/helm-charts)。

## 组件

在 Kubernetes 上部署 GreptimeDB 涉及以下组件：

- GreptimeDB Operator：帮助工程师在 Kubernetes 上有效地管理 GreptimeDB 集群。
- etcd 集群：etcd 是用于 GreptimeDB 集群元数据存储的一致且高可用的键值存储。
- GreptimeDB 集群：主数据库集群。

## 下一步

请按照以下步骤继续操作：

- [GreptimeDB Operator](greptimedb-operator.md)：本章节指导你安装 GreptimeDB Operator。
- [部署GreptimeDB集群](deploy-greptimedb-cluster.md)：本节介绍了如何在 Kubernetes 上部署 etcd 集群和 GreptimeDB 集群。
- [销毁集群](destroy-cluster.md)：本节介绍如何卸载 GreptimeDB Operator 和 GreptimeDB 集群。
