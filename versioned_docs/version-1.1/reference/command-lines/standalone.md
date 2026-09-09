---
keywords: [GreptimeDB standalone, command-line interface, standalone configuration, standalone startup, standalone options, standalone examples]
description: Command-line options and examples for starting GreptimeDB in standalone mode.
---

# Standalone

## Subcommand options

Print the options supported by the current binary:


```
greptime standalone start --help
```
| Option                            | Description                                                             |
| --------------------------------- | ----------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>` | The configuration file for the standalone instance                     |
| `--data-home <DATA_HOME>`         | Working directory of the standalone instance                            |
| `--env-prefix <ENV_PREFIX>`       | The prefix of environment variables, default is `GREPTIMEDB_STANDALONE` |
| `--http-addr <HTTP_ADDR>`         | HTTP server address                                                     |
| `-i`/`--influxdb-enable`          | Whether to enable InfluxDB protocol in HTTP API                         |
| `--log-dir <LOG_DIR>`             | Log directory                                                           |
| `--log-level <LOG_LEVEL>`         | Log level                                                               |
| `--mysql-addr <MYSQL_ADDR>`       | MySQL server address                                                    |
| `--postgres-addr <POSTGRES_ADDR>` | Postgres server address                                                 |
| `--grpc-bind-addr <GRPC_BIND_ADDR>` | The address to bind the gRPC server                                     |
| `--tls-mode <TLS_MODE>`           | TLS mode                                                                |
| `--tls-cert-path <TLS_CERT_PATH>` | TLS certificate file                                                    |
| `--tls-key-path <TLS_KEY_PATH>`   | TLS private key file                                                    |
| `--tls-watch`                     | Watch TLS certificate files and reload them when they change            |
| `--user-provider <USER_PROVIDER>` | Authentication provider configuration. See [Authentication](/user-guide/deployments-administration/authentication/overview.md) |

## Examples

### Start standalone with configurations

Start GreptimeDB in standalone mode from a configuration file:

```sh
greptime --log-dir=greptimedb_data/logs --log-level=info standalone start -c config/standalone.example.toml
```

The [`standalone.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/v1.1.4/config/standalone.example.toml) file is in the GreptimeDB repository. The `-c` option selects the configuration file; see [Configuration](/user-guide/deployments-administration/configuration.md).
