# Install GreptimeDB Opertator

By utilizing the [Operator pattern][3], [GreptimeDB Operator][1] can effectively manage GreptimeDB clusters on [Kubernetes][2]. This operator abstracts the model of maintaining a highly available GreptimeDB cluster.

You can use Helm to install GreptimeDB Operator.
Make sure you have already installed [Helm][5]. 
Use the following commands to install `greptimedb-operator`:

```shell
helm repo add greptime https://greptimeteam.github.io/helm-charts/
```

```shell
helm repo update
```

```shell
helm install greptimedb-operator greptime/greptimedb-operator -n <namespace>
```

When you install the GreptimeDB Operator, it uses the default namespace.
To install it in a different namespace, replace `<namespace>` with the desired namespace.

The maintained Helm charts are in [helm-charts][4].

[1]: <https://github.com/GreptimeTeam/greptimedb-operator>
[2]: <https://kubernetes.io/>
[3]: <https://kubernetes.io/docs/concepts/extend-kubernetes/operator/>
[4]: <https://github.com/GreptimeTeam/helm-charts>
