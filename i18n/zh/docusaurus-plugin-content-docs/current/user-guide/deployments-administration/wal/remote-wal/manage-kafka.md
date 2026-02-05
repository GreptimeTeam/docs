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
global:
  security:
    allowInsecureImages: true

image:
  registry: docker.io
  repository: greptime/kafka
  tag: 3.9.0-debian-12-r12

controller:
  replicaCount: 3

  resources:
    requests:
      cpu: 2
      memory: 2Gi
    limits:
      cpu: 2
      memory: 2Gi

  persistence:
    enabled: true
    size: 200Gi

broker:
  replicaCount: 3

  resources:
    requests:
      cpu: 2
      memory: 2Gi
    limits:
      cpu: 2
      memory: 2Gi

  persistence:
    enabled: true
    size: 200Gi

listeners:
  client:
    # 部署到生产环境时，通常会使用一个更安全的协议，例如 SASL。
    # 请参考 chart 的文档获取配置方法：https://artifacthub.io/packages/helm/bitnami/kafka#enable-security-for-kafka
    # 此处为了例子的简单，我们使用 plaintext 协议（无权限验证）。
    protocol: plaintext
```

安装 Kafka 集群：

```bash
helm upgrade --install kafka \
    oci://registry-1.docker.io/soldevelo/kafka-chart \
    --values kafka.yaml \
    --version 32.4.4 \
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
kafka-controller-1   1/1     Running   0          64s
kafka-controller-2   1/1     Running   0          64s
kafka-broker-0       1/1     Running   0          63s
kafka-broker-1       1/1     Running   0          62s
kafka-broker-2       1/1     Running   0          61s
```
</details>
