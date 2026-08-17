---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, 安装, 配置, 管理]
description: 安装和管理用于 GreptimeDB Remote WAL 的 Kafka 集群，包括数据保留、监控和清理。
---

# 管理 Kafka

GreptimeDB 可以使用 Kafka 作为 [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) 存储。本文使用 Bitnami Kafka Helm [chart 31.5.0](https://artifacthub.io/packages/helm/bitnami/kafka/31.5.0)，该版本包含 Kafka 3.9.0，与下方 image 版本一致。

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
    # 为简化示例，此处使用 plaintext。生产环境请配置 SASL 或 TLS。
    protocol: PLAINTEXT
```

:::warning Remote WAL 的 Kafka retention 配置
GreptimeDB 会定期调用 Kafka `DeleteRecords`，清理不再使用的 WAL 记录。不要为 Remote WAL topic 配置基于大小的 retention。Kafka 默认的 `retention.bytes=-1` 表示不限制大小，应保留该设置。

Kafka 还会应用基于时间的 retention，默认保留七天。如果修改 `retention.ms` 或 broker 级别的 `log.retention.*`，保留时间必须覆盖预期的最长 flush、故障和恢复窗口，否则 Kafka 可能删除 GreptimeDB replay 仍需要的记录。详情请参阅 [Remote WAL retention 要求](/user-guide/deployments-administration/wal/remote-wal/configuration.md#注意事项与限制)。
:::

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

## 配置 GreptimeDB

该 chart 通过 `kafka.kafka-cluster.svc.cluster.local:9092` 暴露 client endpoint。按照[配置 Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md)中的说明，在 GreptimeDB Helm values 中配置该 endpoint。

## 监控 Kafka

Bitnami chart 可以通过 JMX Exporter 暴露 Kafka 指标。如果使用 Prometheus Operator，请先确认已经安装 `ServiceMonitor` CRD，然后在 `kafka.yaml` 中增加以下配置：

```yaml
metrics:
  jmx:
    enabled: true
  serviceMonitor:
    enabled: true
    namespace: monitoring
    interval: 10s
    labels:
      release: kube-prometheus-stack
```

将 `namespace` 设置为创建 `ServiceMonitor` 的 namespace，并使 `labels` 与 Prometheus 使用的 selector 匹配。使用上文相同的 `helm upgrade --install` 命令应用配置。

所有 metrics 配置请参阅 Bitnami chart 的 [Prometheus metrics 文档](https://github.com/bitnami/charts/tree/main/bitnami/kafka#prometheus-metrics)。

## 卸载

卸载 Helm release：

```bash
helm uninstall kafka -n kafka-cluster
```

删除 release 后，PVC 仍会保留。删除前先列出目标 PVC：

```bash
kubectl get pvc -n kafka-cluster -l app.kubernetes.io/instance=kafka
```

:::danger
删除这些 PVC 会永久删除该 Kafka 集群存储的数据。执行前请核对 namespace 和 label selector，并确认不再需要其中的 WAL。
:::

```bash
kubectl delete pvc -n kafka-cluster -l app.kubernetes.io/instance=kafka
```
