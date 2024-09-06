# GreptimeDB Operator

## Install GreptimeDB Operator

By utilizing the [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/),
[GreptimeDB Operator](https://github.com/GreptimeTeam/greptimedb-operator) can effectively manage GreptimeDB clusters on [Kubernetes](https://kubernetes.io/).
This operator abstracts the model of maintaining a highly available GreptimeDB cluster.

You can use Helm to install GreptimeDB Operator.

```shell
helm upgrade \
  --install greptimedb-operator greptime/greptimedb-operator \
  --create-namespace \
  -n greptimedb-admin
```

## Install and upgrade CRDs

Helm cannot upgrade custom resource definitions in the `<chart>/crds` folder [by design](https://helm.sh/docs/chart_best_practices/custom_resource_definitions/#some-caveats-and-explanations).

We support installing and upgrading CRDs automatically using the chart. You can disable this behavior by using `--set crds.install=false` when installing the chart:

```shell
helm upgrade \
  --install greptimedb-operator greptime/greptimedb-operator \
  --create-namespace \
  -n greptimedb-admin \
  --set crds.install=false
```

When you uninstall the GreptimeDB Operator, it will not delete the CRDs by default.

<!-- TODO: more feature instructions of GreptimeDB Operator -->

## Next steps

- [Deploy GreptimeDB Cluster](deploy-greptimedb-cluster.md): This section provides instructions on how to deploy etcd cluster and GreptimeDB cluster on Kubernetes.
