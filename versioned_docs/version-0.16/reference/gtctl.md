---
keywords: [gtctl, command-line tool, cluster management, installation, Kubernetes, bare-metal, deployment, autocompletion]
description: Instructions for installing and using gtctl, a command-line tool for managing GreptimeDB clusters, including installation methods, autocompletion setup, and deployment modes.
---

# gtctl

[gtctl][1], g-t-control, is a command-line tool for managing the GreptimeDB clusters. gtctl is the **All-in-One** binary that integrates with multiple operations of GreptimeDB clusters.

## Installation

### One-line Installation

Download the binary using the following command:

```bash
curl -fsSL https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

After downloading, the gtctl will be in the current directory.

You also can install gtctl from the AWS-CN S3 bucket:

```bash
curl -fsSL https://downloads.greptime.cn/releases/scripts/gtctl/install.sh | sh -s -- -s aws
```

### Homebrew

On macOS, gtctl is available via Homebrew:

```bash
brew tap greptimeteam/greptime
brew install gtctl
```

### From Source

If you already have the [Go][2] installed, you can run the `make` command under this project to build gtctl:

```bash
make gtctl
```

After building, the gtctl will be generated in `./bin/`. If you want to install gtctl, you can run the `install` command:

```bash
# The built gtctl will be installed in /usr/local/bin.
make install

# The built gtctl will be installed in your customed path.
make install INSTALL_DIR=<your-path>
```

## Enable gtctl Autocompletion (Optional)

The gtctl supports autocompletion of several different shells.

### Bash

The gtctl completion script for Bash can be generated with the command `gtctl completion bash`. Sourcing the completion script in your shell enables gtctl autocompletion.

```bash
echo 'source <(gtctl completion bash)' >> ~/.bashrc
```

### Zsh

The gtctl completion script for Zsh can be generated with the command `gtctl completion zsh`. Sourcing the completion script in your shell enables gtctl autocompletion.

```bash
mkdir -p $ZSH/completions && gtctl completion zsh > $ZSH/completions/_gtctl
```

### Fish

The gtctl completion script for Fish can be generated with the command `gtctl completion fish`. Sourcing the completion script in your shell enables gtctl autocompletion.

```bash
gtctl completion fish | source
```

## Quick Start

The **fastest** way to experience the GreptimeDB cluster is to use the playground:

```bash
gtctl playground
```

The `playground` will deploy the minimal GreptimeDB cluster on your environment in **bare-metal** mode.

## Deployments

The gtctl supports two deployment mode: Kubernetes and Bare-Metal.

### Kubernetes

#### Prerequisites

* Kubernetes 1.18 or higher version is required.

    You can use the [kind][3] to create your own Kubernetes cluster:

    ```bash
    kind create cluster
    ```

#### Create

Create your own GreptimeDB cluster and etcd cluster:

```bash
gtctl cluster create mycluster -n default
```

If you want to use artifacts(charts and images) that are stored in the CN region, you can enable `--use-greptime-cn-artifacts`:

```bash
gtctl cluster create mycluster -n default --use-greptime-cn-artifacts
```

After creating, the whole GreptimeDB cluster will start in the default namespace:

```bash
# Get the cluster.
gtctl cluster get mycluster -n default

# List all clusters.
gtctl cluster list
```

All the values used for cluster, etcd and operator which provided in [charts][4] are configurable, you can use `--set` to configure them. The gtctl also surface some commonly used configurations, you can use `gtctl cluster create --help` to browse them.

```bash
# Configure cluster datanode replicas to 5
gtctl cluster create mycluster --set cluster.datanode.replicas=5

# Two same ways to configure etcd storage size to 15Gi
gtctl cluster create mycluster --set etcd.storage.volumeSize=15Gi
gtctl cluster create mycluster --etcd-storage-size 15Gi
```

#### Dry Run

gtctl provides `--dry-run` option in cluster creation. If a user executes the command with `--dry-run`, gtctl will output the manifests content without applying them:

```bash
gtctl cluster create mycluster -n default --dry-run
```

#### Connect

You can use the kubectl `port-forward` command to forward frontend requests:

```bash
kubectl port-forward svc/mycluster-frontend 4002:4002 > connections.out &
```

Use gtctl `connect` command or your `mysql` client to connect to your cluster:

```bash
gtctl cluster connect mycluster -p mysql

mysql -h 127.0.0.1 -P 4002
```

#### Scale (Experimental)

You can use the following commands to scale (or down-scale) your cluster:

```bash
# Scale datanode to 3 replicas.
gtctl cluster scale <your-cluster> -n <your-cluster-namespace> -c datanode --replicas 3

# Scale frontend to 5 replicas.
gtctl cluster scale <your-cluster> -n <your-cluster-namespace> -c frontend --replicas 5
```

#### Delete

If you want to delete the cluster, you can:

```bash
# Delete the cluster.
gtctl cluster delete mycluster -n default

# Delete the cluster, including etcd cluster.
gtctl cluster delete mycluster -n default --tear-down-etcd
```

### Bare-Metal

#### Create

You can deploy the GreptimeDB cluster on a bare-metal environment by the following simple command:

```bash
gtctl cluster create mycluster --bare-metal
```

It will create all the necessary meta information on `${HOME}/.gtctl`.

If you want to do more configurations, you can use the yaml format config file:

```bash
gtctl cluster create mycluster --bare-metal --config <your-config-file>
```

You can refer to the example config `cluster.yaml` and `cluster-with-local-artifacts.yaml` provided in [`examples/bare-metal`][5].

#### Delete

Since the cluster in bare-metal mode runs in the foreground, any `SIGINT` and `SIGTERM` will delete the cluster. For example, the cluster will be deleted after pressing `Ctrl+C` on keyboard.

The deletion will also delete the meta information of one cluster which located in `${HOME}/.gtctl`. The logs of cluster will remain if `--retain-logs` is enabled (enabled by default).

## Development

There are many useful tools provided through Makefile, you can simply run make help to get more information:

* Compile the project

    ```bash
    make
    ```

    Then the gtctl will be generated in `./bin/`.

* Run the unit test

    ```bash
    make test
    ```

* Run the e2e test

    ```bash
    make e2e
    ```

[1]: <https://github.com/GreptimeTeam/gtctl>
[2]: <https://go.dev/doc/install>
[3]: <https://kind.sigs.k8s.io/>
[4]: <https://github.com/GreptimeTeam/helm-charts>
[5]: <https://github.com/GreptimeTeam/gtctl/tree/develop/examples/bare-metal>
