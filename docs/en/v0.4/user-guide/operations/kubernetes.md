# Kubernetes
<!-- TODO how to apply yaml config -->
<!-- Besides Kubernetes command line tool `kubectl`, `helm` and `gtctl` can also be used to manage GreptimeDB clusters.

## Kubectl

You can create your own cluster as easily as possible by using `kubectl`:

```shell
cat <<EOF | kubectl apply -f -
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
EOF
``` -->

## GreptimeDB Operator

By utilizing the [Operator pattern][3], [GreptimeDB Operator][1] can effectively manage GreptimeDB clusters on [Kubernetes][2]. This operator abstracts the model of maintaining a highly available GreptimeDB cluster.

### 1. Create a test Kubernetes cluster

You can use [kind][4] to create your own test  Kubernetes cluster:

```shell
kind create cluster
```

### 2. Use Helm to install GreptimeDB Operator

Make sure you have already installed [Helm][5].  Use the following commands to install
`greptimedb-operator` in the default namespace:

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
```

```shell
helm repo update
```

```shell
helm install greptimedb-operator greptime/greptimedb-operator -n default
```

The maintained Helm charts are in [helm-charts][6].

### 3. Create your own GreptimeDB cluster

Create an etcd cluster for GreptimeDB:

```shell
helm install etcd oci://registry-1.docker.io/bitnamicharts/etcd \
  --set replicaCount=3 \
  --set auth.rbac.create=false \
  --set auth.rbac.token.enabled=false \
  -n default
```

Create a GreptimeDB cluster which uses the etcd cluster created at previous step:

```shell
helm install mycluster greptime/greptimedb-cluster -n default
```

Or, if you already have an etcd cluster, you can use `etcdEndpoints` to use your etcd cluster:
  
```shell
helm install mycluster greptime/greptimedb-cluster \
  --set etcdEndpoints=<your-etcd-cluster-endpoints> \
  -n default
```

After the installation, you can use `kubectl port-forward` to forward the MySQL protocol port of the GreptimeDB cluster:

```shell
# You can use the MySQL client to connect the cluster, for example: 'mysql -h 127.0.0.1 -P 4002'.
kubectl port-forward svc/mycluster-frontend 4002:4002 > connections.out &

# You can use the PostgreSQL client to connect the cluster, for example: 'psql -h 127.0.0.1 -p 4003 -d public'.
kubectl port-forward svc/mycluster-frontend 4003:4003 > connections.out &
```

Then you can use MySQL client to [connect to the cluster](/getting-started/try-out-greptimedb.md#Connect).

### 4. Destroy GreptimeDB cluster

You can use the following commands to uninstall operator and cluster:

```shell
# Uninstall the cluster.
helm uninstall mycluster -n default
```

```shell
# Uninstall etcd.
helm uninstall etcd -n default
```

```shell
# Uninstall the operator.
helm uninstall greptimedb-operator -n default
```

```shell
# Delete crds.
kubectl delete crds greptimedbclusters.greptime.io
```

[1]: <https://github.com/GreptimeTeam/greptimedb-operator>
[2]: <https://kubernetes.io/>
[3]: <https://kubernetes.io/docs/concepts/extend-kubernetes/operator/>
[4]: <https://kind.sigs.k8s.io/docs/user/quick-start/>
[5]: <https://helm.sh/docs/intro/install/>
[6]: <https://github.com/GreptimeTeam/helm-charts>
