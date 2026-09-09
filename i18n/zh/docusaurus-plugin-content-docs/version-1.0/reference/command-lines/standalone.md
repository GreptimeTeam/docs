---
keywords: [GreptimeDB standalone, 命令行界面, standalone 配置, standalone 启动, standalone 选项, standalone 示例]
description: 以 standalone 模式启动 GreptimeDB 的命令行选项和示例。
---

# Standalone

## 子命令选项

运行以下命令查看当前二进制支持的选项：


```
greptime standalone start --help
```
| Option                            | Description                                       |
| --------------------------------- | ------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>` | Standalone 的配置文件                            |
| `--data-home <DATA_HOME>`         | Standalone 实例的工作目录                         |
| `--env-prefix <ENV_PREFIX>`       | 配置的环境变量前缀，默认为`GREPTIMEDB_STANDALONE` |
| `--http-addr <HTTP_ADDR>`         | HTTP 服务器地址                                   |
| `-i`/`--influxdb-enable`          | 是否启用 InfluxDB 协议                            |
| `--log-dir <LOG_DIR>`             | 日志目录                                          |
| `--log-level <LOG_LEVEL>`         | 日志级别                                          |
| `--mysql-addr <MYSQL_ADDR>`       | MySQL 服务器地址                                  |
| `--postgres-addr <POSTGRES_ADDR>` | Postgres 服务器地址                               |
| `--rpc-bind-addr <RPC_BIND_ADDR>` | gRPC 服务绑定地址                                 |
| `--tls-mode <TLS_MODE>`           | TLS 模式                                          |
| `--tls-cert-path <TLS_CERT_PATH>` | TLS 证书文件                                      |
| `--tls-key-path <TLS_KEY_PATH>`   | TLS 私钥文件                                      |
| `--tls-watch`                     | 监视 TLS 证书文件并在文件变化时重新加载           |
| `--user-provider <USER_PROVIDER>` | 认证提供者配置，参见[认证](/user-guide/deployments-administration/authentication/overview.md) |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## 示例

### 使用配置启动服务

使用配置文件以 Standalone 模式启动 GreptimeDB：

```sh
greptime --log-dir=greptimedb_data/logs --log-level=info standalone start -c config/standalone.example.toml
```

[`standalone.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/v1.0.2/config/standalone.example.toml) 位于 GreptimeDB 仓库中。`-c` 选项用于选择配置文件，详见[配置](/user-guide/deployments-administration/configuration.md)。
