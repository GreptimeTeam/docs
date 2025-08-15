---
keywords: [gtctl, 安装, Homebrew, 源代码构建, 自动补全, 快速入门, 部署, Kubernetes, 裸机模式]
description: 介绍 gtctl 工具的安装、使用方法，包括一键安装、通过 Homebrew 安装、从源代码构建、启用自动补全、快速入门、部署等内容。
---

# gtctl

[gtctl][1]，g-t-control，是一个用于管理 GreptimeDB 集群的命令行工具。gtctl 是集成了 GreptimeDB 集群的多种操作的多合一 binary。

## 安装

### 一键安装

使用以下命令下载二进制文件：

```bash
curl -fsSL https://raw.githubusercontent.com/greptimeteam/gtctl/develop/hack/install.sh | sh
```

下载完成后，gtctl 将位于当前目录中。

你还可以从 AWS 中国区 S3 存储桶安装 gtctl：

```bash
curl -fsSL https://downloads.greptime.cn/releases/scripts/gtctl/install.sh | sh -s -- -s aws
```

### 通过 Homebrew 安装

在 macOS 上，可以通过 Homebrew 安装 gtctl：

```bash
brew tap greptimeteam/greptime
brew install gtctl
```

### 从源代码构建

如果已经安装了 [Go][2]，可以在该项目下运行 `make` 命令来构建 gtctl：

```bash
make gtctl
```

构建完成后，gtctl 将生成在 `./bin/` 目录下。如果想要安装 gtctl，可以运行 `install` 命令：

```bash
# 构建的 gtctl 将安装在 /usr/local/bin 目录下
make install

# 构建的 gtctl 将安装在自定义路径下
make install INSTALL_DIR=<your-path>
```

## 启用 gtctl 自动补全（可选）

gtctl 支持多种不同的 shell 自动补全。

### Bash

在 Bash 中，可以使用命令 `gtctl completion bash` 生成 gtctl 的自动补全脚本。将补全脚本引入到你的 shell 中可以启用 gtctl 的自动补全功能。

```bash
echo 'source <(gtctl completion bash)' >> ~/.bashrc
```

### Zsh

在 Zsh 中，可以使用命令 `gtctl completion zsh` 生成 gtctl 的自动补全脚本。将补全脚本引入到你的 shell 中可以启用 gtctl 的自动补全功能。

```bash
mkdir -p $ZSH/completions && gtctl completion zsh > $ZSH/completions/_gtctl
```

### Fish

在 Fish 中，可以使用命令 `gtctl completion fish` 生成 gtctl 的自动补全脚本。将补全脚本引入到你的 shell 中可以启用 gtctl 的自动补全功能。

```bash
gtctl completion fish | source
```

## 快速入门

体验 GreptimeDB 集群的**最快**方法是使用 playground：

```bash
gtctl playground
```

`playground` 命令将在你的环境中以**裸机**模式部署最小的 GreptimeDB 集群。

## 部署

gtctl 支持两种部署模式：Kubernetes 和裸机模式（Bare-Metal）。

### Kubernetes

#### 先决条件

* 需要 Kubernetes 版本 1.18 或更高。

    你可以使用 [kind][3] 创建自己的 Kubernetes 集群：

    ```bash
    kind create cluster
    ```

#### 创建

创建自己的 GreptimeDB 集群和 etcd 集群：

```bash
gtctl cluster create mycluster -n default
```

如果你想使用存储在中国区的 artifacts（charts 和镜像），你可以启用 `--use-greptime-cn-artifacts`：

```bash
gtctl cluster create mycluster -n default --use-greptime-cn-artifacts
```

创建完成后，整个 GreptimeDB 集群将在 default 命名空间中启动：

```bash
# 获取集群。
gtctl cluster get mycluster -n default

# 列出所有集群。
gtctl cluster list
```

所有在 [charts][4] 中提供的用于 cluster、etcd 和 operator 的值都是可配置的，你可以使用 `--set` 进行配置。gtctl 还提供了一些常用的配置选项，你可以使用 `gtctl cluster create --help` 来查看它们。

```bash
# 将 cluster datanode 副本数配置为 5
gtctl cluster create mycluster --set cluster.datanode.replicas=5

# 两种配置 etcd 存储大小为 15Gi 的方式
gtctl cluster create mycluster --set etcd.storage.volumeSize=15Gi
gtctl cluster create mycluster --etcd-storage-size 15Gi
```

#### 预运行

在集群创建过程中，gtctl 提供了 `--dry-run` 选项。如果用户使用 `--dry-run` 执行命令，gtctl 将输出清单的内容而不应用它们：

```bash
gtctl cluster create mycluster -n default --dry-run
```

#### 连接

你可以使用 kubectl 的 `port-forward` 命令将前端请求转发到本地：

```bash
kubectl port-forward svc/mycluster-frontend 4002:4002 > connections.out &
```

使用 gtctl 的 `connect` 命令或你的 `mysql` 客户端连接到集群：

```bash
gtctl cluster connect mycluster -p mysql

mysql -h 127.0.0.1 -P 4002
```

#### 扩缩容（实验性）

你可以使用以下命令来扩展（或缩小）集群的规模：

```bash
# 将 datanode 扩展到 3 个副本。
gtctl cluster scale <your-cluster> -n <your-cluster-namespace> -c datanode --replicas 3

# 将 frontend 扩展到 5 个副本。
gtctl cluster scale <your-cluster> -n <your-cluster-namespace> -c frontend --replicas 5
```

#### 删除

如果你想删除集群，可以执行以下操作：

```bash
# 删除集群。
gtctl cluster delete mycluster -n default

# 删除集群，包括 etcd 集群。
gtctl cluster delete mycluster -n default --tear-down-etcd
```

### 裸机模式（Bare-Metal）

#### 创建

你可以使用以下简单命令在裸机环境中部署 GreptimeDB 集群：

```bash
gtctl cluster create mycluster --bare-metal
```

它会在 `${HOME}/.gtctl` 中创建所有必要的元信息。

如果你想进行更多的配置，可以使用 yaml 格式的配置文件：

```bash
gtctl cluster create mycluster --bare-metal --config <your-config-file>
```

你可以参考 [`examples/bare-metal`][5] 中提供的示例配置文件 `cluster.yaml` 和 `cluster-with-local-artifacts.yaml`。

#### 删除

由于裸机模式下的集群在前台运行，任何 `SIGINT` 和 `SIGTERM` 信号都会删除集群。例如，在键盘上按下 `Ctrl+C` 后集群将被删除。

删除操作还会删除位于 `${HOME}/.gtctl` 中的一个集群的元信息。如果启用了 `--retain-logs`（默认启用），集群的日志将保留。

## 开发

Makefile 提供了许多有用的工具，你可以简单地运行 `make help` 来获取更多信息：

* 编译项目

    ```bash
    make
    ```

    然后 gtctl 会生成在 `./bin/` 目录下。

* 运行单元测试

    ```bash
    make test
    ```

* 运行端到端测试

    ```bash
    make e2e
    ```

[1]: <https://github.com/GreptimeTeam/gtctl>
[2]: <https://go.dev/doc/install>
[3]: <https://kind.sigs.k8s.io/>
[4]: <https://github.com/GreptimeTeam/helm-charts>
[5]: <https://github.com/GreptimeTeam/gtctl/tree/develop/examples/bare-metal>
