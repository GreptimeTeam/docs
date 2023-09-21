# Try Out the GreptimeDB Cluster

The GreptimeDB cluster can run in the [cluster](/developer-guide/overview.md) mode to scale horizontally.

## Install gtctl and run playground

[gtctl](https://github.com/GreptimeTeam/gtctl) is the cli tool for managing the GreptimeDB cluster. You can use the following one-line installation(only for Linux and macOS):

```
curl -fsSL \
  https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

Once the download is completed, the binary file `gtctl` will be stored in your current directory.

The **fastest** way to experience the GreptimeDB cluster is to use the playground:

```
gtctl playground
```

When the command is executed, the playground will be started in the foreground. You can use `Ctrl+C` to stop the playground. The playground will deploy the minimal GreptimeDB cluster in bare-metal mode on your host.

You can use the same commands from [Try Out GreptimeDB](/getting-started/try-out-greptimedb.md) to interact with the GreptimeDB cluster. 

For more details, please refer to [gtctl operations](/user-guide/operations/gtctl.md).

## Deploy the GreptimeDB cluster in Kubernetes

If your Kubernetes cluster is ready(a 1.18 or higher version is required), you can use the following command to deploy the GreptimeDB cluster:

```
gtctl cluster create mycluster
```

After the creation is completed, you can use the following command to connect the cluster with MySQL protocol:

```
gtctl cluster connect mycluster
```

You also can use [Helm Charts](/user-guide/operations/kubernetes.md) to deploy the cluster.

:::tip Note

You can use the [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) to create the Kubernetes:

```
kind create cluster
```

:::

When the cluster is ready on your Kubernetes, you can use the following commands to expose all the service ports(make sure you already install [kubectl](https://kubernetes.io/docs/tasks/tools/)):

```
kubectl port-forward svc/mycluster-frontend \
  4000:4000 \
  4001:4001 \
  4002:4002 \
  4003:4003 \
  4242:4242
```

You can open the new terminal to connect the database by client tools(mysql or psql) and operate the data like [Try Out GreptimeDB](/getting-started/try-out-greptimedb.md).
