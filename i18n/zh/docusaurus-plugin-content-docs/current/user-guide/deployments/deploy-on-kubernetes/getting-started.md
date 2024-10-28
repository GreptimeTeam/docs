# 立即开始

:::warning
这个指南仅用于演示目的。请勿在生产环境中使用此设置。
:::

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) >= v0.20.0

## 步骤 1：创建一个测试 Kubernetes 集群

目前有很多方法可以创建一个用于测试的 Kubernetes 集群。在本指南中，我们将使用 [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) 来创建一个本地 Kubernetes 集群。

这里是一个使用 `kind` v0.20.0 的示例：

```bash
kind create cluster
```

<details>
  <summary>预期输出</summary>
```bash
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

Thanks for using kind! 😊
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


## 步骤 2：安装 GreptimeDB Operator

目前我们准备使用 Helm 在 Kubernetes 集群上安装 GreptimeDB Operator。

### 添加 Greptime Helm 仓库

:::note
中国大陆的用户如有网络访问有问题，可跳过这一步骤，直接参考下一步中使用阿里云 OCI 镜像仓库的方式。
:::

```bash
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

你可以运行以下命令查看 Helm 仓库中的 GreptimeDB Operator 版本：

```bash
helm search repo greptime
```

:::note
以下输出可能会随着 Chart 版本的不同而有所不同。
:::

<details>
  <summary>预期输出</summary>
```bash
NAME                          	CHART VERSION	APP VERSION  	DESCRIPTION
greptime/greptimedb-cluster   	0.2.25       	0.9.5        	A Helm chart for deploying GreptimeDB cluster i...
greptime/greptimedb-operator  	0.2.9        	0.1.3-alpha.1	The greptimedb-operator Helm chart for Kubernetes.
greptime/greptimedb-standalone	0.1.27       	0.9.5        	A Helm chart for deploying standalone greptimedb
```
</details>

### 安装 GreptimeDB Operator

让我们在 `greptimedb-admin` 命名空间中安装最新版本的 GreptimeDB Operator：

```bash
helm install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin --create-namespace
```

:::note
以下输出可能会随着 Chart 版本的不同而有所不同。
:::

<details>
  <summary>预期输出</summary>
```bash
NAME: greptimedb-operator
LAST DEPLOYED: Mon Oct 28 16:46:27 2024
NAMESPACE: greptimedb-admin
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
 Welcome to use greptimedb-operator
 Chart version: 0.2.9
 GreptimeDB Operator version: 0.1.3-alpha.1
***********************************************************************

Installed components:
* greptimedb-operator

The greptimedb-operator is starting, use `kubectl get deployments greptimedb-operator -n greptimedb-admin` to check its status.NAME: greptimedb-operator
LAST DEPLOYED: Mon Oct 28 16:46:27 2024
NAMESPACE: greptimedb-admin
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
***********************************************************************
Welcome to use greptimedb-operator
Chart version: 0.2.9
GreptimeDB Operator version: 0.1.3-alpha.1
***********************************************************************

Installed components:
* greptimedb-operator

The greptimedb-operator is starting, use `kubectl get deployments greptimedb-operator -n greptimedb-admin` to check its status.
```
</details>

:::note
中国大陆的用户如有网络访问有问题，可直接使用阿里云 OCI 镜像仓库的方式安装 GreptimeDB Operator：

```bash
helm install greptimedb-operator \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-operator \
  -n greptimedb-admin --create-namespace
```

此时我们也将镜像仓库设置为 Greptime 官方的阿里云镜像仓库。
:::

### 验证 GreptimeDB Operator 安装

检查 GreptimeDB Operator 的状态：

```bash
kubectl get pods --namespace greptimedb-admin -l app.kubernetes.io/instance=greptimedb-operator
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
kubectl get crds | grep greptime
```

<details>
  <summary>预期输出</summary>
```bash
greptimedbclusters.greptime.io      2024-10-28T08:46:27Z
greptimedbstandalones.greptime.io   2024-10-28T08:46:27Z
```
</details>

