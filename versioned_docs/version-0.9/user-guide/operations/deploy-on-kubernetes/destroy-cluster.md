# Destroy the Cluster

This guide will remove all resources created by the documentation in this Deploy on Kubernetes chapter.

## Uninstall the GreptimeDB Operator

To uninstall the GreptimeDB Operator using Helm, execute:

```shell
helm uninstall greptimedb-operator -n greptimedb-admin
```

## uninstall the GreptimeDB Cluster

For Helm installations of the GreptimeDB cluster, use:

```shell
helm uninstall greptimedb -n greptimedb-cluster
```

If the GreptimeDB cluster was installed with `kubectl`, remove it with:

```shell
kubectl delete greptimedbcluster greptimedb -n greptimedb-cluster
```

## Uninstall etcd

To remove etcd with Helm, run:

```shell
# Uninstall etcd.
helm uninstall etcd -n etcd-cluster
```

## Deleting Custom Resource Definitions (CRDs)

:::tip NOTE
The CRDs will not be deleted by default when you uninstall the release unless you set `crds.keep=false` in the Helm installation command.
:::

```shell
kubectl delete crds greptimedbclusters.greptime.io
kubectl delete crds greptimedbstandalones.greptime.io
```

## Cleaning Up Namespaces

Finally, delete the associated namespaces:

```shell
kubectl delete namespace greptimedb-admin
kubectl delete namespace etcd-cluster
kubectl delete namespace greptimedb-cluster
```
