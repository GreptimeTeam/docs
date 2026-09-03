---
keywords: [GreptimeDB metasrv, 命令行界面, metasrv 配置, metasrv 启动, metasrv 选项, metasrv 示例]
description: 启动 GreptimeDB metasrv 实例的命令行选项和示例。
---

# Metasrv

## 子命令选项

运行以下命令查看当前二进制支持的选项：

```
greptime metasrv start --help
```

| Option                                | Description                                                                                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | Metasrv 的配置文件                                                                                                                                 |
| `--enable-region-failover <ENABLE_REGION_FAILOVER>` | 是否启用 Region 自动容灾，默认为 `false`。启用条件参见 [Region 自动容灾](/user-guide/deployments-administration/manage-data/region-failover.md) |
| `--backend <BACKEND>`                 | 元数据存储后端：`etcd-store`、`memory-store`、`postgres-store` 或 `mysql-store`                                                                    |
| `--data-home <DATA_HOME>`             | Metasrv 实例的工作目录                                                                                                                            |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_METASRV`                                                                                                     |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                                    |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | Metasrv 向 Frontend、Datanode 和 Flownode 公布的地址。未设置时，GreptimeDB 使用第一个网络接口的 IP 地址和 `grpc_bind_addr` 中的端口。    |
| `--http-addr <HTTP_ADDR>`             | HTTP 服务器地址                                                                                                                                    |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 请求超时时间（秒）                                                                                                                            |
| `--log-dir <LOG_DIR>`                 | 日志目录                                                                                                                                          |
| `--log-level <LOG_LEVEL>`             | 日志级别                                                                                                                                          |
| `--max-txn-ops <MAX_TXN_OPS>`         | 单个事务的最大操作数                                                                                                                               |
| `-s`/`--selector <SELECTOR>`          | Region 分配使用的 selector，参见 [Selector 类型](/contributor-guide/metasrv/selector.md#selector-type)                                             |
| `--store-addrs <STORE_ADDRS>...`      | 元数据存储地址                                                                                                                                     |
| `--store-key-prefix <STORE_KEY_PREFIX>` | 元数据存储使用的 key 前缀                                                                                                                        |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## 示例

### 使用配置启动服务

使用配置文件启动 Metasrv：

```sh
greptime metasrv start -c config/metasrv.example.toml
```

[`metasrv.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/main/config/metasrv.example.toml) 位于 GreptimeDB 仓库中。`-c` 选项用于选择配置文件，详见[配置](/user-guide/deployments-administration/configuration.md)。
