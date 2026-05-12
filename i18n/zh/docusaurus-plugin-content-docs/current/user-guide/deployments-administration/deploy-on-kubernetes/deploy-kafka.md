---
keywords: [Kubernetes 部署, Kafka, Helm Chart, 监控集成]
description: 在 Kubernetes 上使用 Helm Chart 部署 Kafka 集群的指南，包括安装、验证和监控集成步骤。
---

# 部署 Kafka 集群

在该指南中，你将学会如何使用 Helm Chart 在 Kubernetes 上部署 Kafka 集群。

## 前置依赖

- Kubernetes >= v1.18.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## 配置管理

在安装之前，你需要创建一个文件来配置 Kafka 集群。请根据你的 Kubernetes 环境调整，以下是 kafka-values.yaml 的参考配置：

```yaml
image:
  registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
  repository: greptime/kafka
  tag: 3.9.0-debian-12-r1

listeners:
  client:
    containerPort: 9092
    protocol: PLAINTEXT
    name: CLIENT
  controller:
    protocol: PLAINTEXT  

heapOpts: "-Xmx512m -Xms512m -XX:MetaspaceSize=96m -XX:+UseG1GC -XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:G1HeapRegionSize=16M -XX:MinMetaspaceFreeRatio=50 -XX:MaxMetaspaceFreeRatio=80 -XX:+ExplicitGCInvokesConcurrent"    
    
controller:
  replicaCount: 3
  resources:
    limits:
      cpu: '1'
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
  persistence:
    enabled: true
    storageClass: ""
    size: 50Gi

broker:
  replicaCount: 3
  resources:
    limits:
      cpu: '1'
      memory: 1Gi
    requests:
      cpu: 500m
      memory: 512Mi
  persistence:
    enabled: true
    storageClass: ""
    size: 50Gi    

extraConfig: |
  num.network.threads=3
  num.io.threads=8
  min.insync.replicas=1
  socket.send.buffer.bytes=102400
  socket.receive.buffer.bytes=102400
  socket.request.max.bytes=104857600
  num.recovery.threads.per.data.dir=1
  offsets.topic.replication.factor=1
  transaction.state.log.replication.factor=1
  transaction.state.log.min.isr=1
  allow.everyone.if.no.acl.found=true
  auto.create.topics.enable=true
  default.replication.factor=1
  max.partition.fetch.bytes=1048576
  max.request.size=1048576
  message.max.bytes=20000000
  log.dirs=/bitnami/kafka/data
  log.flush.interval.messages=10000
  log.flush.interval.ms=1000
  log.retention.hours=4
  log.roll.hours=3
  log.retention.bytes=250000000
  log.segment.bytes=1073741824
```

## 安装 Kafka 集群

在 kafka 命名空间中安装 Kafka 集群：

```bash
helm upgrade --install kafka \
  --create-namespace \
  oci://greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/kafka \
  --version 31.0.0 \
  -n kafka --values kafka-values.yaml
```

<details> 
  <summary>预期输出</summary>

```bash
Release "kafka" does not exist. Installing it now.
Pulled: greptime-registry.cn-hangzhou.cr.aliyuncs.com/charts/kafka:31.0.0
Digest: sha256:85b135981fd5d951ceef8b51cdcbc6917ebface50d0eb3367eb7ddc4a5db482b
NAME: kafka
LAST DEPLOYED: Tue May 12 00:57:32 2026
NAMESPACE: kafka
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
CHART NAME: kafka
CHART VERSION: 31.0.0
APP VERSION: 3.9.0

** Please be patient while the chart is being deployed **

Kafka can be accessed by consumers via port 9092 on the following DNS name from within your cluster:

    kafka.kafka.svc.cluster.local

Each Kafka broker can be accessed by producers via port 9092 on the following DNS name(s) from within your cluster:

    kafka-controller-0.kafka-controller-headless.kafka.svc.cluster.local:9092
    kafka-broker-0.kafka-broker-headless.kafka.svc.cluster.local:9092

To create a pod that you can use as a Kafka client run the following commands:

    kubectl run kafka-client --restart='Never' --image greptime-registry.cn-hangzhou.cr.aliyuncs.com/greptime/kafka:3.9.0-debian-12-r1 --namespace kafka --command -- sleep infinity
    kubectl exec --tty -i kafka-client --namespace kafka -- bash

    PRODUCER:
        kafka-console-producer.sh \
            --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
            --topic test

    CONSUMER:
        kafka-console-consumer.sh \
            --bootstrap-server kafka.kafka.svc.cluster.local:9092 \
            --topic test \
            --from-beginning

Substituted images detected:
- greptime-registry.cn-hangzhou.cr.aliyuncs.com/greptime/kafka:3.9.0-debian-12-r1
```
</details>

## 验证 Kafka 集群安装

检查 Kafka 组件（Broker 和 Controller）的状态：

```bash
kubectl get pod -n kafka
```

<details>
  <summary>预期输出</summary>
```bash
NAME                 READY   STATUS    RESTARTS   AGE
kafka-broker-0       1/1     Running   0          8m3s
kafka-broker-1       1/1     Running   0          8m2s
kafka-broker-2       1/1     Running   0          8m1s
kafka-controller-0   1/1     Running   0          8m3s
kafka-controller-1   1/1     Running   0          8m2s
kafka-controller-0   1/1     Running   0          8m1s
```
</details>

# 配置 Kafka 端点

在 Kafka 集群部署完成后，GreptimeDB 可以通过配置 Kafka 端点启用 Remote WAL（远程写前日志），更多参考[此篇文档](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md)。

```yaml
remoteWal:
  enabled: true
  kafka:
    brokerEndpoints: 
      - "kafka-broker-0.kafka-broker-headless.kafka.svc.cluster.local:9092"
      - "kafka-broker-1.kafka-broker-headless.kafka.svc.cluster.local:9092"
      - "kafka-broker-2.kafka-broker-headless.kafka.svc.cluster.local:9092"
```

# 监控

- 安装 Prometheus Operator (例如: [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack))。
- 安装 podmonitor CRD。

要监控 Kafka 集群，你需要提前部署好监控系统（如 Prometheus 和 Grafana）。然后在 `kafka-values.yaml` 中增加以下内容，并重新执行更新 Kafka 配置：

```yaml
metrics:
  jmx:
    enabled: true
    image:
      registry: greptime-registry.cn-hangzhou.cr.aliyuncs.com
      repository: greptime/jmx-exporter
      tag: 1.0.1-debian-12-r9
  serviceMonitor:
    enabled: true
    namespace: "kafka"
    interval: "10s"
    labels:
      release: kube-prometheus-stack
```

## Grafana dashboard

使用 [Kubernetes Kafka](https://grafana.com/grafana/dashboards/12483-kubernetes-kafka/) (ID: 12438) 来监控 kafka 的指标。

1. 登录你的 Grafana。
2. 导航至 Dashboards -> New -> Import。
3. 输入 Dashboard ID: 12438, 选择数据源并加载图表。

![Kubernetes Kafka](/kubernetes-kafka-monitoring-dashboard.png)


# 卸载 Kafka 集群

可以使用以下命令卸载 Kafka 集群：

```bash
helm -n kafka uninstall kafka
```

## 删除 PVCs

删除 PVCs 操作将会删除 Kafka 集群的持久化数据。请确保在继续操作之前已经备份了数据。

```bash
kubectl -n kafka delete pvc -l app.kubernetes.io/instance=kafka
```
