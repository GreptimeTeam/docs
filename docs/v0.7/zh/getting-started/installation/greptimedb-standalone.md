# GreptimeDB 单机模式

## 安装

你可以在[下载页面](https://greptime.cn/download)通过我们发布的测试版本尝试使用 GreptimeDB。

我们先通过最简单的配置来开始。有关 GreptimeDB 中可用的所有配置选项的详细列表，请参考[配置文档](/user-guide/operations/configuration.md)。

### 二进制

### Linux 或 macOS

如果你使用的是 Linux 或 macOS，可以通过以下命令下载 `greptime` binary 的最新版本：

```shell
curl -fsSL \
  https://raw.githubusercontent.com/greptimeteam/greptimedb/main/scripts/install.sh | sh
```

下载完成后，binary 文件 `greptime` 将存储在当前的目录中。

你可以在单机模式下运行 GreptimeDB：

```shell
./greptime standalone start
```

### Windows

若您的 Windows 系统已开启 WSL([Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/about))，您可以直接打开一个最新的 Ubuntu 接着如上所示运行 GreptimeDB ！

否则请到我们的[官网](https://greptime.com/resources)下载并解压最新的 GreptimeDB for Windows 安装包。

在单机模式下运行 GreptimeDB，您可以在 GreptimeDB 二进制所在的文件夹下打开一个终端（比如 Powershell ），执行：

```shell
.\greptime standalone start
```

### Docker

请确保已经安装了 [Docker](https://www.docker.com/)。如果还没有安装，可以参考 Docker 官方的[文档](https://www.docker.com/get-started/)进行安装。

```shell
docker run -p 127.0.0.1:4000-4003:4000-4003 \
-p 4242:4242 -v "$(pwd)/greptimedb:/tmp/greptimedb" \
--name greptime --rm \
greptime/greptimedb:<%greptimedb-version%> standalone start \
--http-addr 0.0.0.0:4000 \
--rpc-addr 0.0.0.0:4001 \
--mysql-addr 0.0.0.0:4002 \
--postgres-addr 0.0.0.0:4003
```

数据将会存储在当前目录下的 `greptimedb/` 目录中。

如果你想要使用另一个版本的 GreptimeDB 镜像，可以从我们的 [GreptimeDB Dockerhub](https://hub.docker.com/r/greptime/greptimedb) 下载。

:::tip 注意事项

如果正在使用小于 [v23.0](https://docs.docker.com/engine/release-notes/23.0/) 的 Docker 版本，由于旧版本的 Docker Engine 中存在 [bug](https://github.com/moby/moby/pull/42681)，所以当你尝试运行上面的命令时，可能会遇到权限不足的问题。

你可以:

1. 设置 `--security-opt seccomp=unconfined`：

   ```shell
   docker run --security-opt seccomp=unconfined -p 4000-4003:4000-4003 \
   -p 4242:4242 -v "$(pwd)/greptimedb:/tmp/greptimedb" \
   --name greptime --rm \
   greptime/greptimedb:<%greptimedb-version%> standalone start \
   --http-addr 0.0.0.0:4000 \
   --rpc-addr 0.0.0.0:4001 \
   --mysql-addr 0.0.0.0:4002 \
   --postgres-addr 0.0.0.0:4003
   ```

2. 将 Docker 版本升级到 v23.0.0 或更高;
   :::

## 下一步

学习如何使用 GreptimeDB 并使用 Grafana 可视化数据：[快速开始](../quick-start/overview.md)。
