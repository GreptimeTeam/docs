---
keywords: [Kubernetes 部署, 集群, 监控]
description: 在 Kubernetes 上部署 GreptimeDB 集群的监控指南，包括自监控和 Prometheus 监控的详细步骤。
---

# 集群监控部署

当你使用 GreptimeDB Operator 部署 GreptimeDB 集群后，默认其对应组件（如 Metasrv / Datanode / Frontend）的 HTTP 端口（默认为 `4000`）将会暴露 `/metrics` 端点用于暴露 Prometheus 指标。

我们将提供两种方式来监控 GreptimeDB 集群：

1. **启用 GreptimeDB 自监控**：GreptimeDB Operator 将额外启动一个 GreptimeDB Standalone 实例和 Vector Sidecar 容器，分别用于收集和存储 GreptimeDB 集群的指标和日志数据；
2. **使用 Prometheus Operator 配置 Prometheus 指标监控**：用户需先部署 Prometheus Operator，并创建相应的 Prometheus 实例，然后通过 Prometheus Operator 的 `PodMonitor` 来将 GreptimeDB 集群的 Metrics 数据写入到相应的 Prometheus 中；

用户可根据自身需求选择合适的监控方式。

## 启用 GreptimeDB 自监控

自监控模式下 GreptimeDB Operator 将会额外启动一个 GreptimeDB Standalone 实例，用于收集 GreptimeDB 集群的指标和日志数据，其中日志数据将包括集群日志和慢查询日志。为了收集日志数据，GreptimeDB Operator 会在每一个 Pod 中启动一个 [Vector](https://vector.dev/) 的 Sidecar 容器，用于收集 Pod 的日志数据。启用该模式后，集群将自动开启 JSON 格式的日志输出。

如果你使用 Helm Chart 部署 GreptimeDB 集群（可参考[立即开始](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)），可对 Helm Chart 的 `values.yaml` 文件进行如下配置：

```yaml
monitoring:
  enabled: true
```

此时 Helm Chart 将会部署一个名为 `${cluster}-monitoring` 的 GreptimeDB Standalone 实例，用于收集 GreptimeDB 集群的指标和日志数据，你可以用如下命令进行查看：

```
kubectl get greptimedbstandalones.greptime.io ${cluster}-monitoring -n ${namespace}
```

默认该 GreptimeDB Standalone 实例会将监控数据使用 Kubernetes 当前默认的 StorageClass 将数据保存于本地存储，你可以根据实际情况进行调整。

GreptimeDB Standalone 实例的配置可以通过 Helm Chart 的 `values.yaml` 中的 `monitoring.standalone` 字段进行调整，如下例子所示：

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

GreptimeDB Standalone 实例将会使用 `${cluster}-monitoring-standalone` 作为 Kubernetes Service 的名称来暴露相应的服务，你可以使用如下地址来用于监控数据的读取：

- **Prometheus 协议的指标监控**：`http://${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus`。
- **SQL 协议的日志监控**：`${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4002`。默认集群日志会存储于 `public._gt_logs` 表。

GreptimeDB 自监控模式将使用 Vector Sidecar 来收集日志数据，你可以通过 `monitoring.vector` 字段来配置 Vector 的配置，如下所示：

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

:::tip NOTE
chart 版本之间的配置结构已发生变化:

- 旧版本: `meta.etcdEndpoints`
- 新版本: `meta.backendStorage.etcd.endpoints`

请参考 chart 仓库中配置 [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) 以获取最新的结构。
:::

:::note
如果你没有使用 Helm Chart 进行部署，你也可以通过如下 `GreptimeDBCluster` 的 YAML 来手动配置自监控模式，如下所示：

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: basic
spec:
  base:
    main:
      image: greptime/greptimedb:latest
  frontend:
    replicas: 1
  meta:
    replicas: 1
    backendStorage:
      etcd:
        endpoints:
          - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 1
  monitoring:
    enabled: true
```

其中 `monitoring` 字段用于配置自监控模式，具体可参考 [`GreptimeDBCluster` API 文档](https://github.com/GreptimeTeam/greptimedb-operator/blob/main/docs/api-references/docs.md#monitoringspec)。
:::

## 使用 Prometheus Operator 配置 Prometheus 指标监控

用户需先部署 Prometheus Operator 并创建相应的 Prometheus 实例，例如可以使用 [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) 来部署相应的 Prometheus 技术栈，具体过程可参考其对应的[官方文档](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)。

当部署完 Prometheus Operator 和 Prometheus 实例后，用户可通过 Helm Chart 的 `values.yaml` 的 `prometheusMonitor` 字段来配置 Prometheus 监控，如下所示：

```yaml
prometheusMonitor:
  # 用于配置是否启用 Prometheus 监控，此时 GreptimeDB Operator 将会自动创建 Prometheus Operator 的 `PodMonitor` 资源
  enabled: true
  # 用于配置 Prometheus 监控的抓取间隔
  interval: "30s"
  # 用于配置 Prometheus 监控的标签
  labels:
    release: prometheus
```

:::note
`labels` 字段需要与相应用于创建 Prometheus 实例的 `matchLabels` 字段保持一致，否则将无法正常抓取到 GreptimeDB 集群的 Metrics 数据。
:::

当我们配置完 `prometheusMonitor` 字段后，GreptimeDB Operator 将会自动创建 Prometheus Operator 的 `PodMonitor` 资源，并将 GreptimeDB 集群的 Metrics 数据导入到 Prometheus 中，比如我们可以用如下命令来查看创建的 `PodMonitor` 资源：

```
kubectl get podmonitors.monitoring.coreos.com -n ${namespace}
```

:::tip NOTE
chart 版本之间的配置结构已发生变化:

- 旧版本: `meta.etcdEndpoints`
- 新版本: `meta.backendStorage.etcd.endpoints`

请参考 chart 仓库中配置 [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) 以获取最新的结构。
:::

:::note
如果你没有使用 Helm Chart 进行部署，你也可以通过如下 `GreptimeDBCluster` 的 YAML 来手动配置 Prometheus 监控，如下所示：

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: basic
spec:
  base:
    main:
      image: greptime/greptimedb:latest
  frontend:
    replicas: 1
  meta:
    replicas: 1
    backendStorage:
      etcd:
        endpoints:
          - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 1
  prometheusMonitor:
    enabled: true
    interval: "30s"
    labels:
      release: prometheus
```

其中 `prometheusMonitor` 字段用于配置 Prometheus 监控。
:::

## 导入 Grafana Dashboard

目前 GreptimeDB 集群可使用如下 3 个 Grafana Dashboard 来配置监控面板：

- [集群指标 Dashboard](https://github.com/GreptimeTeam/greptimedb/blob/main/grafana/greptimedb-cluster.json)
- [集群日志 Dashboard](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/dashboards/greptimedb-cluster-logs.json)

:::note
其中 **集群日志 Dashboard** 仅适用于自监控模式，而 **集群指标 Dashboard** 则适用于自监控模式和 Prometheus 监控模式。
:::

如果你使用 Helm Chart 部署 GreptimeDB 集群，你可以通过启用 `grafana.enabled` 来一键部署 Grafana 实例，并导入相应的 Dashboard（可参考[立即开始](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)），如下所示：

```yaml
grafana:
  enabled: true
```

如果你是已经部署了 Grafana 实例，你可以参考如下步骤来导入相应的 Dashboard：

1. **添加相应的 Data Sources**

     你可以参考 Grafana 官方文档的 [datasources](https://grafana.com/docs/grafana/latest/datasources/) 来添加如下 3 个数据源：

   - **`metrics` 数据源**
     
     用于导入集群的 Prometheus 监控数据，适用于自监控模式和 Prometheus 监控模式。如上文所述，当使用自监控模式时，此时可使使用 `http://${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4000/v1/prometheus` 作为数据源的 URL。如果使用 Prometheus 监控模式，用户可根据具体 Prometheus 实例的 URL 来配置数据源。

   - **`information-schema` 数据源**
  
     这部分数据源用于使用 SQL 协议导入集群内部的元数据信息，适用于自监控模式和 Prometheus 监控模式。此时我们可以用 `${cluster}-frontend.${namespace}.svc.cluster.local:4002` 作为 SQL 协议的地址，并使用 `information_schema` 作为数据库名称进行连接。

   - **`logs` 数据源**
  
     这部分数据源用于使用 SQL 协议导入集群的日志，**仅适用于自监控模式**。此时我们可以用 `${cluster}-monitor-standalone.${namespace}.svc.cluster.local:4002` 作为 SQL 协议的地址，并使用 `public` 作为数据库名称进行连接。
 

2. **导入相应的 Dashboard**
   
   你可以参考 Grafana 官方文档的 [Import dashboards](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/) 来导入相应的 Dashboard。
