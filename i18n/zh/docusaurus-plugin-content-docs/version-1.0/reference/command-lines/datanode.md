---
keywords: [GreptimeDB datanode, 命令行界面, datanode 配置, datanode 启动, datanode 选项, datanode 示例]
description: GreptimeDB datanode 命令行界面完整指南，包括配置选项、启动命令以及部署 datanode 实例的实用示例。
---

# Datanode

`greptime datanode` 命令提供了用于管理和基准测试 datanode 实例的子命令。

## start

启动 datanode 服务。

### 选项

你可以通过以下命令列出所有选项：

```
greptime datanode start --help
```

| 选项                                  | 描述                                                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | Datanode 的配置文件                                                                                                                    |
| `--data-home`                         | 数据库存储 home 目录                                                                                                                            |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_DATANODE`                                                                                                 |
| `--http-addr <HTTP_ADDR>`             | HTTP 服务器地址                                                                                                                                 |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 超时设置，单位秒                                                                                                                           |
| `--metasrv-addrs <METASRV_ADDR>`      | Metasrv 服务器列表，用逗号或者空格隔开                                                                                                          |
| `--node-id <NODE_ID>`                 | 节点 ID                                                                                                                                         |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | gRPC 服务绑定地址址                                                                                                                             |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | 该地址用于来自主机外部的连接和通信。如果留空或未设置，服务器将自动使用主机上第一个网络接口的 IP 地址，其端口号与 `rpc_bind_addr` 中指定的相同； |
| `--wal-dir <WAL_DIR>`                 | WAL 目录                                                                                                                                        |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

### 示例

#### 使用配置启动服务

使用自定义配置启动 Datanode 实例：

```sh
greptime datanode start -c config/datanode.example.toml
```

使用命令行参数启动 Datanode，指定 gRPC 服务地址、MySQL 服务地址、Metasrv 地址和该 Datanode 的 ID：

```sh
greptime datanode start --rpc-bind-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```

`datanode.example.toml` 配置文件来自 `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` 仓库的 `config` 目录。你可以在那里找到更多示例配置文件。`-c` 选项指定配置文件，更多信息请参考 [Configuration](/user-guide/deployments-administration/configuration.md)。

## objbench

`objbench` 子命令是一个用于测量对象存储上特定文件读写性能的基准测试工具。这对于诊断性能问题和测试存储层性能非常有用。

### 选项

| 选项                           | 描述                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `--config <FILE>`              | datanode 配置文件路径（TOML 格式）                                                                   |
| `--source <PATH>`              | 对象存储中的源 SST 文件路径（例如 `data/greptime/public/1024/1024_0000000000/metadata/<uuid>.parquet`）|
| `-v`/`--verbose`               | 启用详细输出                                                                                         |
| `--pprof-file <FILE>`          | pprof 火焰图的输出文件路径（启用性能分析）。生成 SVG 格式的火焰图文件                                |

### 示例

#### 基础基准测试

测量特定文件的读写性能：

```sh
greptime datanode objbench --config ./datanode.toml --source data/greptime/public/1024/1024_0000000000/metadata/8fb41bc7-a106-4b9e-879b-392da799f958.parquet
```

#### 带性能分析的基准测试

测量性能并生成用于性能分析的火焰图：

```sh
greptime datanode objbench --config ./datanode.toml --source data/greptime/public/1024/1024_0000000000/metadata/8fb41bc7-a106-4b9e-879b-392da799f958.parquet --pprof-file=./flamegraph.svg
```

这将生成一个 SVG 格式的火焰图，可以在 Web 浏览器中打开进行性能分析。