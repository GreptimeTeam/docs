# Kubernetes
<!-- TODO how to apply yaml config -->
<!-- Besides Kubernetes comand line tool `kubectl`, `helm` and `gtctl` can also be used to manage GreptimeDB clusters.

## kubectl

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
helm install gtcloud greptime/greptimedb-operator -n default --devel
```

The maintained Helm charts are in [helm-charts][6].

### 3. Create your own etcd cluster

```shell
helm install etcd greptime/greptimedb-etcd -n default --devel
```

### 4. Create your own GreptimeDB cluster

Create GreptimeDB cluster:

```shell
helm install mydb greptime/greptimedb -n default --devel
```

If you already have the etcd cluster, you can configure the etcd cluster:
  
```shell
helm install mycluster greptime/greptimedb --set etcdEndpoints=<your-etcd-cluster-endpoints> \
-n default --devel
```

After the installation, you can use `kubectl port-forward` to access GreptimeDB cluster:

```shell
kubectl port-forward svc/mydb-frontend 4002:4002 > connections.out &
```


### 5. Destroy GreptimeDB cluster

You can use the following commands to uninstall operator and cluster:

```shell
# Uninstall the cluster.
helm uninstall mydb
```

```shell
# Uninstall etcd.
helm uninstall etcd -n default
```

```shell
# Uninstall the operator.
helm uninstall gtcloud
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

## gtctl

[gtctl][1], g-t-control, is a command-line tool for managing the GreptimeDB clusters. gtctl is the all-in-one binary that integrates with multiple operations of GreptimeDB clusters.

### 1. Create a test Kubernetes cluster

You can use [kind][4] to create your own test `Kubernetes` cluster:

```shell
kind create cluster
```

### 2. Install gtctl

Currently, `gtctl` supports `Linux` and `Darwin` on `x86_64` and `ARM64`.

```shell
curl -L https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

### 3. Create your own GreptimeDB cluster

```shell
./gtctl cluster create mydb -n default
```

After the installation is completed, `gtctl` creates the followings:

- `etcd` cluster
- `frontend` instances (default replicas is 1)
- `datanode` instances(default replicas is 3)
- `metasrv` service(default replicas is 1)

You can use `kubectl port-forward` command to forward frontend requests:

```shell
kubectl port-forward svc/mydb-frontend 4002:4002 > connections.out &
```

### 4. Delete your own GreptimeDB cluster

```shell
./gtctl cluster delete mydb --tear-down-etcd
```

[1]: <https://github.com/GreptimeTeam/gtctl>
[2]: <https://kind.sigs.k8s.io/docs/user/quick-start/>
