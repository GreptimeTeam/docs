---
keywords: [GreptimeDB frontend, command-line interface, frontend configuration, frontend startup, frontend options, frontend examples]
description: Comprehensive guide to GreptimeDB frontend command-line interface, including configuration options, startup commands, and practical examples for deploying frontend instances.
---

# Frontend

## Subcommand options


You can list all the options from the following command:

```
greptime frontend start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | The configuration file for frontend                                                                                                                                                                                                                                           |
| `--disable-dashboard`                 | Disable dashboard http service, default is `false`                                                                                                                                                                                                                            |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_FRONTEND`                                                                                                                                                                                                         |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                                         |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `grpc_bind_addr` |
| `--internal-grpc-bind-addr <INTERNAL_GRPC_BIND_ADDR>` | The address to bind the internal gRPC server                                                                                                                                                                                                                                           |
| `--internal-grpc-server-addr <INTERNAL_GRPC_SERVER_ADDR>` | The address advertised to the metasrv for the internal gRPC server, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `internal_grpc_bind_addr` |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                               |
| `--influxdb-enable`                   | Whether to enable InfluxDB protocol in HTTP API                                                                                                                                                                                                                               |
| `--metasrv-addrs <METASRV_ADDR>`      | Metasrv address list                                                                                                                                                                                                                                                          |
| `--mysql-addr <MYSQL_ADDR>`           | MySQL server address                                                                                                                                                                                                                                                          |
| `--postgres-addr <POSTGRES_ADDR>`     | Postgres server address                                                                                                                                                                                                                                                       |
| `--tls-cert-path <TLS_CERT_PATH>`     | The TLS public key file path                                                                                                                                                                                                                                                  |
| `--tls-key-path <TLS_KEY_PATH>`       | The TLS private key file path                                                                                                                                                                                                                                                 |
| `--tls-mode <TLS_MODE>`               | TLS Mode                                                                                                                                                                                                                                                                      |
| `--user-provider <USER_PROVIDER>`     | You can refer [authentication](/user-guide/deployments-administration/authentication/overview.md)                                                                                                                                                                             |

## Examples

### Start service with configurations

Starts a frontend instance with customized configurations:

```sh
greptime frontend start -c config/frontend.example.toml
```

Starts a frontend instance with command line arguments specifying the address of the metasrv:

```sh
greptime frontend start --metasrv-addrs=0.0.0.0:3002
```

The `frontend.example.toml` configuration file comes from the `config` directory of the `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` repository. You can find more example configuration files there. The `-c` option specifies the configuration file, for more information check [Configuration](/user-guide/deployments-administration/configuration.md).
