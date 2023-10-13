# Kubernetes

## GreptimeDB Operator

通过利用 [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/)，[GreptimeDB Operator](https://github.com/GreptimeTeam/greptimedb-operator) 可以有效管理 [Kubernetes](https://kubernetes.io/) 上的 GreptimeDB 集群。这个 operator 可以抽象出维护高可用 GreptimeDB 集群的模式。

### 1. 创建测试版 Kubernetes 集群

用户可以通过 [kind][4] 创建测试版 Kubernetes 集群：

```shell
kind create cluster
```

### 2. 通过 Helm 安装 GreptimeDB Operator

请先安装 [Helm][5]，然后通过下面的命令在默认命名空间安装 `greptimedb-operator`：

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
```

```shell
helm repo update
```

```shell
helm install gtcloud greptime/greptimedb-operator -n default --devel
```

维护的 Helm 图表在 [helm-charts][6] 中。

### 3. 创建用户自己的 GreptimeDB 集群

为 GreptimeDB 创建 etcd cluster 集群
```shell
helm install etcd greptime/greptimedb-etcd -n default --devel
```

创建 GreptimeDB 集群。该集群会使用上一步创建的 etcd 集群：

```shell
helm install mydb greptime/greptimedb -n default --devel
```

如果你拥有自己的 etcd 集群，可以通过设置 `etcdEndpoints` 来使用自定义的 etcd 集群：

```shell
helm install mycluster greptime/greptimedb --set etcdEndpoints=<your-etcd-cluster-endpoints> \
-n default --devel
```

安装之后，可以通过 `kubectl port-forward` 语句来转发 GreptimeDB 集群的 MySQL 协议端口：

```shell
kubectl port-forward svc/mydb-frontend 4002:4002 > connections.out &
```

然后可以通过 MySQL 客户端[访问集群](/getting-started/try-out-greptimedb.md#Connect)

### 4. 清除 GreptimeDB 集群

可以通过以下命令卸载 operator 和集群：

```shell
# Uninstall the cluster.
helm uninstall mydb
```

```shell
# Uninstall etcd.
helm uninstall etcd -n default
```

```shell
# Uninstall the operator.
helm uninstall gtcloud
```

```shell
# Delete crds.
kubectl delete crds greptimedbclusters.greptime.io
```

[1]: https://github.com/GreptimeTeam/greptimedb-operator
[4]: https://kind.sigs.k8s.io/docs/user/quick-start/
[5]: https://helm.sh/docs/intro/install/
[6]: https://github.com/GreptimeTeam/helm-charts

## gtctl

[gtctl][1]，g-t-control，是一个用于管理 GreptimeDB 集群的命令行工具。gtctl 是集成了 GreptimeDB 集群的多种操作的多合一 binary。

### 1. 创建测试版 Kubernetes 集群

通过 [kind][4] 来创建测试版 `Kubernetes` 集群：

```shell
kind create cluster
```

### 2. 安装 gtctl

目前，`gtctl` 支持 `x86_64` 和 `ARM64` 架构的 `Linux` 和 `Darwin` 系统。

```shell
curl -L https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

### 3. 创建用户自己的 GreptimeDB 集群

```shell
./gtctl cluster create mydb -n default
```

安装完成后，`gtctl` 会创建以下内容：

- `etcd` cluster
- `frontend` instances (default replicas is 1)
- `datanode` instances(default replicas is 3)
- `metasrv` service(default replicas is 1)

可以通过 `kubectl port-forward` 命令来转发前端请求：

```shell
kubectl port-forward svc/mydb-frontend 4002:4002 > connections.out &
```

### 4. 清除 GreptimeDB 集群

```shell
./gtctl cluster delete mydb --tear-down-etcd
```
