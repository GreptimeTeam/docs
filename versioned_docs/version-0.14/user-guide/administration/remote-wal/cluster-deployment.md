---
keywords: [GreptimeDB cluster deployment, Kubernetes, remote WAL, Kafka setup, etcd cluster, Helm, kubectl]
description: Guide for deploying a GreptimeDB cluster with Remote WAL in Kubernetes. Includes steps for deploying the GreptimeDB operator, etcd cluster, Kafka cluster, and GreptimeDB cluster with remote WAL settings, as well as writing and querying data.
---

# Cluster Deployment

It's highly recommended to deploy the GreptimeDB cluster in Kubernetes. There are the following prerequires:

- Kubernetes(>=1.18)

  For testing purposes, you can use Kind or Minikube to create Kubernetes.

- Helm v3
- kubectl

## Step 1: Deploy the GreptimeDB Operator

Add the chart repository with the following commands:

```
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

Create the `greptimedb-admin` namespace and deploy the GreptimeDB operator in the namespace:

```
kubectl create ns greptimedb-admin
helm upgrade --install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin
```

## Step 2: Deploy the etcd Cluster

The GreptimeDB cluster needs the etcd cluster as the backend storage of the metasrv. We recommend using the Bitnami etcd [chart](https://github.com/bitnami/charts/blob/main/bitnami/etcd/README.md) to deploy the etcd cluster:

``` 
kubectl create ns metasrv-store
helm upgrade --install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n metasrv-store
```

When the etcd cluster is ready, you can use the following command to check the cluster health:

```
kubectl -n metasrv-store \
  exec etcd-0 -- etcdctl \
  --endpoints etcd-0.etcd-headless.metasrv-store:2379,etcd-1.etcd-headless.metasrv-store:2379,etcd-2.etcd-headless.metasrv-store:2379 \
  endpoint status
```

## Step 3: Deploy the Kafka Cluster

:::tip NOTE
If you already have a working Kafka endpoint available, you can skip Step 3 and proceed directly to Step 4, using your existing Kafka endpoint in the GreptimeDB cluster configuration.
:::

We recommend using [strimzi-kafka-operator](https://github.com/strimzi/strimzi-kafka-operator) to deploy the Kafka cluster in KRaft mode.

Create the `kafka` namespace and install the strimzi-kafka-operator:

```
kubectl create namespace kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
```

When the operator is ready, use the following spec to create the Kafka cluster:

```
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaNodePool
metadata:
  name: dual-role
  labels:
    strimzi.io/cluster: kafka-wal
spec:
  replicas: 3
  roles:
    - controller
    - broker
  storage:
    type: jbod
    volumes:
      - id: 0
        type: persistent-claim
        size: 20Gi
        deleteClaim: false
---

apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: kafka-wal
  annotations:
    strimzi.io/node-pools: enabled
    strimzi.io/kraft: enabled
spec:
  kafka:
    version: 3.9.0
    metadataVersion: "3.9"
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
  entityOperator:
    topicOperator: {}
    userOperator: {}
```

:::warning IMPORTANT: Kafka Retention Policy Configuration
Please configure Kafka retention policy very carefully to avoid data loss. GreptimeDB will automatically recycle unneeded WAL data, so in most cases you don't need to set the retention policy. However, if you do set it, please ensure the following:

- **Size-based retention**: Typically not needed, as the database manages its own data lifecycle
- **Time-based retention**: If you choose to set this, ensure it's **greater than the auto-flush-interval** to prevent premature data deletion

Improper retention settings can lead to data loss if WAL data is deleted before GreptimeDB has processed it.
:::

Save the spec as `kafka-wal.yaml` and apply in the Kubernetes:

```
kubectl apply -f kafka-wal.yaml -n kafka
```

After the Kafka cluster is ready, check the status:

```
kubectl get kafka -n kafka
```

The expected output will be:

```
NAME        DESIRED KAFKA REPLICAS   DESIRED ZK REPLICAS   READY   METADATA STATE   WARNINGS
kafka-wal                                                  True    KRaft
```

## Step 4: Deploy the GreptimeDB Cluster with Remote WAL Settings

:::tip NOTE
The configuration structure has changed between chart versions:

- In older version: `meta.etcdEndpoints`
- In newer version: `meta.backendStorage.etcd.endpoints`

Always refer to the latest [values.yaml](https://github.com/GreptimeTeam/helm-charts/blob/main/charts/greptimedb-cluster/values.yaml) in the Helm chart repository for the most up-to-date configuration structure.
:::

Create a GreptimeDB cluster with remote WAL settings:

```
cat <<EOF | kubectl apply -f -
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: my-cluster
  namespace: default
spec:
  base:
    main:
      image: greptime/greptimedb:latest
  frontend:
    replicas: 1
  meta:
    replicas: 1
    backendStorage:
      etcd:
        endpoints:
          - "etcd.metasrv-store:2379"
  datanode:
    replicas: 3
  wal:
    kafka:
      brokerEndpoints:
        - "kafka-wal-kafka-bootstrap.kafka:9092"
EOF
```

When the GreptimeDB cluster is ready, you can check the cluster status:

```
kubectl get gtc my-cluster -n default
```

The expected output will be:

```
NAME         FRONTEND   DATANODE   META   PHASE     VERSION   AGE
my-cluster   1          3          1      Running   latest    5m30s
```

##  Step 5: Write and Query Data

Let's choose to connect the cluster using the MySQL protocol. Use the kubectl to port forward `4002` traffic:

```
kubectl port-forward svc/my-cluster-frontend 4002:4002 -n default
```

Open another terminal and connect the cluster by `mysql`:

```
mysql -h 127.0.0.1 -P 4002
```

Create a distributed table:

```sql
CREATE TABLE dist_table(
    ts TIMESTAMP DEFAULT current_timestamp(),
    n INT,
    row_id INT,
    PRIMARY KEY(n),
    TIME INDEX (ts)
)
PARTITION ON COLUMNS (n) (
    n < 5,
    n >= 5 AND n < 9,
    n >= 9
);
```

Write the data:

```
INSERT INTO dist_table(n, row_id) VALUES (1, 1);
INSERT INTO dist_table(n, row_id) VALUES (2, 2);
INSERT INTO dist_table(n, row_id) VALUES (3, 3);
INSERT INTO dist_table(n, row_id) VALUES (4, 4);
INSERT INTO dist_table(n, row_id) VALUES (5, 5);
INSERT INTO dist_table(n, row_id) VALUES (6, 6);
INSERT INTO dist_table(n, row_id) VALUES (7, 7);
INSERT INTO dist_table(n, row_id) VALUES (8, 8);
INSERT INTO dist_table(n, row_id) VALUES (9, 9);
INSERT INTO dist_table(n, row_id) VALUES (10, 10);
INSERT INTO dist_table(n, row_id) VALUES (11, 11);
INSERT INTO dist_table(n, row_id) VALUES (12, 12);
```

And query the data:

```
SELECT * from dist_table;
```
