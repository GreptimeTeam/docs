---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, installation, configuration, management]
description: Install and manage a Kafka cluster for GreptimeDB Remote WAL, including retention, monitoring, and cleanup.
---
# Manage Kafka

GreptimeDB can use Kafka as [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) storage. This guide uses version 31.5.0 of the Bitnami Kafka Helm [chart](https://artifacthub.io/packages/helm/bitnami/kafka/31.5.0), which packages Kafka 3.9.0 and matches the image below.

## Prerequisites

- [Kubernetes](https://kubernetes.io/docs/setup/) >= v1.23
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## Install

Save the following configuration as a file `kafka.yaml`:

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
    # This example uses plaintext for simplicity. Configure SASL or TLS for production.
    protocol: PLAINTEXT
```

:::warning Kafka retention for Remote WAL
GreptimeDB periodically prunes WAL records that are no longer needed by calling Kafka `DeleteRecords`. Do not configure size-based retention for Remote WAL topics. Kafka's default `retention.bytes=-1` leaves the size unlimited; retain that setting.

Kafka also applies time-based retention. Its default is seven days. If you override `retention.ms` or the broker-level `log.retention.*` settings, the retention period must exceed the longest expected flush, outage, and recovery window. Otherwise, Kafka can delete records that GreptimeDB still needs for replay. See [Remote WAL retention requirements](/user-guide/deployments-administration/wal/remote-wal/configuration.md#required-settings-and-limitations).
:::

Install Kafka cluster:

```bash
helm upgrade --install kafka \
    oci://registry-1.docker.io/bitnamicharts/kafka \
    --values kafka.yaml \
    --version 31.5.0 \
    --create-namespace \
    -n kafka-cluster
```

Wait for Kafka cluster to be ready:

```bash
kubectl wait --for=condition=ready pod \
    -l app.kubernetes.io/instance=kafka \
    -n kafka-cluster
```

Check the status of the Kafka cluster:

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

## Configure GreptimeDB

The chart exposes its client endpoint as `kafka.kafka-cluster.svc.cluster.local:9092`. Configure this endpoint in the GreptimeDB Helm values as described in [Configure Remote WAL](/user-guide/deployments-administration/deploy-on-kubernetes/configure-remote-wal.md).

## Monitor Kafka

The Bitnami chart can expose Kafka metrics through JMX Exporter. If you use Prometheus Operator, ensure that its `ServiceMonitor` CRD is installed, then add the following values to `kafka.yaml`:

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

Set `namespace` to the namespace where the `ServiceMonitor` should be created, and set `labels` to match the selectors used by your Prometheus installation. Apply the change with the same `helm upgrade --install` command used above.

For all available metrics settings, see the Bitnami chart's [Prometheus metrics documentation](https://github.com/bitnami/charts/tree/main/bitnami/kafka#prometheus-metrics).

## Uninstall

Uninstall the Helm release:

```bash
helm uninstall kafka -n kafka-cluster
```

The persistent volume claims remain after the release is removed. List the PVCs before deleting them:

```bash
kubectl get pvc -n kafka-cluster -l app.kubernetes.io/instance=kafka
```

:::danger
Deleting these PVCs permanently removes the Kafka data stored by this cluster. Verify the namespace and label selector, and make sure the WAL is no longer required before proceeding.
:::

```bash
kubectl delete pvc -n kafka-cluster -l app.kubernetes.io/instance=kafka
```
