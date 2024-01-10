# GreptimeDB Cluster

The GreptimeDB cluster can run in the [cluster](/contributor-guide/overview.md) mode to scale horizontally.

## Install gtctl and run playground

[gtctl](https://github.com/GreptimeTeam/gtctl) is the cli tool for managing the GreptimeDB cluster. You can use the following one-line installation(only for Linux and macOS):

```
curl -fsSL \
  https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

:::tip Note

For Windows users, due to the complexity and compatibility of running multiple components together, we strongly recommend enabling WSL([Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/about)) on your operating system, and lunch a latest Ubuntu to proceed.

:::

Once the download is completed, the binary file `gtctl` will be stored in your current directory.

The **fastest** way to experience the GreptimeDB cluster is to use the playground:

```
./gtctl playground
```

When the command is executed, the playground will be started in the foreground. You can use `Ctrl+C` to stop the playground. The playground will deploy the minimal GreptimeDB cluster in bare-metal mode on your host.

For more details, please refer to [gtctl operations](/user-guide/operations/gtctl.md).

## Deploy the GreptimeDB cluster in Kubernetes

If your Kubernetes cluster is ready(a 1.18 or higher version is required), you can use the following command to deploy the GreptimeDB cluster:

```
./gtctl cluster create mycluster
```

After the creation is completed, you can use the following command to connect the cluster with MySQL protocol:

```
./gtctl cluster connect mycluster
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

## Next Steps

Learn how to write data to GreptimeDB and visualize it using Grafana in the [Quick Start](../quick-start/overview.md).
