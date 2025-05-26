---
keywords: [Kubernetes 部署, GreptimeDB 单机版, 安装]
description: 在 Kubernetes 上部署 GreptimeDB 单机版的指南。
---

# 立即开始

在该指南中，你将学会如何在 Kubernetes 上部署 GreptimeDB 单机版。

:::note
以下输出可能会因 Helm chart 版本和具体环境的不同而有细微差别。
:::

## 前置条件

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) >= v0.20.0

## 创建一个测试 Kubernetes 集群

:::warning
不建议在生产环境或性能测试中使用 `kind`。如有这类需求建议使用公有云托管的 Kubernetes 服务，如 [Amazon EKS](https://aws.amazon.com/eks/)、[Google GKE](https://cloud.google.com/kubernetes-engine/) 或 [Azure AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/)，或者自行搭建生产级 Kubernetes 集群。
:::

目前有很多方法可以创建一个用于测试的 Kubernetes 集群。在本指南中，我们将使用 [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) 来创建一个本地 Kubernetes 集群。如果你想使用已有的 Kubernetes 集群，可以跳过这一步。

这里是一个使用 `kind` v0.20.0 的示例：

```bash
kind create cluster
```

<details>
  <summary>Expected Output</summary>
```log
Creating cluster "kind" ...
 ✓ Ensuring node image (kindest/node:v1.27.3) 🖼
 ✓ Preparing nodes 📦
 ✓ Writing configuration 📜
 ✓ Starting control-plane 🕹️
 ✓ Installing CNI 🔌
 ✓ Installing StorageClass 💾
Set kubectl context to "kind-kind"
You can now use your cluster with:
kubectl cluster-info --context kind-kind
Not sure what to do next? 😅  Check out https://kind.sigs.k8s.io/docs/user/quick-start/
```
</details>

使用以下命令检查集群的状态：

```bash
kubectl cluster-info
```

<details>
  <summary>预期输出</summary>
```bash
Kubernetes control plane is running at https://127.0.0.1:60495
CoreDNS is running at https://127.0.0.1:60495/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```
</details>

:::note
中国大陆用户如有网络访问问题，可使用 Greptime 提供的位于阿里云镜像仓库的 `kindest/node:v1.27.3` 镜像：

```bash
kind create cluster --image greptime-registry.cn-hangzhou.cr.aliyuncs.com/kindest/node:v1.27.3
```
:::

## 添加 Greptime Helm 仓库

:::note
中国大陆用户如有网络访问问题，可跳过这一步骤并直接参考下一步中使用阿里云 OCI 镜像仓库的方式。采用这一方式将无需手动添加 Helm 仓库。
:::

我们提供了 GreptimeDB Operator 和 GreptimeDB 集群的[官方 Helm 仓库](https://github.com/GreptimeTeam/helm-charts)。你可以通过运行以下命令来添加仓库：

```bash
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

检查 Greptime Helm 仓库中的 charts：

```bash
helm search repo greptime/greptimedb-standalone
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                          	CHART VERSION	APP VERSION	DESCRIPTION
greptime/greptimedb-standalone	0.1.53       	0.14.3     	A Helm chart for deploying standalone greptimedb
```
</details>


## 安装 GreptimeDB 单机版

### 基础安装

使用默认配置快速安装:

```bash
helm upgrade --install greptimedb-standalone greptime/greptimedb-standalone -n default
```

<details>
  <summary>Expected Output</summary>
```bash
Release "greptimedb-standalone" does not exist. Installing it now.
NAME: greptimedb-standalone
LAST DEPLOYED: Mon May 26 08:06:54 2025
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-standalone
 Chart version: 0.1.53
 GreptimeDB Standalone version: 0.14.3
***********************************************************************

Installed components:
* greptimedb-standalone

The greptimedb-standalone is starting, use `kubectl get statefulset greptimedb-standalone -n default` to check its status.
```
</details>

```bash
kubectl get pod -n default
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                      READY   STATUS    RESTARTS   AGE
greptimedb-standalone-0   1/1     Running   0          40s
```
</details>

### 自定义安装

创建自定义配置文件 `values.yaml`:

```yaml
resources:
  requests:
    cpu: "2"
    memory: "4Gi"
  limits:
    cpu: "4"
    memory: "8Gi"
```

更多配置选项请参考 [文档](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-standalone).

使用自定义配置安装:

```bash
helm upgrade --install greptimedb-standalone greptime/greptimedb-standalone \
  --values values.yaml \
  --namespace default
```

<details>
  <summary>Expected Output</summary>
```bash
Release "greptimedb-standalone" has been upgraded. Happy Helming!
NAME: greptimedb-standalone
LAST DEPLOYED: Mon May 26 08:18:27 2025
NAMESPACE: default
STATUS: deployed
REVISION: 2
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-standalone
 Chart version: 0.1.53
 GreptimeDB Standalone version: 0.14.3
***********************************************************************

Installed components:
* greptimedb-standalone

The greptimedb-standalone is starting, use `kubectl get statefulset greptimedb-standalone -n default` to check its status.
```
</details>

```bash
kubectl get pod -n default
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                      READY   STATUS    RESTARTS   AGE
greptimedb-standalone-0   1/1     Running   0          3s
```
</details>

## 访问 GreptimeDB

安装完成后，您可以通过以下方式访问 GreptimeDB:

### MySQL 协议

```bash
kubectl port-forward svc/greptimedb-standalone 4002:4002 -n default > connections.out &
```

```bash
mysql -h 127.0.0.1 -P 4002
```

<details>
  <summary>Expected Output</summary>
```bash
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.4.2 Greptime

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]>
```
</details>

### PostgreSQL 协议

```bash
kubectl port-forward svc/greptimedb-standalone 4003:4003 -n default > connections.out &
```

```bash
psql -h 127.0.0.1 -p 4003 -d public
```

<details>
  <summary>Expected Output</summary>
```bash
psql (15.12, server 16.3-greptimedb-0.14.3)
WARNING: psql major version 15, server major version 16.
         Some psql features might not work.
Type "help" for help.

public=>
```
</details>

### HTTP 协议

```bash
kubectl port-forward svc/greptimedb-standalone 4000:4000 -n default > connections.out &
```

```bash
curl -X POST \
  -d 'sql=show tables' \
  http://localhost:4000/v1/sql
```

<details>
  <summary>Expected Output</summary>
```bash
{"output":[{"records":{"schema":{"column_schemas":[{"name":"Tables","data_type":"String"}]},"rows":[["numbers"]],"total_rows":1}}],"execution_time_ms":5}[root
```
</details>

## 卸载

删除 GreptimeDB 单机版:

```bash
helm uninstall greptimedb-standalone -n default
```

```bash
kubectl delete pvc -l app.kubernetes.io/instance=greptimedb-standalone -n default
```
