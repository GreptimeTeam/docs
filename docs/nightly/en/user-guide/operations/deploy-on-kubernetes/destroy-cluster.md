# Destroy the Cluster

You can use the following commands to uninstall operator and cluster:

```shell
# Uninstall the cluster.
helm uninstall greptime-cluster -n default
```

```shell
# Uninstall etcd.
helm uninstall etcd -n default
```

```shell
helm uninstall greptimedb-operator -n default
```

```shell
# Delete crds.
kubectl delete crds greptimedbclusters.greptime.io
```
