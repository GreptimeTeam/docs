---
keywords: [cluster, monitoring, Prometheus]
description: 本文介绍了如何在 Kubernetes 环境中使用现有的 Prometheus 实例监控 GreptimeDB 集群，包括配置 PodMonitor、启用指标收集和设置 Grafana 仪表板。
---

# 使用 Prometheus 监控 GreptimeDB Cluster

在阅读本文档之前，请确保你已经了解如何[在 Kubernetes 上部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)。

我们推荐使用[自监控方法](cluster-monitoring-deployment.md)来监控 GreptimeDB 集群，
这种模式配置简单且提供了开箱即用的 Grafana 仪表板。
但如果你已经在 Kubernetes 集群中部署了 Prometheus 实例，并希望写入
GreptimeDB 集群的监控指标，请按照本文档中的步骤操作。

## 检查 Prometheus 实例配置

请先确保你已经部署 Prometheus Operator 并创建了 Prometheus 实例。例如，你可以使用 [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack) 来部署 Prometheus 技术栈。请参考其[官方文档](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)了解更多详情。

在部署 Prometheus 实例时，确保你设置了用于抓取 GreptimeDB 集群指标的标签。
例如，你现有的 Prometheus 实例包含下面的配置：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PodMonitor
metadata:
  name: greptime-podmonitor
  namespace: default
spec:
  selector:
    matchLabels:
      release: prometheus
  # 其他配置...
```

当 `PodMonitor` 被部署后，
Prometheus Operator 会持续监视 `default` 命名空间中匹配 `spec.selector.matchLabels` 中定义的所有标签（在此示例中为 `release: prometheus`）的 Pod。

## 为 GreptimeDB 集群启用 `prometheusMonitor`

使用 Helm Chart 部署 GreptimeDB 集群时，
在你的 `values.yaml` 文件中启用 `prometheusMonitor` 字段。例如：

```yaml
prometheusMonitor:
  # 启用 Prometheus 监控 - 这将创建 PodMonitor 资源
  enabled: true
  # 配置抓取间隔
  interval: "30s"
  # 配置标签
  labels:
    release: prometheus
```

**重要：** `labels` 字段的值（`release: prometheus`）
必须与创建 Prometheus 实例时使用的 `matchLabels` 的值匹配，
否则指标收集将无法正常工作。

配置 `prometheusMonitor` 后，
GreptimeDB Operator 将自动创建 `PodMonitor` 资源并按指定的时间间隔 `interval` 将指标导入到 Prometheus。
你可以使用以下命令检查 `PodMonitor` 资源：

```
kubectl get podmonitors.monitoring.coreos.com -n ${namespace}
```

:::note
如果你没有使用 Helm Chart 部署 GreptimeDB 集群，
可以在 `GreptimeDBCluster` YAML 中手动配置 Prometheus 监控：

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

:::

## Grafana 仪表板

你需要自己部署 Grafana，
然后导入仪表板。

### 添加数据源

部署 Grafana 后，
参考 Grafana 的[数据源](https://grafana.com/docs/grafana/latest/datasources/)文档添加以下两种类型的数据源：

- **Prometheus**：将其命名为 `metrics`。此数据源连接到你的收集 GreptimeDB 集群监控指标的 Prometheus 实例，因此请使用你的 Prometheus 实例 URL 作为连接 URL。
- **MySQL**：将其命名为 `information-schema`。此数据源连接到你的 GreptimeDB 集群，通过 SQL 协议访问集群元数据。如果你已经按照[在 Kubernetes 上部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)指南部署了 GreptimeDB，服务器地址为 `${cluster-name}-frontend.${namespace}.svc.cluster.local:4002`，数据库为 `information_schema`。

### 导入仪表板

[GreptimeDB 集群指标仪表板](https://github.com/GreptimeTeam/greptimedb/tree/VAR::greptimedbVersion/grafana/dashboards/metrics/cluster)使用 `metrics` 和 `information-schema` 数据源来显示 GreptimeDB 集群指标。

请参考 Grafana 的[导入仪表板](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/import-dashboards/)文档了解如何导入仪表板。
