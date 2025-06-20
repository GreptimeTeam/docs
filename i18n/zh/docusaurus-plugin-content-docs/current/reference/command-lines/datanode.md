---
keywords: [GreptimeDB datanode, 命令行界面, datanode 配置, datanode 启动, datanode 选项, datanode 示例]
description: GreptimeDB datanode 命令行界面完整指南，包括配置选项、启动命令以及部署 datanode 实例的实用示例。
---

# Datanode

## 子命令选项

您可以通过以下命令列出所有选项：

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


## 示例

### 使用配置启动服务

使用自定义配置启动 Datanode 实例：

```sh
greptime datanode start -c config/datanode.example.toml
```

使用命令行参数启动 Datanode，指定 gRPC 服务地址、MySQL 服务地址、Metasrv 地址和该 Datanode 的 ID：

```sh
greptime datanode start --rpc-bind-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```