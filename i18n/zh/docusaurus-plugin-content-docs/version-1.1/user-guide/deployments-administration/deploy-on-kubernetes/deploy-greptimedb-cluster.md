---
keywords: [Kubernetes 部署, GreptimeDB Operator, 测试集群, 安装, 验证, etcd 集群, 监控集成]
description: 在 Kubernetes 上使用 GreptimeDB Operator 部署 GreptimeDB 集群的指南，包括前置条件、创建测试集群、安装和验证步骤。
---

# 部署 GreptimeDB 集群

在该指南中，你将学会如何使用 GreptimeDB Operator 在 Kubernetes 上部署 GreptimeDB 集群。

:::note
以下输出可能会因 Helm chart 版本和具体环境的不同而有细微差别。
:::

import PreKindHelm from './_pre_kind_helm.mdx';

<PreKindHelm />

## 安装和验证 GreptimeDB Operator

现在我们准备使用 Helm 在 Kubernetes 集群上安装 GreptimeDB Operator。

### 安装 GreptimeDB Operator

[GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) 是一个用于管理 GreptimeDB 集群生命周期的 Kubernetes operator。

让我们在 `greptimedb-admin` 命名空间中安装最新版本的 GreptimeDB Operator：

```bash
helm install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin --create-namespace
```

<details>
  <summary>预期输出</summary>
```bash
NAME: greptimedb-operator
LAST DEPLOYED: Sun Apr 26 20:43:58 2026
NAMESPACE: greptimedb-admin
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-operator
 Chart version: 0.5.9
 GreptimeDB Operator version: 0.5.5
***********************************************************************

Installed components:
* greptimedb-operator

The greptimedb-operator is starting, use `kubectl get deployment greptimedb-operator -n greptimedb-admin` to check its status.
```
</details>

:::note
中国大陆用户如有网络访问问题，可直接使用阿里云 OCI 镜像仓库的方式安装 GreptimeDB Operator：

```bash
helm install greptimedb-operator \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  -n greptimedb-admin \
  --create-namespace
```

此时我们也将镜像仓库设置为 Greptime 官方的阿里云镜像仓库。
:::

:::note
我们还可以直接使用 `kubectl` 和 `bundle.yaml` 来安装最新版本的 GreptimeDB Operator：

```bash
kubectl apply -f \
  https://github.com/GreptimeTeam/greptimedb-operator/releases/latest/download/bundle.yaml \
  --server-side
```

这种方式仅适用于在测试环境快速部署 GreptimeDB Operator，不建议在生产环境中使用。
:::

### 验证 GreptimeDB Operator 安装

检查 GreptimeDB Operator 的状态：

```bash
kubectl get pods -n greptimedb-admin -l app.kubernetes.io/instance=greptimedb-operator
```

<details>
  <summary>预期输出</summary>
```bash
NAME                                   READY   STATUS    RESTARTS   AGE
greptimedb-operator-68d684c6cf-qr4q4   1/1     Running   0          4m8s
```
</details>

你也可以检查 CRD 的安装：

```bash
kubectl get crds | grep greptimedb
```

<details>
  <summary>预期输出</summary>
```bash
greptimedbclusters.greptime.io      2026-04-26T12:43:58Z
greptimedbstandalones.greptime.io   2026-04-26T12:43:58Z
```
</details>

GreptimeDB Operator 将会使用 `greptimedbclusters.greptime.io` and `greptimedbstandalones.greptime.io` 这两个 CRD 来管理 GreptimeDB 集群和单机实例。

## 安装 etcd 集群

