---
keywords: [Kubernetes, Prometheus, 监控, 指标, 可观测性, GreptimeDB, Prometheus Operator, Grafana]
description: 使用 Prometheus 监控 Kubernetes 指标的指南，以 GreptimeDB 作为存储后端，包括架构概览、安装和使用 Grafana 进行可视化。
---

# 使用 Prometheus 和 GreptimeDB 监控 Kubernetes 指标

本指南演示如何建立一个完整的 Kubernetes 监控解决方案，
该方案使用 Prometheus 收集指标，
使用 GreptimeDB 作为长期存储后端。

## 什么是 Kubernetes 监控

Kubernetes 监控指的是从 Kubernetes 集群中收集、分析和处理指标和日志。
它是检查容器化应用程序和基础设施的健康状况、性能和资源利用率的关键。

Kubernetes 主要监控以下信息：

- **资源指标**：节点、Pod 和容器的 CPU、内存、磁盘和网络使用情况
- **集群健康**：集群组件如 kube-apiserver、etcd 和 controller-manager 的状态
- **应用程序指标**：在集群中运行的应用程序指标
- **事件和日志**：用于故障诊断的 Kubernetes 事件和容器日志

有效的监控可以帮助你：
- 在问题影响用户之前检测和诊断问题
- 优化资源利用率并降低成本
- 基于历史趋势进行容量规划
- 确保 SLA 合规性
- 排查性能瓶颈

## 架构概览

监控架构由以下组件组成：

![Kubernetes 监控架构](/k8s-metrics-monitor-architecture.drawio.svg)

**组件：**

- **kube-state-metrics**：导出关于 Kubernetes 对象（部署、Pod、服务等）的集群级指标
- **Node Exporter**：从每个 Kubernetes 节点导出硬件和操作系统级指标
- **Prometheus Operator**：使用 Kubernetes 自定义资源自动化 Prometheus 部署和配置
- **GreptimeDB**：Prometheus 指标的长期存储后端，具有高压缩率和查询性能
- **Grafana**：为存储在 GreptimeDB 中的指标提供仪表板和可视化

## 前提条件

在开始之前，确保你拥有：

