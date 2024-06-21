# 部署 GreptimeDB 集群

在部署之前，请确保你已经在 Kubernetes 集群上安装了 [GreptimeDB Operator](greptimedb-operator.md)。

## 使用 Helm 进行部署

### 创建 etcd 集群

首先，通过执行以下命令来建立一个支持 GreptimeDB 的 etcd 集群：

```shell
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n etcd
```

安装完成后，你可以从安装日志中获取 etcd 集群的 endpoint `etcd.etcd.svc.cluster.local:2379`。
该 endpoint 在后续步骤部署 GreptimeDB 集群时需要使用。

### 创建 GretpimeDB 集群

部署 GreptimeDB 集群，确保它连接到先前建立的 etcd 集群：

```shell
helm install greptimedb greptime/greptimedb-cluster \
  --set meta.etcdEndpoints=etcd.etcd.svc.cluster.local:2379 \
  -n greptimedb-cluster
```

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
      image: greptime/greptimedb
  frontend:
    replicas: 1
  meta:
    replicas: 1
    etcdEndpoints:
      - "etcd.etcd.svc.cluster.local:2379"
  datanode:
    replicas: 3
```

使用此配置创建 GreptimeDB 集群：

```shell
kubectl apply -f greptimedb-cluster.yaml
```

## 连接到集群

安装完成后，你可以使用 `kubectl port-forward` 转发 GreptimeDB 集群的 MySQL 协议端口：

```shell
# 你可以使用 MySQL 客户端连接集群，例如：'mysql -h 127.0.0.1 -P 4002'。
kubectl port-forward svc/greptimedb-frontend 4002:4002 -n greptimedb-cluster > connections.out &

# 你可以使用 PostgreSQL 客户端连接集群，例如：'psql -h 127.0.0.1 -p 4003 -d public'。
kubectl port-forward svc/greptimedb-frontend 4003:4003 -n greptimedb-cluster > connections.out &
```

然后就可以使用 MySQL 客户端来[连接到集群](/getting-started/quick-start/mysql.md#connect)。

<!--

TODO:
Capacity plan for each component: etcd, frontend, datanode, metasrv
The following command maybe used in the future documentation:

```shell
helm upgrade \
      --install etcd \
      --set replicaCount=3 \
      --set resources.requests.cpu=100m \
      --set auth.rbac.create=false \
      --set auth.rbac.token.enabled=false \
      oci://registry-1.docker.io/bitnamicharts/etcd \
      -n etcd
```

helm upgrade \
      --install greptimedb \
      --set meta.etcdEndpoints=etcd.etcd.svc.cluster.local:2379 \
      --set base.podTemplate.main.resources.requests.cpu=100m \
      --set base.podTemplate.main.resources.requests.memory=256Mi \
      --set datanode.podTemplate.main.resources.requests.cpu=100m \
      --set datanode.podTemplate.main.resources.requests.memory=256Mi \
      --set frontend.podTemplate.main.resources.requests.cpu=100m \
      --set frontend.podTemplate.main.resources.requests.memory=256Mi \
      greptime/greptimedb-cluster \
      -n greptimedb-cluster 
-->

