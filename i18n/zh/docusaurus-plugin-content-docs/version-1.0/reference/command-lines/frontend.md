---
keywords: [GreptimeDB frontend, 命令行界面, frontend 配置, frontend 启动, frontend 选项, frontend 示例]
description: 启动 GreptimeDB frontend 实例的命令行选项和示例。
---

# Frontend

## 子命令选项

运行以下命令查看当前二进制支持的选项：

```
greptime frontend start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | Frontend 的配置文件                                                                                                                                                                                                                                                           |
| `--disable-dashboard <DISABLE_DASHBOARD>` | 是否禁用 Dashboard HTTP 服务，默认为 `false`                                                                                                                                                                                                                               |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_FRONTEND`                                                                                                                                                                                                                               |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                                                                                                                                                             |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | 向 Metasrv 公布、供主机外部连接的地址。未设置时，GreptimeDB 使用第一个网络接口的 IP 地址和 `rpc_bind_addr` 中的端口 |
| `--internal-rpc-bind-addr <INTERNAL_RPC_BIND_ADDR>` | internal gRPC 服务绑定地址 |
| `--internal-rpc-server-addr <INTERNAL_RPC_SERVER_ADDR>` | 向 Metasrv 公布的 internal gRPC 服务地址。未设置时，GreptimeDB 使用第一个网络接口的 IP 地址和 `internal_rpc_bind_addr` 中的端口 |
| `--http-addr <HTTP_ADDR>`             | HTTP 服务器地址 |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 请求超时时间（秒）                                                                                                                                                                                                                                                       |
| `-i`/`--influxdb-enable <INFLUXDB_ENABLE>` | 是否在 HTTP API 中启用 InfluxDB 协议                                                                                                                                                                                                                                   |
| `--log-dir <LOG_DIR>`                 | 日志目录                                                                                                                                                                                                                                                                      |
| `--log-level <LOG_LEVEL>`             | 日志级别                                                                                                                                                                                                                                                                      |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv 服务器列表                                                                                                                                |
| `--mysql-addr <MYSQL_ADDR>`           | MySQL 服务器地址                                                                                                                                                                                                                                                             |
| `--postgres-addr <POSTGRES_ADDR>`     | Postgres 服务器地址                                                                                                                                                                                                                                                          |
| `--tls-cert-path <TLS_CERT_PATH>`     | TLS 公钥文件路径                                                                                                                                                                                                                                                             |
| `--tls-key-path <TLS_KEY_PATH>`       | TLS 私钥文件路径                                                                                                                                                                                                                                                             |
| `--tls-mode <TLS_MODE>`               | TLS 模式                                                                                                                                                                                                                                                                      |
| `--tls-watch`                         | 监视 TLS 证书文件并在文件变化时重新加载                                                                                                                                                                                                                                        |
| `--user-provider <USER_PROVIDER>`     | 认证提供者配置，参见[认证](/user-guide/deployments-administration/authentication/overview.md)                                                                                                                                                                                 |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## Examples

### 使用配置启动服务

使用配置文件启动 Frontend 实例：

```sh
greptime frontend start -c config/frontend.example.toml
```

使用命令行参数指定 Metasrv 地址：

```sh
greptime frontend start --metasrv-addrs=0.0.0.0:3002
```

[`frontend.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/v1.0.2/config/frontend.example.toml) 位于 GreptimeDB 仓库中。`-c` 选项用于选择配置文件，详见[配置](/user-guide/deployments-administration/configuration.md)。