- 一个运行中的 Kubernetes 集群（版本 >= 1.18）
- 已配置 `kubectl` 以访问你的集群
- 已安装 [Helm](https://helm.sh/docs/intro/install/) v3.0.0 或更高版本
- 足够的集群资源（至少 2 个 CPU 核心和 4GB 可用内存）

## 安装 GreptimeDB

GreptimeDB 被作为 Prometheus 指标的长期存储后端，
请参考[部署 GreptimeDB 集群](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md)文档了解如何部署。

### 验证 GreptimeDB 的部署

部署 GreptimeDB 后，验证集群是否正常运行中。
在本指南中，我们假设 GreptimeDB 集群部署在 `greptime-cluster` 命名空间，名称为 `greptimedb`。

```bash
kubectl -n greptime-cluster get greptimedbclusters.greptime.io greptimedb
```

```bash
NAME         FRONTEND   DATANODE   META   FLOWNODE   PHASE     VERSION   AGE
greptimedb   1          1          1      1          Running   v0.17.2   33s
```

检查 Pod：

```bash
kubectl get pods -n greptime-cluster
```

```bash
greptimedb-datanode-0                 1/1     Running   0          44s
greptimedb-flownode-0                 1/1     Running   0          28s
greptimedb-frontend-8bf9f558c-7wdmk   1/1     Running   0          34s
greptimedb-meta-fc4ddb78b-nv944       1/1     Running   0          50s
```

### GreptimeDB 的服务地址

需要使用 GreptimeDB 服务地址来配置 Prometheus Remote Write。
由于 GreptimeDB 在 Kubernetes 集群内运行，可以使用内部集群地址。

GreptimeDB 的 frontend 服务地址遵循以下模式：

```
<greptimedb-name>-frontend.<namespace>.svc.cluster.local:<port>
```

在本指南中：
- GreptimeDB 集群名称：`greptimedb`
- 命名空间：`greptime-cluster`
- 前端端口：`4000`

因此服务地址是：
```bash
greptimedb-frontend.greptime-cluster.svc.cluster.local:4000
```

Prometheus 的完整 [Remote Write URL](/user-guide/ingest-data/for-observability/prometheus.md#remote-write-configuration) 是：

```bash
http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/write?db=public
```

### 性能调优

为了在使用 GreptimeDB 作为 Prometheus 存储时获得最佳性能，
请参考[使用 metric engine 提高效率](/user-guide/ingest-data/for-observability/prometheus.md#通过使用-metric-engine-提高效率)指南，
该指南提供了提高写入吞吐量和查询效率的建议。

## 安装 Prometheus Operator

现在 GreptimeDB 正常运行中，
我们将安装 Prometheus 收集指标并将其发送到 GreptimeDB。

### 添加 Prometheus Community Helm 仓库

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### 安装 kube-prometheus-stack

[`kube-prometheus-stack`](https://github.com/prometheus-operator/kube-prometheus) 是一个综合的监控解决方案，包括
Prometheus、Grafana、kube-state-metrics 和 node-exporter 组件。
此 stack 自动发现和监控所有 Kubernetes 命名空间，
收集来自集群组件、节点和工作负载的指标。
在此部署中，我们将配置 Prometheus 使用 GreptimeDB 作为 Remote Write 目标：

```bash
helm install kube-prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set "prometheus.prometheusSpec.remoteWrite[0].url=http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/write?db=public" \
  --create-namespace
```

### 验证安装

检查所有 Prometheus 组件是否正在运行：

```bash
kubectl get pods -n monitoring
```

```bash
NAME                                                     READY   STATUS    RESTARTS   AGE
alertmanager-kube-prometheus-kube-prome-alertmanager-0   2/2     Running        0          60s
kube-prometheus-grafana-78ccf96696-sghx4                 3/3     Running        0          78s
kube-prometheus-kube-prome-operator-775fdbfd75-w88n7     1/1     Running        0          78s
kube-prometheus-kube-state-metrics-5bd5747f46-d2sxs      1/1     Running        0          78s
kube-prometheus-prometheus-node-exporter-ts9nn           1/1     Running        0          78s
prometheus-kube-prometheus-kube-prome-prometheus-0       1/2     Running        0          60s
```

## 配置 GreptimeDB 作为 Prometheus 存储

GreptimeDB 的 Remote Write URL 在 [Prometheus 的安装期间](#安装-prometheus-operator)已配置完成。

### 验证 Remote Write 配置

检查当前的 Prometheus 配置：

```bash
kubectl get prometheus kube-prometheus-kube-prome-prometheus -n monitoring -o yaml | grep -A 5 remoteWrite
```

```yaml
remoteWrite:
  - url: http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/write?db=public
  replicas: 1
  ... other configurations ...
```

### 配置 Remote Read

Remote Read 配置允许 Prometheus 从 GreptimeDB 读取数据。
向 Prometheus 自定义资源添加 Remote Read 配置：

```bash
kubectl patch prometheus kube-prometheus-kube-prome-prometheus -n monitoring --type merge -p '
spec:
  remoteRead:
  - url: http://greptimedb-frontend.greptime-cluster.svc.cluster.local:4000/v1/prometheus/read?db=public
'
```

### 验证配置

检查 Prometheus 是否成功将指标写入 GreptimeDB：

```bash
kubectl port-forward -n greptime-cluster svc/greptimedb-frontend 4000:4000
```

在另一个终端中，查询 GreptimeDB：

```bash
curl http://localhost:4000/v1/sql?sql=SHOW+TABLES
```

你应该能看到为各种 Prometheus 指标创建的表名。

## 使用 Grafana 进行可视化

Grafana 包含在 kube-prometheus-stack 中，
并预配置了 Prometheus 作为数据源的仪表盘。

要访问 Grafana：

1. **端口转发 Grafana 服务：**
  ```bash
  kubectl port-forward -n monitoring svc/kube-prometheus-grafana 3000:80
  ```

2. **在浏览器中打开 Grafana：**
  导航到 [http://localhost:3000](http://localhost:3000)

3. **使用默认凭据登录：**
  - **用户名：** `admin`
  - **密码：** 使用该命令找到自动生成的密码：
    ```bash
    kubectl get secret --namespace monitoring kube-prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
    ```

4. **探索仪表板：**
  导航到 `Dashboards` 查看预配置的 Kubernetes 监控仪表板，包括：
  - Kubernetes / Compute Resources / Cluster
  - Kubernetes / Compute Resources / Namespace (Pods)
  - Kubernetes / Compute Resources / Node (Pods)
  - Node Exporter / Nodes

## 总结

你现在部署了完整的 Kubernetes 监控解决方案，
使用 Prometheus 收集指标，使用 GreptimeDB 提供高效的长期存储。
该解决方案使你能够：

- 实时监控集群和应用程序健康状况
- 存储指标以进行历史分析和容量规划
- 使用 Grafana 创建丰富的可视化和仪表板
- 使用 PromQL 和 SQL 查询指标

有关 GreptimeDB 和 Prometheus 集成的更多信息，请参阅：

- [Prometheus 集成](/user-guide/ingest-data/for-observability/prometheus.md)
- [在 GreptimeDB 中查询数据](/user-guide/query-data/overview.md)
