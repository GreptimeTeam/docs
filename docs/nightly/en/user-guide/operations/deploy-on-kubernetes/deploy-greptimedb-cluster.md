# Deploy GreptimeDB Cluster

## Deploy via Helm

### Create an etcd cluster

Create an etcd cluster for GreptimeDB:

```shell
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n default
```

### Create a GretpimeDB cluster

Create a GreptimeDB cluster which uses the etcd cluster created at previous step:

```shell
helm install greptime-cluster greptime/greptimedb-cluster -n default
```

Or, if you already have an etcd cluster, you can use `etcdEndpoints` to use your etcd cluster:
  
```shell
helm install mycluster greptime/greptimedb-cluster \
  --set etcdEndpoints=<your-etcd-cluster-endpoints> \
  -n default
```

## Deploy via Kubectl

You can also create your own cluster by using `kubectl`.
Create a file named `greptimedb-cluster.yaml` with the following example content:

```yml
apiVersion: greptime.io/v1alpha1
kind: GreptimeDBCluster
metadata:
  name: basic
spec:
  base:
    main:
      image: greptime/greptimedb
  frontend:
    replicas: 1
  meta:
    replicas: 1
    etcdEndpoints:
      - "etcd.default:2379"
  datanode:
    replicas: 3
```

Then apply the configuration to create the GreptimeDB cluster:

```shell
kubectl apply -f greptimedb-cluster.yaml
```

## Connect to the cluster

After the installation, you can use `kubectl port-forward` to forward the MySQL protocol port of the GreptimeDB cluster:

```shell
# You can use the MySQL client to connect the cluster, for example: 'mysql -h 127.0.0.1 -P 4002'.
kubectl port-forward svc/mycluster-frontend 4002:4002 > connections.out &

# You can use the PostgreSQL client to connect the cluster, for example: 'psql -h 127.0.0.1 -p 4003 -d public'.
kubectl port-forward svc/mycluster-frontend 4003:4003 > connections.out &
```

Then you can use MySQL client to [connect to the cluster](/getting-started/quick-start/mysql.md#connect).
