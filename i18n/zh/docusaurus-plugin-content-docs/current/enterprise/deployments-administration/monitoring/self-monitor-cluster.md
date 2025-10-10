---
keywords: [Kubernetes 部署, 企业集群, 监控]
description: 在 Kubernetes 上为 GreptimeDB 企业集群部署自监控的完整指南，包括 Grafana 仪表板设置和配置选项
---

# 自监控 GreptimeDB 集群

在阅读本文档之前，请确保你了解如何[在 Kubernetes 上部署 GreptimeDB 企业集群](/enterprise/deployments-administration/deploy-on-kubernetes/installation.md)。
本文将介绍在部署 GreptimeDB 集群时如何配置监控。

## 快速开始

你可以通过在使用 Helm Chart 部署 GreptimeDB 集群时向 `values.yaml` 文件添加配置来启用监控和 [GreptimeDB 控制台](/enterprise/console-ui.md)。
以下是部署带有监控和 GreptimeDB 控制台的最小 GreptimeDB 集群的完整 `values.yaml` 文件示例：

```yaml
image:
  registry: docker.io
  # 请咨询工作人员获取 GreptimeDB 企业版
  repository: <repository>
  # 请咨询工作人员获取 GreptimeDB 企业版
  tag: <tag>
  pullSecrets: [ regcred ]

initializer:
  registry: docker.io
  repository: greptime/greptimedb-initializer

monitoring:
  # 启用监控
  enabled: true

greptimedb-enterprise-dashboard:
  # 启用 greptimedb-enterprise-dashboard 部署。
  # 需要首先启用监控（monitoring.enabled: true）
  enabled: true
  image:
    # 请咨询工作人员获得 repository 和 tag
    repository: <repository>
    tag: <tag>

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

启用 `monitoring` 后，GreptimeDB Operator 会额外启动一个 GreptimeDB Standalone 实例来收集 GreptimeDB 集群的指标和日志。
为了收集日志数据，GreptimeDB Operator 会在每个 Pod 中启动一个 [Vector](https://vector.dev/) Sidecar 容器。

当启用 `greptimedb-enterprise-dashboard` 时，GreptimeDB Operator 会部署企业版控制台，它使用为集群监控配置的 GreptimeDB Standalone 实例作为数据源，并为 GreptimeDB 集群提供管理功能。

使用上述 `values.yaml` 文件安装 GreptimeDB 集群：

```bash
helm upgrade --install mycluster \
  greptime/greptimedb-cluster \
  --values /path/to/values.yaml \
  -n default
```

接下来参考下方的[访问 GreptimeDB 企业控制台](#访问-greptimedb-控制台)部分了解如何访问控制台。

## 监控配置

请参考开源 GreptimeDB 的[监控配置](/user-guide/deployments-administration/monitoring/cluster-monitoring-deployment.md#配置监控数据的收集)文档获取详细的监控配置说明。

## GreptimeDB 控制台配置

### 启用 GreptimeDB 控制台

请在 `values.yaml` 中添加以下配置启用 GreptimeDB 控制台。
注意该功能需要首先启用监控(`monitoring.enabled: true`)：

```yaml
monitoring:
  enabled: true

greptimedb-enterprise-dashboard:
  enabled: true
```

### 访问 GreptimeDB 控制台

你可以通过将服务端口转发到本地来访问 GreptimeDB 控制台：

```bash
kubectl -n ${namespace} port-forward svc/${cluster-name}-greptimedb-enterprise-console 18080:19095
```

然后打开 `http://localhost:18080` 访问 GreptimeDB 控制台。

有关控制台功能和界面的详细信息，请参考[控制台](/enterprise/console-ui.md)文档。

## 清理 PVC

请参考开源 GreptimeDB 文档的[清理 PVC](/user-guide/deployments-administration/monitoring/cluster-monitoring-deployment.md#清理-pvc)部分。


