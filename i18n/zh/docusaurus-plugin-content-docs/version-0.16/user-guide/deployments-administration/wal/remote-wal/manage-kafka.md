---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, 安装, 配置, 管理]
description: 本指南介绍如何安装和管理 Kafka 集群。
---

# 管理 Kafka

GreptimeDB 集群在启用 [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) 时，会使用 Kafka 作为 WAL 存储。本文介绍如何部署和管理 Kafka 集群，使用的是 Bitnami 提供的 Kafka Helm [chart](https://github.com/bitnami/charts/tree/main/bitnami/kafka)。

## 先决条件

- [Kubernetes](https://kubernetes.io/docs/setup/) >= v1.23
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## 安装

将以下内容保存为配置文件 `kafka.yaml`：

```yaml
controller:
  replicaCount: 1
  persistence:
    enabled: true
    size: 200Gi 
  resources:
    limits:
      cpu: 2
      memory: 2G

broker:
  replicaCount: 3 # 设置为你希望部署的 broker 数量
  persistence:
    enabled: true
    size: 200Gi 
  resources:
    limits:
      cpu: 2
      memory: 2G
```

安装 Kafka 集群：

```bash
helm upgrade --install kafka \
    oci://registry-1.docker.io/bitnamicharts/kafka \
    --values kafka.yaml \
    --version 31.5.0 \
    --create-namespace \
    -n kafka-cluster
```

等待 Kafka 集群启动完成：

```bash
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/instance=kafka \
    -n kafka-cluster
```


```bash
kubectl get pods -n kafka-cluster
```

检查 Kafka 集群状态：

```bash
kubectl get pods -n kafka-cluster
```


<details>
  <summary>Expected Output</summary>
```bash
NAME                 READY   STATUS    RESTARTS   AGE
kafka-controller-0   1/1     Running   0          64s
kafka-broker-0       1/1     Running   0          63s
kafka-broker-1       1/1     Running   0          62s
kafka-broker-2       1/1     Running   0          61s
```
</details>
