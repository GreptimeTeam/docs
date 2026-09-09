---
keywords: [GreptimeDB frontend, command-line interface, frontend configuration, frontend startup, frontend options, frontend examples]
description: Command-line options and examples for starting GreptimeDB frontend instances.
---

# Frontend

## Subcommand options


Print the options supported by the current binary:

```
greptime frontend start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | The configuration file for frontend                                                                                                                                                                                                                                           |
| `--disable-dashboard <DISABLE_DASHBOARD>` | Whether to disable the dashboard HTTP service. Defaults to `false`                                                                                                                                                                                                         |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_FRONTEND`                                                                                                                                                                                                         |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                                         |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | Address advertised to Metasrv for connections from outside the host. When unset, GreptimeDB uses the first network interface address and the port from `grpc_bind_addr` |
| `--internal-grpc-bind-addr <INTERNAL_GRPC_BIND_ADDR>` | The address to bind the internal gRPC server                                                                                                                                                                                                                                           |
| `--internal-grpc-server-addr <INTERNAL_GRPC_SERVER_ADDR>` | Address advertised to Metasrv for external connections to the internal gRPC server. When unset, GreptimeDB uses the first network interface address and the port from `internal_grpc_bind_addr` |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                           |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                               |
| `-i`/`--influxdb-enable <INFLUXDB_ENABLE>` | Whether to enable the InfluxDB protocol in the HTTP API                                                                                                                                                                                                                 |
| `--log-dir <LOG_DIR>`                 | Log directory                                                                                                                                                                                                                                                                 |
| `--log-level <LOG_LEVEL>`             | Log level                                                                                                                                                                                                                                                                     |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv address list                                                                                                                                                                                                                                                          |
| `--mysql-addr <MYSQL_ADDR>`           | MySQL server address                                                                                                                                                                                                                                                          |
| `--postgres-addr <POSTGRES_ADDR>`     | Postgres server address                                                                                                                                                                                                                                                       |
| `--tls-cert-path <TLS_CERT_PATH>`     | The TLS public key file path                                                                                                                                                                                                                                                  |
| `--tls-key-path <TLS_KEY_PATH>`       | The TLS private key file path                                                                                                                                                                                                                                                 |
| `--tls-mode <TLS_MODE>`               | TLS mode                                                                                                                                                                                                                                                                      |
| `--tls-watch`                         | Watch the TLS certificate files and reload them when they change                                                                                                                                                                                                              |
| `--user-provider <USER_PROVIDER>`     | Authentication provider configuration. See [Authentication](/user-guide/deployments-administration/authentication/overview.md)                                                                                                                                               |

## Examples

### Start service with configurations

Start a Frontend instance from a configuration file:

```sh
greptime frontend start -c config/frontend.example.toml
```

Start a Frontend instance and specify the Metasrv address on the command line:

```sh
greptime frontend start --metasrv-addrs=0.0.0.0:3002
```

The [`frontend.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/v1.1.4/config/frontend.example.toml) file is in the GreptimeDB repository. The `-c` option selects the configuration file; see [Configuration](/user-guide/deployments-administration/configuration.md).
