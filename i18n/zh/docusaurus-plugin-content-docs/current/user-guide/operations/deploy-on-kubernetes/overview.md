# 概述

本指南提供了在 Kubernetes 上部署 GreptimeDB 集群的步骤。

## 前置条件

- Kubernetes >= 1.18

  :::tip 注意
  你可以使用 [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) 或 [Minikube](https://minikube.sigs.k8s.io/docs/start/) 创建一个用于测试的本地 Kubernetes 集群。
  :::

- [Helm v3](https://helm.sh/docs/intro/install/)：Kubernetes 的包管理器。

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl)：用于与 Kubernetes 集群交互的命令行工具。

## 添加 Helm 仓库

你使用以下命令添加 GreptimeDB Helm chart 仓库。

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

你可以在 Github 仓库中找到维护的 [Helm charts](https://github.com/GreptimeTeam/helm-charts)。

或者你也可以直接使用阿里云的 OCI 仓库，比如：

```shell
helm upgrade --install mycluster \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --values ./values.yaml
```

当使用 OCI 仓库的时候**无需显式**地添加 Helm 仓库。**中文文档会以阿里云的 OCI 仓库为主以提升网络速度**，如果有其他仓库，会在文档中说明。

## 组件

在 Kubernetes 上部署 GreptimeDB 涉及以下组件：

- GreptimeDB Operator：帮助工程师在 Kubernetes 上有效地管理 GreptimeDB 集群。
- GreptimeDB 集群：主数据库集群。
- etcd 集群：etcd 是用于 GreptimeDB 集群元数据存储的一致且高可用的键值存储。

## 下一步

请按照以下步骤继续操作：

- [GreptimeDB Operator](greptimedb-operator.md)：本章节指导你安装 GreptimeDB Operator。
- [部署GreptimeDB集群](deploy-greptimedb-cluster.md)：本节介绍了如何在 Kubernetes 上部署 etcd 集群和 GreptimeDB 集群。
- [销毁集群](destroy-cluster.md)：本节介绍如何卸载 GreptimeDB Operator 和 GreptimeDB 集群。
