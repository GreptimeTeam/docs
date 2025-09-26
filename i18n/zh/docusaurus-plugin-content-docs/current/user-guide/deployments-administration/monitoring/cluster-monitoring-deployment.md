---
keywords: [Kubernetes 部署, 集群, 监控]
description: 在 Kubernetes 上部署 GreptimeDB 集群的自监控完整指南，包括 Grafana 仪表盘设置和配置项。
---

# 自监控 GreptimeDB 集群

在阅读本文档前，请确保你已经了解如何[在 Kubernetes 上部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)。
本文将介绍在部署 GreptimeDB 集群时如何配置监控。

## 快速开始

你可以在使用 Helm Chart 部署 GreptimeDB 集群时，通过对 `values.yaml` 文件进行配置来启用监控和 Grafana。下面是一个完整的 `values.yaml` 示例，用于部署一个最小化的带有监控和 Grafana 的 GreptimeDB 集群：

```yaml
image:
  registry: docker.io
  # 镜像仓库：
  # OSS GreptimeDB 使用 `greptime/greptimedb`，
  # Enterprise GreptimeDB 请咨询工作人员
  repository: <repository>
  # 镜像标签：
  # OSS GreptimeDB 使用数据库版本，例如 `v0.17.1`
  # Enterprise GreptimeDB 请咨询工作人员
  tag: <tag>
  pullSecrets: [ regcred ]

initializer:
  registry: docker.io
  repository: greptime/greptimedb-initializer

monitoring:
  # 启用监控
  enabled: true

grafana:
  # 用于监控面板
  # 需要先启用监控 `monitoring.enabled: true` 选项
  enabled: true

frontend:
  replicas: 1

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints: "etcd.etcd-cluster.svc.cluster.local:2379"

datanode:
  replicas: 1
```

:::note 备注
如果你在中国大陆遇到网络访问问题，可直接使用阿里云 OCI 镜像仓库：

```yaml
image:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  # 镜像仓库：
  # OSS GreptimeDB 使用 `greptime/greptimedb`，
  # Enterprise GreptimeDB 请咨询工作人员
  repository: <repository>
  # 镜像标签：
  # OSS GreptimeDB 使用数据库版本，例如 `v0.17.1`
  # Enterprise GreptimeDB 请咨询工作人员
  tag: <tag>
  pullSecrets: [ regcred ]

initializer:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  repository: greptime/greptimedb-initializer

monitoring:
  # 启用监控
  enabled: true
  vector:
    # 监控需要使用 Vector
    registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com

grafana:
  # 用于监控面板
  # 需要先启用监控 `monitoring.enabled: true` 选项
  enabled: true
  image:
    registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com

frontend:
  replicas: 1

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints: "etcd.etcd-cluster.svc.cluster.local:2379"

datanode:
  replicas: 1
```
:::

