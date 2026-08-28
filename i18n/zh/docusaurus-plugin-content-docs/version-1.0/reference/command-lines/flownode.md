---
keywords: [GreptimeDB flownode, 命令行界面, flownode 配置, flownode 启动, flownode 选项, flownode 示例]
description: 介绍 GreptimeDB Flownode 的命令行选项和启动示例。
---

# Flownode

## 子命令选项

通过以下命令查看当前二进制支持的选项：

```
greptime flownode start --help
```
| Option                                | Description                                                                                                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | Flownode 配置文件                                                                                                                               |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_FLOWNODE`                                                                                                 |
| `--http-addr <HTTP_ADDR>`             | HTTP 服务器地址                                                                                                                                 |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 请求超时时间（秒）                                                                                                                         |
| `--log-dir <LOG_DIR>`                 | 日志目录                                                                                                                                        |
| `--log-level <LOG_LEVEL>`             | 日志级别                                                                                                                                        |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv 服务器列表                                                                                                                              |
| `--node-id <NODE_ID>`                 | 节点 ID                                                                                                                                         |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                               |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | 向 Metasrv 公布、供主机外部连接的地址。未设置时，GreptimeDB 使用第一个网络接口的 IP 地址和 `rpc_bind_addr` 中的端口 |

:::note
如果在启用了 Frontend 认证的集群中单独部署 Flownode，请为 Frontend 配置 internal gRPC 地址。
你可以通过 Frontend 的 `internal_grpc` 配置项，或者 `--internal-rpc-bind-addr` 和 `--internal-rpc-server-addr` 命令行选项来配置。
Flownode 会使用从 Metasrv 发现的 Frontend 地址发起连接，且不会携带认证信息。因此，它应访问 Frontend 的 internal gRPC 服务，而不是需要认证的公开 gRPC 服务。
:::

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## Examples

### 使用配置启动服务

使用配置文件启动 Flownode：

```sh
greptime flownode start -c config/flownode.example.toml
```


通过命令行指定节点 ID、gRPC 地址和 Metasrv 地址：

```sh
greptime flownode start --node-id=0 --rpc-bind-addr=127.0.0.1:6800 --metasrv-addrs=127.0.0.1:3002
```

[`flownode.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/v1.0.2/config/flownode.example.toml) 位于 GreptimeDB 仓库中。`-c` 选项用于选择配置文件，详见[配置](/user-guide/deployments-administration/configuration.md)。