GreptimeDB Operator 将会使用 `greptimedbclusters.greptime.io` and `greptimedbstandalones.greptime.io` 这两个 CRD 来管理 GreptimeDB 集群和单机实例。

## 步骤 3：安装 etcd 集群


GreptimeDB 集群需要一个 etcd 集群来存储元数据。让我们使用 Bitnami 的 etcd Helm chart 来安装一个 etcd 集群。

:::note
中国大陆的用户如有网络访问有问题，可直接使用阿里云 OCI 镜像仓库的方式安装 etcd 集群：

```bash
helm install \
  etcd oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/etcd \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set image.tag=3.5.12 \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```
:::

```bash
helm install \
  etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

<details>
  <summary>预期输出</summary>
```bash
NAME: etcd
LAST DEPLOYED: Mon Oct 28 17:01:38 2024
NAMESPACE: etcd-cluster
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: etcd
CHART VERSION: 10.2.12
APP VERSION: 3.5.15

** Please be patient while the chart is being deployed **

etcd can be accessed via port 2379 on the following DNS name from within your cluster:

    etcd.etcd-cluster.svc.cluster.local

To create a pod that you can use as a etcd client run the following command:

    kubectl run etcd-client --restart='Never' --image docker.io/bitnami/etcd:3.5.15-debian-12-r6 --env ETCDCTL_ENDPOINTS="etcd.etcd-cluster.svc.cluster.local:2379" --namespace etcd-cluster --command -- sleep infinity

Then, you can set/get a key using the commands below:

    kubectl exec --namespace etcd-cluster -it etcd-client -- bash
    etcdctl  put /message Hello
    etcdctl  get /message

To connect to your etcd server from outside the cluster execute the following commands:

    kubectl port-forward --namespace etcd-cluster svc/etcd 2379:2379 &
    echo "etcd URL: http://127.0.0.1:2379"

WARNING: There are "resources" sections in the chart not set. Using "resourcesPreset" is not recommended for production. For production installations, please set the following values according to your workload needs:
- disasterRecovery.cronjob.resources
- resources
  +info https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
```
</details>

当 etcd 集群准备好后，你可以使用以下命令检查 Pod 的状态：

```bash
kubectl get pods --namespace etcd-cluster -l app.kubernetes.io/instance=etcd
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

你可以通过运行以下命令来测试 etcd 集群：

```bash
kubectl --namespace etcd-cluster \
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

## 步骤 4：安装带监控集成的 GreptimeDB 集群

目前我们已经准备好了 GreptimeDB Operator 和 etcd 集群，现在我们可以部署一个带监控集成的最小 GreptimeDB 集群：

```bash
helm install mycluster \
  --set monitoring.enabled=true \
  --set grafana.enabled=true \
  greptime/greptimedb-cluster \
  -n default
```

:::note
中国大陆的用户如有网络访问有问题，可直接使用阿里云 OCI 镜像仓库的方式安装 GreptimeDB 集群：

```bash
helm install \
  greptimedb-cluster oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
    --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
    --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
    --set grafana.enabled=true \
    --set grafana.image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
    --set monitoring.enabled=true \
    --set monitoring.vector.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
    -n default
```
:::

:::note
以下输出可能会随着 Chart 版本的不同而有所不同。
:::

<details>
  <summary>预期输出</summary>
```bash
Release "mycluster" does not exist. Installing it now.
NAME: mycluster
LAST DEPLOYED: Mon Oct 28 17:19:47 2024
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
***********************************************************************
 Welcome to use greptimedb-cluster
 Chart version: 0.2.25
 GreptimeDB Cluster version: 0.9.5
***********************************************************************

Installed components:
* greptimedb-frontend
* greptimedb-datanode
* greptimedb-meta

