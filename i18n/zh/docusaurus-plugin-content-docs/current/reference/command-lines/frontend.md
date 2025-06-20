---
keywords: [GreptimeDB frontend, 命令行界面, frontend 配置, frontend 启动, frontend 选项, frontend 示例]
description: GreptimeDB frontend 命令行界面完整指南，包括配置选项、启动命令以及部署 frontend 实例的实用示例。
---

# Frontend

## 子命令选项

您可以通过以下命令列出所有选项：

```
greptime frontend start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | Frontend 的配置文件                                                                                                                                                                                                                                                           |
| `--disable-dashboard`                 | 禁用 dashboard http 服务，默认是 `false`                                                                                                                                                                                                                                      |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_FRONTEND`                                                                                                                                                                                                                               |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                                                                                                                                                             |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | 该地址用于来自主机外部的连接和通信。如果留空或未设置，服务器将自动使用主机上第一个网络接口的 IP 地址，其端口号与 `rpc_bind_addr` 中指定的相同； |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 请求超时时间（秒）                                                                                                                                                                                                                                                       |
| `--influxdb-enable`                   | 是否启用 InfluxDB 协议                                                                                                                                                                                                                                                         |
| `--metasrv-addrs <METASRV_ADDR>`      | Metasrv 服务器列表，用逗号或者空格隔开                                                                                                            |
| `--mysql-addr <MYSQL_ADDR>`           | MySQL 服务器地址                                                                                                                                                                                                                                                             |
| `--postgres-addr <POSTGRES_ADDR>`     | Postgres 服务器地址                                                                                                                                                                                                                                                          |
| `--tls-cert-path <TLS_CERT_PATH>`     | TLS 公钥文件路径                                                                                                                                                                                                                                                             |
| `--tls-key-path <TLS_KEY_PATH>`       | TLS 私钥文件路径                                                                                                                                                                                                                                                             |
| `--tls-mode <TLS_MODE>`               | TLS 模式                                                                                                                                                                                                                                                                      |
| `--user-provider <USER_PROVIDER>`     | 您可以参考 [authentication](/user-guide/deployments-administration/authentication/overview.md)                                                                                                                                                                             |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

## Examples

### 使用配置启动服务

使用自定义配置启动 Frontend 实例：

```sh
greptime frontend start -c config/frontend.example.toml
```

使用命令行参数启动 Frontend，指定 Metasrv 地址：

```sh
greptime frontend start --metasrv-addrs=0.0.0.0:3002
```