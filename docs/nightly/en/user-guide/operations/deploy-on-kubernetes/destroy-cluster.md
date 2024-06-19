# Destroy the Cluster

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
helm uninstall greptimedb-operator -n <namespace>
```

```shell
# Delete crds.
kubectl delete crds greptimedbclusters.greptime.io
```