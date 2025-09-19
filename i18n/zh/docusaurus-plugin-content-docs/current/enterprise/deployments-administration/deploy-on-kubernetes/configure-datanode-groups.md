---
keywords: [Kubernetes, deployment, GreptimeDB, datanode groups, CRD, installation, verification]
description: 在 Kubernetes 上部署带有 datanode 组的 GreptimeDB 集群的分步指南，包括先决条件、配置、安装和验证。
---

# 部署具有 Datanode 组的 GreptimeDB 集群

在本指南中，你将学习如何在 Kubernetes 上部署具有 datanode 组的 GreptimeDB 集群，该组由多个 datanode 实例组成。

## 先决条件

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) >= v0.3.0

## 升级 operator

安装 GreptimeDB Operator，将镜像版本设置为大于或等于 `v0.3.0`。
有关升级 operator 的详细说明，请参阅 [GreptimeDB Operator 管理](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management.md#升级)指南。

## Datanode 组配置

在企业版中，你可以配置 **datanode 组**来将读写工作负载分离到不同的组中。
datanode 接受 `workload_types` 字段来区分其工作负载类型。支持的类型有 **`hybrid`**、**`query`** 和 **`ingest`**：

* **`hybrid`** 是默认值，作为 `query` 和 `ingest` 的超集，允许 datanode 处理两种工作负载。
* **`query`** 为读负载优化，datanode 只处理读负载。
* **`ingest`** 为写负载优化，datanode 只处理写负载。

虽然 `hybrid` 很方便，但在同一个 datanode 上同时运行读写操作可能会相互干扰。为了获得最佳性能，建议将读写工作负载分离到不同的 datanode 组中。

在配置 datanode 组时，确保每个组都包含 `name` 字段。以下 `values.yaml` 示例展示了如何定义单独的 datanode 组：

```yaml
danodata:
    enabled: false

datanodeGroups:
  - name: read
    replicas: 1
    config: |
      workload_types = ["query"]
    template:
      main:
        resources:
          limits:
            cpu: 8
            memory: 16Gi
    
  - name: write
    replicas: 1
    config: |
      workload_types = ["ingest"]
    template:
      main:
        resources:
          requests:
            cpu: 4
            memory: 8Gi
    storage:
      fs:
        storageClassName: ${storageClassName}
        storageSize: 100Gi

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints:
        - "etcd.etcd-cluster.svc.cluster.local:2379"

frontend:
  replicas: 1
```

有关为 Metasrv 配置替代元数据存储后端的指导，请参阅[元数据存储配置](/user-guide/deployments-administration/manage-metadata/configuration.md)文档。

你可以使用以下命令应用上述配置：
```
helm upgrade --install ${release-name} greptime/greptimedb-cluster --namespace ${namespace} -f values.yaml
```

## 校验安装

检查 Pod 的状态：

```bash
kubectl get pods -n default
NAME                                         READY   STATUS    RESTARTS   AGE
weny-cluster-datanode-read-0                 1/1     Running   0          30s
weny-cluster-datanode-write-0                1/1     Running   0          30s
weny-cluster-frontend-774c76cffc-znvrw       1/1     Running   0          30s
weny-cluster-meta-58977b7897-8k2sf           1/1     Running   0          90s
```

## 后续步骤

- 最佳实践：为了获得最佳性能，建议[配置 frontend 组](/user-guide/deployments-administration/deploy-on-kubernetes/configure-frontend-groups.md)，这确保读写流量的完全分离，实现最大隔离。

- 为你的表添加读副本，请参阅[读副本](/enterprise/read-replica.md)。
