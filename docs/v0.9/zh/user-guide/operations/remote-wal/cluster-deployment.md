# 集群部署

我们强烈建议将 GreptimeDB 集群部署在 Kubernetes 中，这里是一些此次部署的前置依赖：

- Kubernetes(>=1.18)

  出于测试原因，你可以使用 Kind 或者 MiniKube 来创建 Kubernetes 环境。

- Helm v3

- kubectl

## Step 1: 部署 GreptimeDB Operator

使用如下命令来添加 Helm Chart 仓库：

```
helm repo add greptime https://greptimeteam.github.io/helm-charts/
helm repo update
```

创建 `greptimedb-admin` namespace 并将 GreptimeDB Operator 部署在这个 namespace 中：

```
kubectl create ns greptimedb-admin
helm upgrade --install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin
```

## Step 2: 部署 GreptimeDB Cluster

GreptimeDB 集群需要使用 etcd 集群来作为 metasrv 的后端存储。我们建议使用 Bitnami etcd chart 来部署 etcd 集群：

``` 
kubectl create ns metasrv-store
helm upgrade --install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n metasrv-store
```

当 etcd 集群已经部署完成，你可以用如下命令来检查其健康状况：

```
kubectl -n metasrv-store \
  exec etcd-0 -- etcdctl \
  --endpoints etcd-0.etcd-headless.metasrv-store:2379,etcd-1.etcd-headless.metasrv-store:2379,etcd-2.etcd-headless.metasrv-store:2379 \
  endpoint status
```

## Step 3: 部署 Kafka 集群

我们建议使用 [strimzi-kafka-operator](https://github.com/strimzi/strimzi-kafka-operator) 来部署 KRaft 模式的 Kafka 集群。

创建 `kafka` namespace 并安装 strimzi-kafka-operator:

```
kubectl create namespace kafka
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka
```

当 operator 部署完成，使用如下 Spec 来创建 Kafka 集群：

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
    version: 3.7.0
    metadataVersion: 3.7-IV4
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

将上述 spec 保存为 `kafka-wal.yaml` 并 apply 到 Kubernetes 中：

```
kubectl apply -f kafka-wal.yaml -n kafka
```

当 Kafka 集群部署完成，检查其状态：

```
kubectl get kafka -n kafka
```

预期的输出将会是：

```
NAME        DESIRED KAFKA REPLICAS   DESIRED ZK REPLICAS   READY   METADATA STATE   WARNINGS
kafka-wal                                                  True    KRaft
```

## Step 4: 部署 Remote WAL 配置下的 GrpetimeDB 集群

使用如下 remote WAL 配置来创建 GreptimeDB 集群：

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
    etcdEndpoints:
      - "etcd.metasrv-store:2379"
  datanode:
    replicas: 3
  remoteWal:
    kafka:
      brokerEndpoints:
        - "kafka-wal-kafka-bootstrap.kafka:9092"
EOF
```

当集群部署完成，可用如下命令检查其状态：

```
kubectl get gtc my-cluster -n default
```

预期输出将会是：

```
NAME         FRONTEND   DATANODE   META   PHASE     VERSION   AGE
my-cluster   1          3          1      Running   latest    5m30s
```

##  Step 5: 写入和读取数据

你可以参考 [Overview](/getting-started/quick-start/overview.md) 来获得更多案例. 对于这个指南，我们将选用 MySQL 协议来连接数据库集群。

使用 kubectl 的 port forward 来转发 `4002` 流量:

```
kubectl port-forward svc/my-cluster-frontend 4002:4002 -n default
```

打开另一个 terminal 并用 `mysql` 连接集群：

```
mysql -h 127.0.0.1 -P 4002
```

创建分布式表：

```
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
)
engine=mito;
```

写入数据：

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

接着查询数据：

```
SELECT * from dist_table;
```
