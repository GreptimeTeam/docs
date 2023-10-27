# 开始探索 GreptimeDB 分布式集群

## 安装 gtctl 并运行 playground

[gtctl](https://github.com/GreptimeTeam/gtctl) 是用于管理 GreptimeDB 的命令行工具。 你可以用如下命令进行安装（只适用于 Linux 和 macOS）:

```
curl -fsSL https://downloads.greptime.cn/releases/scripts/gtctl/install.sh | sh -s -- -s aws
```

一旦下载已经完成，`gtctl` 的二进制文件将保存在你的当前目录下。

最快体验 GreptimeDB 分布式集群的方式便是运行 `playground` 命令：

```
./gtctl playground
```

当命令执行完毕之后，playground 将会在前台启动。你可以使用 `Ctrl+C` 来停止 playground。playground 将会在你的主机上以 bare-metal 模式部署最小的 GreptimeDB 集群。
