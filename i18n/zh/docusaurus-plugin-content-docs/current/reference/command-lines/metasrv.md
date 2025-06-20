---
keywords: [GreptimeDB metasrv, 命令行界面, metasrv 配置, metasrv 启动, metasrv 选项, metasrv 示例]
description: GreptimeDB metasrv 命令行界面完整指南，包括配置选项、启动命令以及部署和管理 metasrv 实例的实用示例。
---

# Metasrv

## 子命令选项

你可以通过以下命令列出所有选项：

```
greptime metasrv start --help
```

| Option                                | Description                                                                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | Metasrv 的配置文件                                                                                                                                 |
| `--enable-region-failover`            | 是否启用 Region 自动容灾，默认是 `false`。开启条件请参考：[Region 自动容灾](/user-guide/deployments-administration/manage-data/region-failover.md) |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_METASRV`                                                                                                     |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                                  |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | 该地址用于来自主机外部的连接和通信。如果留空或未设置，服务器将自动使用主机上第一个网络接口的 IP 地址，其端口号与 `rpc_bind_addr` 中指定的相同；    |
| `--http-addr <HTTP_ADDR>`             | HTTP 服务器地址                                                                                                                                    |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 请求超时时间（秒）                                                                                                                            |
| `--selector <SELECTOR>`               | 您可以参考 [selector-type](/contributor-guide/metasrv/selector.md#selector-type)                                                                   |
| `--store-addrs <STORE_ADDR>`          | 逗号或空格分隔的键值存储服务器（默认是 etcd）地址，用于存储元数据                                                                                  |
| `--use-memory-store`                  | 用内存存储而不是其他持久化的存储后端，仅用于测试目的的                                                                                             |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## 示例

### 使用配置启动服务

使用自定义配置启动 Metasrv 实例：

```sh
greptime metasrv start -c config/metasrv.example.toml
```

`metasrv.example.toml` 配置文件来自 `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` 仓库的 `config` 目录。你可以在那里找到更多示例配置文件。`-c` 选项指定配置文件，更多信息请参考 [Configuration](/user-guide/deployments-administration/configuration.md)。