The greptimedb-cluster is starting, use `kubectl get pods -n default` to check its status.
```
</details>

You can check the status of the GreptimeDB cluster:

```bash
kubectl --namespace default get greptimedbclusters.greptime.io mycluster
```

:::note
以下输出可能会随着 Chart 版本的不同而有所不同。
:::

<details>
  <summary>预期输出</summary>
```bash
NAME        FRONTEND   DATANODE   META   FLOWNODE   PHASE      VERSION   AGE
mycluster   1          1          1      0          Running    v0.9.5    5m12s
```
</details>

你可以检查 GreptimeDB 集群的 Pod 状态：

```bash
kubectl --namespace default get pods
```

<details>
  <summary>预期输出</summary>
```bash
NAME                                 READY   STATUS    RESTARTS   AGE
mycluster-datanode-0                 2/2     Running   0          77s
mycluster-frontend-6ffdd549b-9s7gx   2/2     Running   0          66s
mycluster-grafana-675b64786-ktqps    1/1     Running   0          6m35s
mycluster-meta-58bc88b597-ppzvj      2/2     Running   0          86s
mycluster-monitor-standalone-0       1/1     Running   0          6m35s
```
</details>

正如你所看到的，我们创建了一个最小的 GreptimeDB 集群，包括 1 个 frontend、1 个 datanode 和 1 个 metasrv。

集群的 metrics 和 logs 将会被 [vector](https://github.com/vectordotdev/vector) sidecar 收集，并发送到 standalone 实例(`mycluster-monitor-standalone-0`) 进行存储。

Grafana dashboard 也被部署用于可视化集群的监控。

## 步骤 5：探索 GreptimeDB 集群

### 访问 GreptimeDB 集群

你可以通过端口转发前端服务来访问 GreptimeDB 集群：

```bash
kubectl --namespace default port-forward svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003 
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

:::note

如果你想将服务暴露给公共网络，你可以使用 `kubectl port-forward` 命令并使用 `--address` 选项：

```bash
kubectl --namespace default port-forward --address 0.0.0.0 svc/mycluster-frontend 4000:4000 4001:4001 4002:4002 4003:4003
```
:::

打开浏览器并访问 `http://localhost:4000/dashboard` 来访问 [GreptimeDB Dashboard](https://github.com/GrepTimeTeam/dashboard)。


如果你想使用其他工具如 `mysql` 或 `psql` 来连接 GreptimeDB 集群，你可以参考 [快速入门](/getting-started/quick-start.md)。

### 访问 Grafana dashboard

你可以通过端口转发 Grafana 服务来访问 Grafana 服务：

```bash
kubectl --namespace default port-forward svc/mycluster-grafana 18080:80
```

然后，打开浏览器并访问 `http://localhost:18080` 来访问 Grafana dashboard。默认的用户名和密码是 `admin` 和 `gt-operator`：

![Grafana Dashboard](/kubernetes-cluster-grafana-dashboard.jpg)

There are three dashboards available:

目前有三个可用的 Dashboard：

- **GreptimeDB Cluster Metrics**: 用于显示 GreptimeDB 集群的 Metrics；
- **GreptimeDB Cluster Logs**: 用于显示 GreptimeDB 集群的日志；
- **GreptimeDB Cluster Slow Queries**: 用于显示 GreptimeDB 集群的慢查询；

## 步骤 6：清理

### 停止端口转发

可以使用以下命令停止 GreptimeDB 集群的端口转发：

```bash
pkill -f kubectl port-forward
```

### 卸载 GreptimeDB 集群

可以使用以下命令卸载 GreptimeDB 集群：

```bash
helm --namespace default uninstall mycluster
```

### 删除 PVCs

为了安全起见，PVCs 默认不会被删除。如果你想删除 PV 数据，你可以使用以下命令：

```bash
kubectl --namespace default delete pvc -l app.greptime.io/component=mycluster-datanode
kubectl --namespace default delete pvc -l app.greptime.io/component=mycluster-monitor-standalone
```

### 清理 etcd 数据

你可以使用以下命令清理 etcd 集群：

```bash
kubectl --namespace etcd-cluster exec etcd-0 -- etcdctl del "" --from-key=true
```

### 删除 Kubernetes 集群

如果你使用 `kind` 创建 Kubernetes 集群，你可以使用以下命令销毁集群：

```bash
kind delete cluster
```
