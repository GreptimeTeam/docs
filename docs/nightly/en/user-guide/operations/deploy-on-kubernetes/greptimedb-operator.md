# GreptimeDB Opertator

## Install GreptimeDB Opertator

By utilizing the [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/),
[GreptimeDB Operator](https://github.com/GreptimeTeam/greptimedb-operator) can effectively manage GreptimeDB clusters on [Kubernetes](https://kubernetes.io/).
This operator abstracts the model of maintaining a highly available GreptimeDB cluster.

You can use Helm to install GreptimeDB Operator.

```shell
helm install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin
```

<!-- TODO: more feature instructions of GreptimeDB Operator -->

## Next steps

- [Deploy GreptimeDB Cluster](deploy-greptimedb-cluster.md): This section provides instructions on how to deploy etcd cluster and GreptimeDB cluster on Kubernetes.
