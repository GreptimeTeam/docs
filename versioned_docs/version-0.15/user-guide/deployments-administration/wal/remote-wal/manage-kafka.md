---
keywords: [Kafka, kubernetes, helm, GreptimeDB, remote WAL, installation, configuration, management]
description: This guide describes how to install and manage Kafka cluster.
---
# Manage Kafka

The GreptimeDB cluster uses Kafka as the [Remote WAL](/user-guide/deployments-administration/wal/remote-wal/configuration.md) storage. This guide describes how to manage Kafka cluster. This guide will use Bitnami's Kafka Helm [chart](https://github.com/bitnami/charts/tree/main/bitnami/kafka) as an example.

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
  registry: public.ecr.aws/i8k6a5e1
  repository: bitnami/kafka
  tag: 3.9.0-debian-12-r12
  
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
  replicaCount: 3 # Set to the number of brokers you want to deploy.
  persistence:
    enabled: true
    size: 200Gi 
  resources:
    limits:
      cpu: 2
      memory: 2G
```

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
kafka-broker-0       1/1     Running   0          63s
kafka-broker-1       1/1     Running   0          62s
kafka-broker-2       1/1     Running   0          61s
```
</details>