当启用监控后，GreptimeDB Operator 会额外启动一个 GreptimeDB Standalone 实例用于收集 GreptimeDB 集群的指标和日志数据。
为了收集日志数据，GreptimeDB Operator 会在每一个 Pod 中启动一个 [Vector](https://vector.dev/) 的 Sidecar 容器。

当启用 Grafana 后，会部署一个 Grafana 实例，并将用于集群监控的 GreptimeDB Standalone 实例作为其数据源。
这样就可以开箱即用地通过 Prometheus 和 MySQL 协议来可视化 GreptimeDB 集群的监控数据。

接下来使用上述配置的 `values.yaml` 文件来部署 GreptimeDB 集群：

```bash
helm upgrade --install mycluster \
  greptime/greptimedb-cluster \
  --values /path/to/values.yaml \
  -n default
```

部署完成后，你可以用如下命令来查看 GreptimeDB 集群的 Pod 状态：

```bash
kubectl -n default get pods
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                                 READY   STATUS    RESTARTS   AGE
mycluster-datanode-0                 2/2     Running   0          77s
mycluster-frontend-6ffdd549b-9s7gx   2/2     Running   0          66s
mycluster-grafana-675b64786-ktqps    1/1     Running   0          6m35s
mycluster-meta-58bc88b597-ppzvj      2/2     Running   0          86s
mycluster-monitor-standalone-0       1/1     Running   0          6m35s
```
</details>

你可以转发 Grafana 的端口到本地来访问 Grafana 仪表盘：

```bash
kubectl -n default port-forward svc/mycluster-grafana 18080:80
```

请参考[访问 Grafana 仪表盘](#访问-grafana仪表盘)章节来查看相应的数据面板。


## 配置监控数据的收集

本节将介绍监控配置的细节。

### 启用监控

在使用 Helm Chart 部署 GreptimeDB 集群时，在 [`values.yaml`](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md#setup-valuesyaml) 中添加以下配置来启用监控：

```yaml
monitoring:
  enabled: true
```

这将部署一个名为 `${cluster-name}-monitoring` 的 GreptimeDB Standalone 实例来收集指标和日志。你可以使用以下命令验证部署：

```bash
kubectl get greptimedbstandalones.greptime.io ${cluster-name}-monitoring -n ${namespace}
```

GreptimeDB Standalone 实例使用 `${cluster-name}-monitoring-standalone` 作为 Kubernetes Service 名称来暴露服务。你可以使用以下地址访问监控数据：

- **Prometheus 指标**：`http://${cluster-name}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus`
- **SQL 日志**：`${cluster-name}-monitor-standalone.${namespace}.svc.cluster.local:4002`。默认情况下，集群日志存储在 `public._gt_logs` 表中。

### 自定义监控数据存储

默认情况下，GreptimeDB Standalone 实例使用 Kubernetes 默认的 StorageClass 将监控数据存储在本地存储中。
你可以通过 `values.yaml` 中的 `monitoring.standalone` 字段来配置 GreptimeDB Standalone 实例。例如，以下配置使用 S3 对象存储来存储监控数据：

```yaml
monitoring:
  enabled: true
  standalone:
    base:
     main:
       # 用于配置 GreptimeDB Standalone 实例的镜像
       image: "greptime-registry.cn-hangzhou.cr.aliyuncs.com/greptime/greptimedb:latest"

       # 用于配置 GreptimeDB Standalone 实例的资源配置
       resources:
         requests:
           cpu: "2"
           memory: "4Gi"
         limits:
           cpu: "2"
           memory: "4Gi"
    
    # 用于配置 GreptimeDB Standalone 实例的对象存储
    objectStorage:
      s3:
        # 用于配置 GreptimeDB Standalone 实例的对象存储的 bucket
        bucket: "monitoring"
        # 用于配置 GreptimeDB Standalone 实例的对象存储的 region
        region: "ap-southeast-1"
        # 用于配置 GreptimeDB Standalone 实例的对象存储的 secretName
        secretName: "s3-credentials"
        # 用于配置 GreptimeDB Standalone 实例的对象存储的 root
        root: "standalone-with-s3-data"
```
### 自定义 Vector Sidecar

用于日志收集的 Vector Sidecar 配置可以通过 `monitoring.vector` 字段进行自定义。
例如，你可以按如下方式调整 Vector 的镜像和资源：

```yaml
monitoring:
  enabled: true
  vector:
    # 用于配置 Vector 的镜像仓库
    registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
    # 用于配置 Vector 的镜像仓库
    repository: timberio/vector
    # 用于配置 Vector 的镜像标签
    tag: nightly-alpine

    # 用于配置 Vector 的资源配置
    resources:
      requests:
        cpu: "50m"
        memory: "64Mi"
      limits:
        cpu: "50m"
        memory: "64Mi"
```

### 使用 `kubectl` 部署的 YAML 配置

如果你没有使用 Helm Chart 部署 GreptimeDB 集群，
可以在 `GreptimeDBCluster` 的 YAML 中使用 `monitoring` 字段来手动配置自监控模式：

```yaml
monitoring:
  enabled: true
```

详细的配置选项请参考 [`GreptimeDBCluster` API 文档](https://github.com/GreptimeTeam/greptimedb-operator/blob/main/docs/api-references/docs.md#monitoringspec)。


## Grafana 配置

### 启用 Grafana

在 `values.yaml` 中添加以下配置启用 Grafana 部署，
注意该功能必须先启用[监控（`monitoring.enabled: true`）配置](#启用监控)：

```yaml
grafana:
  enabled: true
```

### 自定义 Grafana 数据源

默认情况下，Grafana 使用 `mycluster` 和 `default` 作为集群名称和命名空间来创建数据源。
要监控其他名称或命名空间的集群，请根据实际的集群名称和命名空间自定义配置。
以下是 `values.yaml` 配置示例：

```yaml
monitoring:
  enabled: true

grafana:
  enabled: true
  datasources:
    datasources.yaml:
      datasources:
        - name: greptimedb-metrics
          type: prometheus
          url: http://${cluster-name}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus
          access: proxy
          isDefault: true

        - name: greptimedb-logs
          type: mysql
          url: ${cluster-name}-monitor-standalone.${namespace}.svc.cluster.local:4002
          access: proxy
          database: public
```

此配置会在 Grafana 中为 GreptimeDB 集群的监控创建以下数据源：

- **`greptimedb-metrics`**：用于存储监控数据的单机数据库中的集群指标，通过 Prometheus 协议提供服务（`type: prometheus`）
- **`greptimedb-logs`**：用于存储监控数据的单机数据库中的集群日志，通过 MySQL 协议提供服务（`type: mysql`），默认使用 `public` 数据库。

### 访问 Grafana 仪表盘

你可以通过将 Grafana 服务端口转发到本地来访问 Grafana 仪表盘：

```bash
kubectl -n ${namespace} port-forward svc/${cluster-name}-grafana 18080:80 
```

然后打开 `http://localhost:18080` 来访问 Grafana 仪表盘。
默认登录凭据为：

- **用户名**：`admin`
- **密码**：`gt-operator`

接着进入到 `Dashboards` 部分来查看用于监控 GreptimeDB 集群而预配置的仪表盘。

![Grafana Dashboard](/kubernetes-cluster-grafana-dashboard.jpg)


## 清理 PVC

:::danger
清理操作将移除 GreptimeDB 集群的元数据和数据，请确保在操作前已备份数据。
:::

请参考[清理 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md#cleanup)文档
查看如何卸载 GreptimeDB 集群，

要清理 GreptimeDB 用于监控的单机数据库的 PVC，请使用以下命令：

```bash
kubectl -n default delete pvc -l app.greptime.io/component=${cluster-name}-monitor-standalone
```
