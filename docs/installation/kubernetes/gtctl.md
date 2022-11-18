# gtctl

## What's gtctl

[gtctl][1], g-t-control, is a command-line tool for managing the GreptimeDB clusters. gtctl is the all-in-one binary that integrates with multiple operations of GreptimeDB clusters.

## Get Started with gtctl on Kubernetes

### 1\. Create a test Kubernetes cluster

You can use [kind][2] to create your own test `Kubernetes` cluster:

```console
kind create cluster
```

### 2\. Install gtctl

Currently, `gtctl` supports `Linux` and `Darwin` on `x86_64` and `ARM64`.

```console
curl -L https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

### 3\. Create your own GreptimeDB cluster

```console
gtctl cluster create mydb -n default
```

After the installation is completed, `gtctl` creates the followings:

- `etcd` cluster
- `frontend` instances (default replicas is 1)
- `datanode` instances(default replicas is 3)
- `metasrv` service(default replicas is 1)

You can use `kubectl port-forward` command to forward frontend requests:

```console
kubectl port-forward svc/mydb-frontend 4002:4002 > connections.out &
```

Use your `mysql` client to connect your cluster:

```console
mysql -h 127.0.0.1 -P 4002
```

### 4\. Delete your own GreptimeDB cluster

```console
gtctl cluster delete mydb --tear-down-etcd
```

[1]: <https://github.com/GreptimeTeam/gtctl>
[2]: <https://kind.sigs.k8s.io/docs/user/quick-start/>
