# Install GreptimeDB Opertator

By utilizing the [Operator pattern](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/),
[GreptimeDB Operator](https://github.com/GreptimeTeam/greptimedb-operator) can effectively manage GreptimeDB clusters on [Kubernetes](https://kubernetes.io/).
This operator abstracts the model of maintaining a highly available GreptimeDB cluster.

You can use Helm to install GreptimeDB Operator.
Make sure you have already installed [Helm](https://helm.sh/docs/intro/install/). 
Use the following commands to install `greptimedb-operator`:

```shell
helm install greptimedb-operator greptime/greptimedb-operator -n greptimedb-admin
```

<!-- TODO: more feature instructions of GreptimeDB Operator -->
