---
keywords: [GreptimeDB standalone, 命令行界面, standalone 配置, standalone 启动, standalone 选项, standalone 示例]
description: GreptimeDB standalone 命令行界面完整指南，包括配置选项、启动命令以及部署 standalone 实例的实用示例。
---

# Standalone

## 子命令选项

您可以通过以下命令列出所有选项：


```
greptime standalone start --help
```
| Option                            | Description                                                             |
| --------------------------------- | ----------------------------------------------------------------------- |
| `-c`/`--config-file`              | Standalone 的配置文件                                                   |
| `--env-prefix <ENV_PREFIX>`       | 配置的环境变量前缀，默认为`GREPTIMEDB_STANDALONE`                       |
| `--http-addr <HTTP_ADDR>`         | HTTP 服务器地址                                                         |
| `--influxdb-enable`               | 是否启用 InfluxDB 协议                                                   |
| `--mysql-addr <MYSQL_ADDR>`       | MySQL 服务器地址                                                         |
| `--postgres-addr <POSTGRES_ADDR>` | Postgres 服务器地址                                                      |
| `--rpc-bind-addr <RPC_BIND_ADDR>` | gRPC 服务绑定地址                                                       |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## 示例

### 使用配置启动服务

使用自定义配置启动 Standalone 实例：

```sh
greptime --log-dir=greptimedb_data/logs --log-level=info standalone start -c config/standalone.example.toml
```

`standalone.example.toml` 配置文件来自 `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` 仓库的 `config` 目录。您可以在那里找到更多示例配置文件。`-c` 选项指定配置文件，更多信息请参考 [Configuration](/user-guide/deployments-administration/configuration.md)。

要启动 GreptimeDB 分布式模式，您需要分别启动每个组件。以下命令展示了如何使用自定义配置或命令行参数启动每个组件。