---
keywords: [Kubernetes, deployment, GreptimeDB, frontend groups, CRD, installation, verification]
description: 在 Kubernetes 上部署带有 frontend groups 的 GreptimeDB 集群的分步指南，包括先决条件、配置、安装和验证。
---

# 部署多个具有 frontend 组的 GreptimeDB 集群

在本指南中，你将学习如何在 Kubernetes 上部署具有多个 frontend 组的 GreptimeDB 集群。

## 先决条件

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) >= v0.3.0
- [ETCD](https://github.com/bitnami/charts/tree/main/bitnami/etcd)

## 升级 operator

安装 GreptimeDB Operator，将镜像版本设置为大于或等于 `v0.3.0`。
请参考 GreptimeDB Operator 文档查看[如何升级 Operator](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management/#升级)。

## Frontend 组配置

:::tip NOTE
chart 版本之间的配置结构已发生变化:

- 旧版本: `meta.etcdEndpoints`
- 新版本: `meta.backendStorage.etcd.endpoints`

请参考 chart 仓库中配置 [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) 以获取最新的结构。
:::

定义 frontend 组时，必须为每个 frontend 实例指定名称字段。以下是创建读写 frontend 实例的示例配置：

```yaml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: greptimedb
  namespace: default
spec:
  initializer:
    image: greptime/greptimedb-initializer:latest
  base:
    main:
      image: greptime/greptimedb:latest  
  frontendGroups:
  - name: read
    replicas: 2
    config: |
      default_timezone = "UTC"
      [http]
      timeout = "60s"
  - name: write
    replicas: 1
    config: |
      default_timezone = "UTC"
      [http]
      timeout = "60s"
  meta:
    replicas: 1
    backendStorage:
      etcd:
        endpoints:
          - "etcd.etcd-cluster.svc.cluster.local:2379"
  datanode:
    replicas: 1
```

## 合规配置

设置 frontend 组时，必须设置名称。

```yaml
# 非法配置 !!!
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: greptimedb
spec:
  frontendGroups: 
  #  - name: read #<=========The name must be set=============>
    - replicas: 1
```    

## 校验安装

检查 Pod 的状态：

```bash
kubectl get pods -n default
NAME                                        READY   STATUS    RESTARTS   AGE
greptimedb-datanode-0                       1/1     Running   0          27s
greptimedb-frontend-read-66bf68bd5c-8kg8g   1/1     Running   0          21s
greptimedb-frontend-read-66bf68bd5c-x752l   1/1     Running   0          21s
greptimedb-frontend-write-bdd944b97-pkf9d   1/1     Running   0          21s
greptimedb-meta-699f74cd9d-42w2c            1/1     Running   0          87s
```

检查 services 状态：

```bash
kubectl get service -n default
NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                               AGE
greptimedb-datanode         ClusterIP   None            <none>        4001/TCP,4000/TCP                     102s
greptimedb-frontend-read    ClusterIP   10.96.174.200   <none>        4001/TCP,4000/TCP,4002/TCP,4003/TCP   42s
greptimedb-frontend-write   ClusterIP   10.96.223.1     <none>        4001/TCP,4000/TCP,4002/TCP,4003/TCP   42s
greptimedb-meta             ClusterIP   10.96.195.163   <none>        3002/TCP,4000/TCP                     3m4s
```

## Conclusion

您已成功部署 GreptimeDB 集群，其 frontend 组由读写实例组成。您现在可以继续探索 GreptimeDB 集群的功能，或根据需要将其与其他工具集成。
