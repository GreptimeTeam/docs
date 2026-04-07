---
keywords: [Kubernetes, deployment, GreptimeDB, Remote WAL, Kafka, configuration]
description: Step-by-step guide to deploying GreptimeDB with Remote WAL on Kubernetes, including prerequisites, configuration, installation, and verification.
---

# Deploying GreptimeDB Cluster with Remote WAL 

In this guide, you will learn how to deploy GreptimeDB with Remote WAL on Kubernetes. Before you start, it's recommended to read the [Deploy GreptimeDB Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) guide first.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## Dependencies

Before deploying a GreptimeDB cluster with Remote WAL, ensure that the metadata storage and Kafka cluster are properly set up or that existing instances are available.

- Metadata storage: you can refer to [Manage Metadata Overview](/user-guide/deployments-administration/manage-metadata/overview.md) for more details. In this example, we use etcd as the metadata storage.
- Kafka Cluster: you can refer to [Manage Kafka](/user-guide/deployments-administration/wal/remote-wal/manage-kafka.md) for more details.

## Remote WAL Configuration

:::tip NOTE
The configuration structure has changed between chart versions:

- In older version: `meta.etcdEndpoints`
- In newer version: `meta.backendStorage.etcd.endpoints`

Always refer to the latest [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) in the Helm chart repository for the most up-to-date configuration structure.
:::

This example assumes you have a Kafka cluster running in the `kafka-cluster` namespace, and an etcd cluster running in the `etcd-cluster` namespace. The `values.yaml` file is as follows:

```yaml
meta:
  backendStorage:
    etcd:
      endpoints: ["etcd.etcd-cluster.svc.cluster.local:2379"]
  configData: |
    [wal]
    provider = "kafka"
    replication_factor = 1
    topic_name_prefix = "gtp_greptimedb_wal_topic"
    auto_prune_interval = "30m"
datanode:
  configData: |
    [wal]
    provider = "kafka"
    overwrite_entry_start_id = true
remoteWal:
  enabled: true
  kafka:
    brokerEndpoints: ["kafka.kafka-cluster.svc.cluster.local:9092"]
```

## Deploy GreptimeDB Cluster

You can deploy the GreptimeDB cluster with the following command:

```bash
helm upgrade --install mycluster  \
    --values values.yaml \
    greptime/greptimedb-cluster \
    -n default
```

## Best Practices

- **Avoid switching WAL storage options in an existing cluster**. If you need to change the WAL storage backend (e.g., from local to remote), you must **tear down the entire cluster** and perform a clean redeployment. This includes deleting:
  - All PersistentVolumeClaims (PVCs) used by the GreptimeDB cluster.
  - The object storage directory used by the cluster.
  - The metadata storage associated with the cluster.
- Use a **minimal viable setup (MVP) to verify the cluster is functioning correctly**. This includes basic operations such as creating tables and inserting data to ensure the database works as expected.


## Next Steps

- Follow the [Deploy GreptimeDB Cluster](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-cluster.md) guide to access your GreptimeDB cluster.
- Follow the [Quick Start](/getting-started/quick-start.md) guide to create tables and insert data.
- For more information about Remote WAL configuration, see [Remote WAL Configuration](/user-guide/deployments-administration/wal/remote-wal/configuration.md).

