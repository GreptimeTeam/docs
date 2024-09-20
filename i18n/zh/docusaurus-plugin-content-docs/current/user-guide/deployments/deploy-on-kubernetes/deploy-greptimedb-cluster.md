# 部署 GreptimeDB 集群

在部署之前，请确保你已经在 Kubernetes 集群上安装了 [GreptimeDB Operator](/user-guide/deployments/deploy-on-kubernetes/manage-greptimedb-operator/deploy-greptimedb-operator.md)。

## 使用 Helm 进行部署

### 创建 etcd 集群

首先，执行以下命令来建立一个 etcd 集群以支持 GreptimeDB：

```shell
helm upgrade \
  --install etcd oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/etcd \
  --set image.registry="greptime-registry.cn-hangzhou.cr.aliyuncs.com" \
  --set image.repository="bitnami/etcd" \
  --set image.tag="3.5.11" \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```


安装完成后，你可以从安装日志中获取 etcd 集群的 endpoint `etcd.etcd-cluster.svc.cluster.local:2379`。
该 endpoint 在后续步骤部署 GreptimeDB 集群时需要使用。

### 创建 GreptimeDB 集群

使用如下命令镜像部署：

```shell
helm upgrade \
  --install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --create-namespace \
  -n greptimedb-cluster
```

### 设置资源

GreptimeDB Helm charts 能够为部署中的每个组件指定资源请求和限制。
以下是如何配置这些设置的示例：

```shell
helm upgrade \ 
  --install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set meta.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set meta.podTemplate.main.resources.requests.memory=<mem-resource> \
  --set datanode.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set datanode.podTemplate.main.resources.requests.memory=<mem-resource> \
  --set frontend.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set frontend.podTemplate.main.resources.requests.memory=<mem-resource> \
  --create-namespace \
  -n greptimedb-cluster
```

有关通过 Helm 的可配置值的完整列表，请参考 [values](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/README.md#values).


## 使用 kubectl 进行部署

你还可以使用 `kubectl` 手动创建 GreptimeDB 集群。
创建一个名为 `greptimedb-cluster.yaml` 的配置文件，内容如下：

```yml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: greptimedb
  namespace: greptimedb-cluster
spec:
  base:
    main:
      image: greptime-registry.cn-hangzhou.cr.aliyuncs.com/greptime/greptimedb:latest
  frontend:
    replicas: 1
  meta:
    replicas: 1
    etcdEndpoints:
      - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 3
```

使用此配置创建 GreptimeDB 集群：

```shell
kubectl apply -f greptimedb-cluster.yaml
```

## 连接到集群

安装完成后，你可以使用 `kubectl port-forward` 转发 GreptimeDB 集群的服务端口：

```shell
# 你可以使用 MySQL 或者 PostgreSQL 客户端连接集群，例如：'mysql -h 127.0.0.1 -P 4002'。
# HTTP port: 4000
# gRPC port: 4001
# MySQL port: 4002
# PostgreSQL port: 4003
kubectl port-forward -n greptimedb-cluster svc/greptimedb-frontend 4001:4001 4002:4002 4003:4003 4000:4000 > connections.out &
```

然后就可以使用 MySQL 客户端来[连接到集群](/user-guide/protocols/mysql.md#连接到服务端)。
