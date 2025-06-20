---
keywords: [GreptimeDB standalone, command-line interface, standalone configuration, standalone startup, standalone options, standalone examples]
description: Comprehensive guide to GreptimeDB standalone command-line interface, including configuration options, startup commands, and practical examples for deploying standalone instances.
---

# Standalone

## Subcommand options

You can list all the options from the following command:


```
greptime standalone start --help
```
| Option                            | Description                                                             |
| --------------------------------- | ----------------------------------------------------------------------- |
| `-c`/`--config-file`              | The configuration file for frontend                                     |
| `--env-prefix <ENV_PREFIX>`       | The prefix of environment variables, default is `GREPTIMEDB_STANDALONE` |
| `--http-addr <HTTP_ADDR>`         | HTTP server address                                                     |
| `--influxdb-enable`               | Whether to enable InfluxDB protocol in HTTP API                         |
| `--mysql-addr <MYSQL_ADDR>`       | MySQL server address                                                    |
| `--postgres-addr <POSTGRES_ADDR>` | Postgres server address                                                 |
| `--rpc-bind-addr <RPC_BIND_ADDR>` | The address to bind the gRPC server                                     |

## Examples

### Start standalone with configurations

Starts GreptimeDB in standalone mode with customized configurations:

```sh
greptime --log-dir=greptimedb_data/logs --log-level=info standalone start -c config/standalone.example.toml
```

The `standalone.example.toml` configuration file comes from the `config` directory of the `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` repository. You can find more example configuration files there. The `-c` option specifies the configuration file, for more information check [Configuration](/user-guide/deployments-administration/configuration.md).