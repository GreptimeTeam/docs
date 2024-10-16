# 部署 GreptimeDB 集群

本指南将引导您在 Kubernetes 环境中部署 GreptimeDB 集群。在继续之前，请确保您的集群已安装 [GreptimeDB Operator](./manage-greptimedb-operator/deploy-greptimedb-operator.md)。我们将涵盖从设置 etcd 集群（可选）到配置选项和连接数据库的所有步骤。

## 前提条件

- [Helm](https://helm.sh/docs/intro/install/)（使用与 Kubernetes API 版本匹配的版本）
- [GreptimeDB Operator](./manage-greptimedb-operator/deploy-greptimedb-operator.md)（假设本地主机已安装匹配版本的 GreptimeDB Operator）

## 创建 etcd 集群

要安装 etcd 集群，运行以下 `helm install` 命令。该命令还为安装创建了一个名为 `etcd-cluster` 的专用命名空间。

```bash
helm install etcd oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/etcd \
  --set image.registry="greptime-registry.cn-hangzhou.cr.aliyuncs.com" \
  --set image.repository="bitnami/etcd" \
  --set image.tag="3.5.11" \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

## 验证 etcd 集群的安装

安装完成后，通过列出 etcd-cluster 命名空间中的 Pod 来验证 etcd 集群的状态：

```bash
kubectl get pods -n etcd-cluster
```

您应该看到类似以下的输出：
```bash
NAME     READY   STATUS    RESTARTS     AGE
etcd-0   1/1     Running   0            80s
etcd-1   1/1     Running   0            80s
etcd-2   1/1     Running   0            80s
```

## 部署最小化的 GreptimeDB 集群

接下来，部署一个最小化的 GreptimeDB 集群。此部署将依赖 etcd 集群进行协调。如果您已有一个正在运行的 etcd 集群，可以使用其端点。如果您按照上面的步骤操作，则使用 `etcd.etcd-cluster.svc.cluster.local:2379` 作为 etcd 端点。

运行此命令安装 GreptimeDB 集群：
```bash
helm install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --create-namespace \
  -n greptimedb-cluster
```

### 验证 GreptimeDB 集群的安装
检查 `greptimedb-cluster` 命名空间中的所有 Pod 是否正常运行：

```bash
kubectl get pods -n greptimedb-cluster
```

您应该看到类似以下的输出：
```bash
NAME                                      READY   STATUS    RESTARTS   AGE
greptimedb-datanode-0                     1/1     Running   0          30s
greptimedb-datanode-2                     1/1     Running   0          30s
greptimedb-datanode-1                     1/1     Running   0          30s
greptimedb-frontend-7476dcf45f-tw7mx      1/1     Running   0          16s
greptimedb-meta-689cb867cd-cwsr5          1/1     Running   0          31s
```

## 高级配置选项
### 使用对象存储作为后端存储
要将数据存储在对象存储中（例如，存储到 Amazon S3），在 Helm 命令中添加以下配置：

```bash
helm install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set objectStorage.s3.bucket=<your-bucket> \
  --set objectStorage.s3.region=<region-of-bucket> \
  --set objectStorage.s3.root=<root-directory-of-data> \
  --set objectStorage.credentials.accessKeyId=<your-access-key-id> \
  --set objectStorage.credentials.secretAccessKey=<your-secret-access-key> \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster

```

### 使用 RemoteWAL 并启用 Region 故障切换
如果您希望启用 RemoteWAL 和 region 故障切换，请遵循以下配置。您需要一个正在运行的 Kafka 集群，并可以使用其端点，例如 `kafka.kafka-cluster.svc.cluster.local:9092`：

```bash
helm install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set meta.enableRegionFailover=true \
  --set objectStorage.s3.bucket=<your-bucket> \
  --set objectStorage.s3.region=<region-of-bucket> \
  --set objectStorage.s3.root=<root-directory-of-data> \
  --set objectStorage.credentials.accessKeyId=<your-access-key-id> \
  --set objectStorage.credentials.secretAccessKey=<your-secret-access-key> \
  --set remoteWal.enable=true \
  --set remoteWal.kafka.brokerEndpoints[0]=kafka.kafka-cluster.svc.cluster.local:9092 \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### 鉴权认证
要为 GreptimeDB 集群启用鉴权认证，您可以在安装期间通过 auth 设置配置用户凭据。以下是示例：

```bash
helm install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set auth.enabled=true \
  --set auth.users[0].username=admin \
  --set auth.users[0].password=admin \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### 资源用量与限制
要控制资源分配（CPU 和内存），请修改 Helm 安装命令，如下所示：

```bash
helm install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set meta.etcdEndpoints=etcd.etcd-cluster.svc.cluster.local:2379 \
  --set meta.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set meta.podTemplate.main.resources.requests.memory=<mem-resource> \
  --set datanode.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set datanode.podTemplate.main.resources.requests.memory=<mem-resource> \
  --set frontend.podTemplate.main.resources.requests.cpu=<cpu-resource> \
  --set frontend.podTemplate.main.resources.requests.memory=<mem-resource> \
  greptime/greptimedb-cluster \
  --create-namespace \
  -n greptimedb-cluster
```

### 使用 values.yaml 进行复杂配置
对于更复杂的配置，首先下载默认的 `values.yaml` 文件并在本地修改。

```bash
curl -sLo values.yaml https://raw.githubusercontent.com/GreptimeTeam/helm-charts/main/charts/greptimedb-cluster/values.yaml
```

您可以通过在 `configData` 字段中指定自定义设置来配置各个组件。更多详细信息，请参阅[配置](../configuration.md)文档。

以下是如何修改 `values.yaml` 文件设置的示例。此示例展示了如何配置 GreptimeDB 中的特定组件。它将 metasrv 的 selector 类型设置为 `round_robin`，通过将 datanode 的 Mito 引擎的 `global_write_buffer_size` 设置为 `4GB` 来调整配置，并将 frontend 的 meta 客户端 `ddl_timeout` 设置为 `60s`：

```yaml
meta:
  configData: |-
    selector = "round_robin"
datanode:
  configData: |-    
    [[region_engine]]
    [region_engine.mito]
    global_write_buffer_size = "4GB"
frontend:
  configData: |-
    [meta_client]
    ddl_timeout = "60s"
```

然后，使用修改后的 `values.yaml` 文件进行部署：

```bash
helm install greptimedb oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/greptimedb-cluster \
  --set image.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --set initializer.registry=greptime-registry.cn-hangzhou.cr.aliyuncs.com \
  --values values.yaml
```

有关通过 Helm 配置的详细值列表，请参阅[配置](../configuration.md)和[value](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/README.md#values)配置。

## 连接到集群
安装完成后，使用 `kubectl port-forward` 命令暴露服务端口，便可以本地连接到集群：


```shell
# 您可以使用 MySQL 或 PostgreSQL 客户端连接集群，例如： 'mysql -h 127.0.0.1 -P 4002'。
# HTTP 端口：4000
# gRPC 端口：4001
# MySQL 端口：4002
# PostgreSQL 端口：4003
kubectl port-forward -n greptimedb-cluster svc/greptimedb-frontend 4000:4000 4001:4001 4002:4002 4003:4003 > connections.out &
```

然后就可以使用 MySQL 客户端来[连接到集群](/user-guide/protocols/mysql.md#连接到服务端)。
