---
keywords: [etcd, kubernetes, helm, backup, restore]
description: A comprehensive guide for managing an etcd cluster including installation, backup, and restoration processes using Kubernetes and Helm..
---

# Manage ETCD

The GreptimeDB cluster requires an etcd cluster for [metadata storage](https://docs.greptime.com/nightly/contributor-guide/metasrv/overview) by default. Let's install an etcd cluster using Bitnami's etcd Helm [chart](https://github.com/bitnami/charts/tree/main/bitnami/etcd).

## Prerequisites

- [Kubernetes](https://kubernetes.io/docs/setup/) >= v1.23
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) >= v1.18.0
- [Helm](https://helm.sh/docs/intro/install/) >= v3.0.0

## Install

```bash
helm upgrade --install etcd \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

Wait for etcd cluster to be running:

```bash
kubectl get po -n etcd-cluster
```

<details>
  <summary>Expected Output</summary>
```bash
NAME     READY   STATUS    RESTARTS   AGE
etcd-0   1/1     Running   0          64s
etcd-1   1/1     Running   0          65s
etcd-2   1/1     Running   0          72s
```
</details>

The etcd [initialClusterState](https://etcd.io/docs/v3.5/op-guide/configuration/) parameter specifies the initial state of the etcd cluster when starting etcd nodes. It is important for determining how the node will join the cluster. The parameter can take the following two values:

- **new**: This value indicates that the etcd cluster is new. All nodes will start as part of a new cluster, and any previous state will not be used.
- **existing**: This value indicates that the node will join an already existing etcd cluster. In this case, you must ensure that the initialCluster parameter is configured with the information of all nodes in the current cluster.

After the etcd cluster is running, we need to set the initialClusterState parameter to **existing**:

```bash
helm upgrade --install etcd \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --set initialClusterState="existing" \
  --set removeMemberOnContainerTermination=false \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

Wait for etcd cluster to be running, use the following command to check the health status of etcd cluster:

```bash
kubectl -n etcd-cluster \
  exec etcd-0 -- etcdctl \
  --endpoints etcd-0.etcd-headless.etcd-cluster:2379,etcd-1.etcd-headless.etcd-cluster:2379,etcd-2.etcd-headless.etcd-cluster:2379 \
  endpoint status -w table
```

<details>
  <summary>Expected Output</summary>
```bash
+----------------------------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
|                ENDPOINT                |        ID        | VERSION | DB SIZE | IS LEADER | IS LEARNER | RAFT TERM | RAFT INDEX | RAFT APPLIED INDEX | ERRORS |
+----------------------------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
| etcd-0.etcd-headless.etcd-cluster:2379 | 680910587385ae31 |  3.5.15 |   20 kB |     false |      false |         4 |      73991 |              73991 |        |
| etcd-1.etcd-headless.etcd-cluster:2379 | d6980d56f5e3d817 |  3.5.15 |   20 kB |     false |      false |         4 |      73991 |              73991 |        |
| etcd-2.etcd-headless.etcd-cluster:2379 | 12664fc67659db0a |  3.5.15 |   20 kB |      true |      false |         4 |      73991 |              73991 |        |
+----------------------------------------+------------------+---------+---------+-----------+------------+-----------+------------+--------------------+--------+
```
</details>

## Backup
In the bitnami etcd chart, a shared storage volume Network File System (NFS) is used to store etcd backup data. By using CronJob in Kubernetes to perform etcd snapshot backups and mount NFS PersistentVolumeClaim (PVC), snapshots can be transferred to NFS.

Add the following configuration and name it `etcd-backup.yaml` file, Note that you need to modify **existingClaim** to your NFS PVC name:

```yaml
replicaCount: 3

auth:
  rbac:
    create: false
  token:
    enabled: false

initialClusterState: "existing"
removeMemberOnContainerTermination: false

disasterRecovery:
  enabled: true
  cronjob:
    schedule: "*/30 * * * *"
    historyLimit: 2
    snapshotHistoryLimit: 2
  pvc:
    existingClaim: "${YOUR_NFS_PVC_NAME_HERE}"
```

Redeploy etcd cluster:

```bash
helm upgrade --install etcd \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --create-namespace \
  -n etcd-cluster --values etcd-backup.yaml
```

You can see the etcd backup scheduled task:

```bash
kubectl get cronjob -n etcd-cluster
```

<details>
  <summary>Expected Output</summary>
```bash
NAME               SCHEDULE      TIMEZONE   SUSPEND   ACTIVE   LAST SCHEDULE   AGE
etcd-snapshotter   */30 * * * *   <none>    False     0        <none>          36s
```
</details>

```bash
kubectl get pod -n etcd-cluster
```

<details>
  <summary>Expected Output</summary>
```bash
NAME                              READY   STATUS      RESTARTS   AGE
etcd-0                            1/1     Running     0          35m
etcd-1                            1/1     Running     0          36m
etcd-2                            0/1     Running     0          6m28s
etcd-snapshotter-28936038-tsck8   0/1     Completed   0          4m49s
```
</details>

```bash
kubectl logs etcd-snapshotter-28936038-tsck8 -n etcd-cluster
```

<details>
  <summary>Expected Output</summary>
```log
etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379 is healthy: successfully committed proposal: took = 2.698457ms
etcd 11:18:07.47 INFO  ==> Snapshotting the keyspace
{"level":"info","ts":"2025-01-06T11:18:07.579095Z","caller":"snapshot/v3_snapshot.go:65","msg":"created temporary db file","path":"/snapshots/db-2025-01-06_11-18.part"}
{"level":"info","ts":"2025-01-06T11:18:07.580335Z","logger":"client","caller":"v3@v3.5.15/maintenance.go:212","msg":"opened snapshot stream; downloading"}
{"level":"info","ts":"2025-01-06T11:18:07.580359Z","caller":"snapshot/v3_snapshot.go:73","msg":"fetching snapshot","endpoint":"etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379"}
{"level":"info","ts":"2025-01-06T11:18:07.582124Z","logger":"client","caller":"v3@v3.5.15/maintenance.go:220","msg":"completed snapshot read; closing"}
{"level":"info","ts":"2025-01-06T11:18:07.582688Z","caller":"snapshot/v3_snapshot.go:88","msg":"fetched snapshot","endpoint":"etcd-0.etcd-headless.etcd-cluster.svc.cluster.local:2379","size":"20 kB","took":"now"}
{"level":"info","ts":"2025-01-06T11:18:07.583008Z","caller":"snapshot/v3_snapshot.go:97","msg":"saved","path":"/snapshots/db-2025-01-06_11-18"}
Snapshot saved at /snapshots/db-2025-01-06_11-18
```
</details>

Next, you can see the etcd backup snapshot in the NFS server:

```bash
ls ${NFS_SERVER_DIRECTORY}
```

<details>
  <summary>Expected Output</summary>
```bash
db-2025-01-06_11-18  db-2025-01-06_11-20  db-2025-01-06_11-22
```
</details>

## Restore

When you encounter etcd data loss or corruption, such as critical information stored in etcd being accidentally deleted, or catastrophic cluster failure that prevents recovery, you need to perform an etcd restore. Additionally, restoring etcd can also be useful for development and testing purposes.

Before recovery, you need to stop writing data to the etcd cluster (stop GreptimeDB Metasrv writing) and create the latest snapshot file use for recovery.

Add the following configuration file and name it `etcd-restore.yaml`. Note that **existingClaim** is the name of your NFS PVC, and **snapshotFilename** is change to the etcd snapshot file name:

```yaml
replicaCount: 3

auth:
  rbac:
    create: false
  token:
    enabled: false

startFromSnapshot:
  enabled: true
  existingClaim: "${YOUR_NFS_PVC_NAME_HERE}"
  snapshotFilename: "${YOUR_ETCD_SNAPSHOT_FILE_NAME}"
```

Deploy etcd recover cluster:

```bash
helm upgrade --install etcd-recover \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --create-namespace \
  -n etcd-cluster --values etcd-restore.yaml
```

After waiting for the etcd recover cluster to be Running, redeploy the etcd recover cluster:

```bash
helm upgrade --install etcd-recover \
  oci://registry-1.docker.io/bitnamicharts/etcd \
  --version 10.2.12 \
  --set initialClusterState="existing" \
  --set removeMemberOnContainerTermination=false \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd-cluster
```

Next, change Metasrv [etcdEndpoints](https://github.com/GreptimeTeam/helm-charts/tree/main/charts/greptimedb-cluster) to the new etcd recover cluster, in this example is `"etcd-recover.etcd-cluster.svc.cluster.local:2379"`, to complete etcd restore.
