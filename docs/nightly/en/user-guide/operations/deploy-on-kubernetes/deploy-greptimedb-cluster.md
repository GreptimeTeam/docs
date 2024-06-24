# Deploy GreptimeDB Cluster

Before the deployment,
make sure you have already installed [GreptimeDB Operator](greptimedb-operator.md) on your Kubernetes cluster.

## Using Helm for deployment

### Create an etcd cluster

First, establish an etcd cluster to support GreptimeDB by executing the following command:

```shell
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  --create-namespace \
  -n etcd
```

After the installation,
you can get the etcd cluster endpoints `etcd.etcd.svc.cluster.local:2379` from the installation logs.
The endpoints are required for deploying the GreptimeDB cluster in the subsequent step.

### Create a GretpimeDB cluster

Deploy the GreptimeDB cluster, ensuring it connects to the previously established etcd cluster:
  
```shell
helm install greptimedb greptime/greptimedb-cluster \
  --set meta.etcdEndpoints=etcd.etcd.svc.cluster.local:2379 \
  --create-namespace \
  -n greptimedb-cluster
```

## Using kubectl for deployment

Alternatively, you can manually create a GreptimeDB cluster using `kubectl`.
Start by creating a configuration file named `greptimedb-cluster.yaml` with the following content:

```yml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: greptimedb
  namespace: greptimedb-cluster
spec:
  base:
    main:
      image: greptime/greptimedb
  frontend:
    replicas: 1
  meta:
    replicas: 1
    etcdEndpoints:
      - "etcd.etcd.svc.cluster.local:2379"
  datanode:
    replicas: 3
```

Apply this configuration to instantiate the GreptimeDB cluster:

```shell
kubectl apply -f greptimedb-cluster.yaml
```

## Connect to the cluster

After the installation, you can use `kubectl port-forward` to forward the MySQL protocol port of the GreptimeDB cluster:

```shell
# You can use the MySQL client to connect the cluster, for example: 'mysql -h 127.0.0.1 -P 4002'.
kubectl port-forward svc/greptimedb-frontend 4002:4002 -n greptimedb-cluster > connections.out &

# You can use the PostgreSQL client to connect the cluster, for example: 'psql -h 127.0.0.1 -p 4003 -d public'.
kubectl port-forward svc/greptimedb-frontend 4003:4003 -n greptimedb-cluster > connections.out &
```

Then you can use MySQL client to [connect to the cluster](/getting-started/quick-start/mysql.md#connect).

<!--

TODO:
Capacity plan for each component: etcd, frontend, datanode, metasrv
The following command maybe used in the future documentation:

```shell
helm upgrade \
      --install etcd \
      --set replicaCount=3 \
      --set resources.requests.cpu=100m \
      --set auth.rbac.create=false \
      --set auth.rbac.token.enabled=false \
      oci://registry-1.docker.io/bitnamicharts/etcd \
      -n etcd
```

helm upgrade \
      --install greptimedb \
      --set meta.etcdEndpoints=etcd.etcd.svc.cluster.local:2379 \
      --set base.podTemplate.main.resources.requests.cpu=100m \
      --set base.podTemplate.main.resources.requests.memory=256Mi \
      --set datanode.podTemplate.main.resources.requests.cpu=100m \
      --set datanode.podTemplate.main.resources.requests.memory=256Mi \
      --set frontend.podTemplate.main.resources.requests.cpu=100m \
      --set frontend.podTemplate.main.resources.requests.memory=256Mi \
      greptime/greptimedb-cluster \
      -n greptimedb-cluster 
-->
