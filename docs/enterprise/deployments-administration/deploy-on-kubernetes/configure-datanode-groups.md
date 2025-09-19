---
keywords: [Kubernetes, deployment, GreptimeDB, datanode groups, CRD, installation, verification]
description: Step-by-step guide to deploying a GreptimeDB cluster with datanode groups on Kubernetes, including prerequisites, configuration, installation, and verification.
---

# Deploy a GreptimeDB Cluster with Datanode Groups

In this guide, you will learn how to deploy a GreptimeDB cluster on Kubernetes with a datanode group consisting of multiple datanode instances.

## Prerequisites

- [Docker](https://docs.docker.com/get-started/get-docker/) >= v23.0.0
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0
- [GreptimeDB Operator](https://github.com/GrepTimeTeam/greptimedb-operator) >= v0.3.0

## Upgrade operator

Install the GreptimeDB Operator, setting the image version to be greater than or equal to `v0.3.0`.
For detailed instructions on upgrading the operator, please refer to the [GreptimeDB Operator Management](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management.md#upgrade) guide.

## Datanode Groups Configuration

In the enterprise edition, you can configure **datanode groups** to separate read and write workloads into different groups.
The datanode accepts a `workload_types` field to distinguish its workload type. Supported types are **`hybrid`**, **`query`**, and **`ingest`**:

* **`hybrid`** is the default and acts as a superset of `query` and `ingest`, allowing the datanode to handle both workloads.
* **`query`** is optimized for read workloads, datanode only handle read workload.
* **`ingest`** is optimized for write workloads, datanode only handle write workload.

While `hybrid` is convenient, running both reads and writes on the same datanode may cause them to interfere with each other, for example, a large query may occupy too many resources, thus affecting the online ingestion. For best performance, it is recommended to separate read and write workloads into different datanode groups.

When configuring datanode groups, ensure that each group includes a `name` field. The following `values.yaml` example demonstrates how to define separate datanode groups:

```yaml
danodata:
    enabled: false

datanodeGroups:
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

meta:
  replicas: 1
  backendStorage:
    etcd:
      endpoints:
        - "etcd.etcd-cluster.svc.cluster.local:2379"

frontend:
  replicas: 1
```

For guidance on configuring alternative metadata storage backends for Metasrv, refer to the [Metadata Storage Configuration](/user-guide/deployments-administration/manage-metadata/configuration.md) documentation.

You can use the following command to apply the configuration:
```
helm upgrade --install ${release-name} greptime/greptimedb-cluster --namespace ${namespace} -f values.yaml
```

## Verify the Installation

Check the status of the pods:

```bash
kubectl get pods -n default
NAME                                         READY   STATUS    RESTARTS   AGE
weny-cluster-datanode-read-0                 1/1     Running   0          30s
weny-cluster-datanode-write-0                1/1     Running   0          30s
weny-cluster-frontend-774c76cffc-znvrw       1/1     Running   0          30s
weny-cluster-meta-58977b7897-8k2sf           1/1     Running   0          90s
```

## Next steps

- For best performance, it is recommended to [Configure frontend groups](/user-guide/deployments-administration/deploy-on-kubernetes/configure-frontend-groups.md), which ensures complete separation of read and write traffic, achieving maximum isolation. 

- Add Read Replica for your table, please refer to [Read Replica](/enterprise/read-replica.md).