GreptimeDB 集群需要一个 etcd 集群来存储元数据。让我们使用 Bitnami 的 etcd Helm [chart](https://github.com/bitnami/charts/tree/main/bitnami/etcd) 来安装一个 etcd 集群。

```bash
helm install etcd \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version VAR::etcdChartVersion \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  --set global.security.allowInsecureImages=true \
  --set image.registry=docker.io \
  --set image.repository=greptime/etcd \
  --set image.tag=VAR::etcdImageVersion \
  -n etcd-cluster
```

<details>
  <summary>预期输出</summary>
```bash
NAME: etcd
LAST DEPLOYED: Sun Apr 26 20:49:03 2026
NAMESPACE: etcd-cluster
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: etcd
CHART VERSION: 12.0.8
APP VERSION: 3.6.1

** Please be patient while the chart is being deployed **

etcd can be accessed via port 2379 on the following DNS name from within your cluster:

    etcd.etcd-cluster.svc.cluster.local

To create a pod that you can use as a etcd client run the following command:

    kubectl run etcd-client --restart='Never' --image docker.io/greptime/etcd:VAR::etcdImageVersion --env ETCDCTL_ENDPOINTS="etcd.etcd-cluster.svc.cluster.local:2379" --namespace etcd-cluster --command -- sleep infinity

Then, you can set/get a key using the commands below:

    kubectl exec --namespace etcd-cluster -it etcd-client -- bash
    etcdctl  put /message Hello
    etcdctl  get /message

To connect to your etcd server from outside the cluster execute the following commands:

    kubectl port-forward --namespace etcd-cluster svc/etcd 2379:2379 &
    echo "etcd URL: http://127.0.0.1:2379"

WARNING: There are "resources" sections in the chart not set. Using "resourcesPreset" is not recommended for production. For production installations, please set the following values according to your workload needs:
- resources
- preUpgradeJob.resources
- disasterRecovery.cronjob.resources
  +info https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

Substituted images detected:
- docker.io/greptime/etcd:3.6.1-debian-12-r3

```
</details>

当 etcd 集群准备好后，你可以使用以下命令检查 Pod 的状态：

```bash
kubectl get pods -n etcd-cluster -l app.kubernetes.io/instance=etcd
```

<details>
  <summary>预期输出</summary>
```bash
NAME     READY   STATUS    RESTARTS   AGE
etcd-0   1/1     Running   0          2m8s
etcd-1   1/1     Running   0          2m8s
etcd-2   1/1     Running   0          2m8s
```
</details>

:::note
中国大陆用户如有网络访问问题，可直接使用阿里云 OCI 镜像仓库的方式安装 etcd 集群：

```bash
helm install etcd \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/etcd \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set global.security.allowInsecureImages=true \
  --set image.repository=bitnami/etcd \
  --set image.tag=VAR::etcdImageVersion \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```
:::

你可以通过运行以下命令来测试 etcd 集群：

```bash
kubectl -n etcd-cluster \
  exec etcd-0 -- etcdctl endpoint health \
  --endpoints=http://etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379,http://etcd-1.etcd-headless.etcd-cluster.svc.cluster.local:2379,http://etcd-2.etcd-headless.etcd-cluster.svc.cluster.local:2379
```

<details>
  <summary>预期输出</summary>
```bash
http://etcd-1.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 3.008575ms
http://etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 3.136576ms
http://etcd-2.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 3.147702ms
```
</details>

## 配置 `values.yaml`

`values.yaml` 文件设置了 GreptimeDB 的一些参数和配置，是定义 helm chart 的关键。
例如一个最小规模 GreptimeDB 集群定义如下：

```yaml
image:
  # 镜像仓库地址:
  # OSS GreptimeDB 使用 `greptime-registry.cn-hangzhou.cr.aliyuncs.com`,
  # Enterprise GreptimeDB 请咨询工作人员
  registry: <registry>
  # 镜像仓库：
  # OSS GreptimeDB 使用 `greptime/greptimedb`，
  # Enterprise GreptimeDB 请咨询工作人员
  repository: <repository>
  # 镜像标签：
  # OSS GreptimeDB 使用数据库版本，例如 `VAR::greptimedbVersion`
  # Enterprise GreptimeDB 请咨询工作人员
  tag: <tag>
  pullSecrets: []

initializer:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  repository: greptime/greptimedb-initializer
  tag: "VAR::greptimedbOperatorVersion"

frontend:
  replicas: 1

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints: ["etcd.etcd-cluster.svc.cluster.local:2379"]

datanode:
  replicas: 1

flownode:
  replicas: 1
```

上述配置不适用于严肃的生产环境，请根据自己的需求调整配置。
可参考[配置文档](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)获取完整的 `values.yaml` 的配置项。


## 安装 GreptimeDB 集群

在上述步骤中我们已经准备好了 GreptimeDB Operator，etcd 集群以及 GreptimeDB 集群相应的配置，
现在部署一个最小 GreptimeDB 集群：

```bash
helm upgrade --install mycluster \
  greptime/greptimedb-cluster \
  --values /path/to/values.yaml \
  -n default
```

如果你使用了不同的集群名称和命名空间，请将 `mycluster` 和 `default` 替换为你的配置。

<details>
  <summary>预期输出</summary>
```bash
Release "mycluster" does not exist. Installing it now.
NAME: mycluster
LAST DEPLOYED: Sun Apr 26 21:00:40 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-cluster
 Chart version: 0.8.3
 GreptimeDB Cluster version: 1.0.1
***********************************************************************

Installed components:
* greptimedb-meta
* greptimedb-datanode
* greptimedb-frontend
* greptimedb-flownode

The greptimedb-cluster is starting, use `kubectl get pods -n default` to check its status.
```
</details>

当启动集群安装之后，我们可以用如下命令检查 GreptimeDB 集群的状态。若你使用了不同的集群名和命名空间，可将 `default` 和 `mycluster` 替换为你的配置：

```bash
kubectl -n default get greptimedbclusters.greptime.io mycluster
```

<details>
  <summary>预期输出</summary>
```bash
NAME        FRONTEND   DATANODE   META   FLOWNODE   PHASE     VERSION   AGE
mycluster   1          1          1      1          Running   v1.0.1    111s
```
</details>

上面的命令将会显示 GreptimeDB 集群的状态。当 `PHASE` 为 `Running` 时，表示 GreptimeDB 集群已经成功启动。

你还可以检查 GreptimeDB 集群的 Pod 状态：

```bash
kubectl -n default get pods
```

<details>
  <summary>预期输出</summary>
```bash
NAME                                  READY   STATUS    RESTARTS   AGE
mycluster-datanode-0                  1/1     Running   0          2m51s
mycluster-flownode-0                  1/1     Running   0          2m26s
mycluster-frontend-5894994974-w2cls   1/1     Running   0          2m32s
mycluster-meta-58cd4cff6c-ddbxq       1/1     Running   0          2m58s
```
</details>

正如你所看到的，我们默认创建了一个最小的 GreptimeDB 集群，包括 1 个 frontend、1 个 datanode、1 个 flownode 和 1 个 metasrv。关于一个完整的 GreptimeDB 集群的组成，你可以参考 [architecture](/user-guide/concepts/architecture.md)。

## 探索 GreptimeDB 集群

### 访问 GreptimeDB 集群

你可以通过使用 `kubectl port-forward` 命令转发 frontend 服务来访问 GreptimeDB 集群：

```bash
kubectl -n default port-forward svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003 
```

<details>
  <summary>预期输出</summary>
```bash
Forwarding from 127.0.0.1:4000 -> 4000
Forwarding from [::1]:4000 -> 4000
Forwarding from 127.0.0.1:4001 -> 4001
Forwarding from [::1]:4001 -> 4001
Forwarding from 127.0.0.1:4002 -> 4002
Forwarding from [::1]:4002 -> 4002
Forwarding from 127.0.0.1:4003 -> 4003
Forwarding from [::1]:4003 -> 4003
```
</details>

请注意，当你使用了其他集群名和命名空间时，你可以使用如下命令，并将 `${cluster}` 和 `${namespace}` 替换为你的配置：

```bash
kubectl -n ${namespace} port-forward svc/${cluster}-frontend 4000:4000 4001:4001 4002:4002 4003:4003 
```

:::warning
如果你想将服务暴露给公网访问，可以使用带有 `--address` 选项的 `kubectl port-forward` 命令：

```bash
kubectl -n default port-forward --address 0.0.0.0 svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003
```

在将服务暴露给公网访问之前，请确保你已经配置了适当的安全设置。
:::

打开浏览器并访问 `http://localhost:4000/dashboard` 来访问 [GreptimeDB Dashboard](https://github.com/GrepTimeTeam/dashboard)。

如果你想使用其他工具如 `mysql` 或 `psql` 来连接 GreptimeDB 集群，你可以参考 [快速入门](/getting-started/quick-start.md)。

## 删除集群

:::danger
清理操作将会删除 GreptimeDB 集群的元数据和数据。请确保在继续操作之前已经备份了数据。
:::

### 停止端口转发

可以使用以下命令停止 GreptimeDB 集群的端口转发：

```bash
pkill -f kubectl port-forward
```

### 卸载 GreptimeDB 集群

可以使用以下命令卸载 GreptimeDB 集群：

```bash
helm -n default uninstall mycluster
```

### 删除 PVCs

为了安全起见，PVCs 默认不会被删除。如果你想删除 PV 数据，你可以使用以下命令：

```bash
kubectl -n default delete pvc -l app.greptime.io/component=mycluster-datanode
```

### 清理 etcd 数据

你可以使用以下命令清理 etcd 集群：

```bash
kubectl -n etcd-cluster exec etcd-0 -- etcdctl del "" --from-key=true
```

### 删除 Kubernetes 集群

如果你使用 `kind` 创建 Kubernetes 集群，你可以使用以下命令销毁集群：

```bash
kind delete cluster
```
