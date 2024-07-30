# GreptimeDB 分布式集群

GreptimeDB 可以运行于 [cluster](/contributor-guide/overview.md) 模式以支持水平扩展。

## 安装 gtctl 并运行 playground

[gtctl](https://github.com/GreptimeTeam/gtctl) 是用于管理 GreptimeDB 的命令行工具。 你可以用如下命令进行安装（只适用于 Linux 和 macOS）:

```
curl -fsSL https://downloads.greptime.cn/releases/scripts/gtctl/install.sh | sh -s -- -s aws
```

:::tip Note

若您使用 Windows 操作系统，考虑到各组件运行的复杂性和兼容性，我们强烈建议您开启 WSL([Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/about))，启动一个最新的 Ubuntu 来继续执行 GreptimeDB 集群版的安装。

:::

一旦下载已经完成，`gtctl` 的二进制文件将保存在你的当前目录下。

最快体验 GreptimeDB 分布式集群的方式便是运行 `playground` 命令：

```
./gtctl playground
```

当命令执行完毕之后，playground 将会在前台启动。你可以使用 `Ctrl+C` 来停止 playground。playground 将会在你的主机上以 bare-metal 模式部署最小的 GreptimeDB 集群。

如果一切正常，你可以使用浏览器访问内置的 Dashboard `http://localhost:4000/dashboard/`。

更多的细节，请参考 [gtctl operations](/reference/gtctl.md)。

## 在 Kubernetes 中部署 GreptimeDB 集群

如果您的 Kubernetes 集群已经准备就绪（需要 1.18 或更高版本），您可以使用以下命令部署 GreptimeDB 集群：

```
./gtctl cluster create mycluster --use-greptime-cn-artifacts
```

创建完成后，你可以使用以下命令连接集群：

```
./gtctl cluster connect mycluster
```

您还可以使用 [Helm Charts](/user-guide/operations/deploy-on-kubernetes/overview.md.md) 来部署集群。

:::tip 提示

您可以使用 [kind](https://kind.sigs.k8s.io/docs/user/quick-start/) 来创建 Kubernetes：

```
kind create cluster
```

:::

当集群在您的 Kubernetes 上就绪时，您可以使用以下命令来暴露所有的服务端口（确保您已经安装了 [kubectl](https://kubernetes.io/docs/tasks/tools/)）：

```
kubectl port-forward svc/mycluster-frontend \
4000:4000 \
4001:4001 \
4002:4002 \
4003:4003
```

## 下一步

学习如何使用 GreptimeDB：[快速开始](../quick-start.md#连接到-greptimedb)。
