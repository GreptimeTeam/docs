---
keywords: [GreptimeDB flownode, 命令行界面, flownode 配置, flownode 启动, flownode 选项, flownode 示例]
description: GreptimeDB flownode 命令行界面完整指南，包括配置选项、启动命令以及部署 flownode 实例的实用示例。
---

# Flownode

## 子命令选项

你可以通过以下命令列出所有选项：

```
greptime flownode start --help
```
| Option                                | Description                                                                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | Flownode 的配置文件                                                                                                                             |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_FLOWNODE`                                                                                                 |
| `--metasrv-addrs <METASRV_ADDRS>...`  | etasrv 服务器列表，用逗号或者空格隔开                                                                                                           |
| `--node-id <NODE_ID>`                 | 节点 ID                                                                                                                                         |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                               |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | 该地址用于来自主机外部的连接和通信。如果留空或未设置，服务器将自动使用主机上第一个网络接口的 IP 地址，其端口号与 `rpc_bind_addr` 中指定的相同； |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## Examples

### 使用配置启动服务

使用自定义配置启动 Flownode 实例：

```sh
greptime flownode start -c config/flownode.example.toml
```


使用命令行参数启动 Flownode，指定 gRPC 服务地址、Metasrv 地址：

```sh
greptime flownode start --node-id=0 --rpc-bind-addr=127.0.0.1:6800 --metasrv-addrs=127.0.0.1:3002
```

`flownode.example.toml` 配置文件来自 `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` 仓库的 `config` 目录。你可以在那里找到更多示例配置文件。`-c` 选项指定配置文件，更多信息请参考 [Configuration](/user-guide/deployments-administration/configuration.md)。