---
keywords: [GreptimeDB flownode, command-line interface, flownode configuration, flownode startup, flownode options, flownode examples]
description: Describes the GreptimeDB Flownode command-line options and startup examples.
---

# Flownode

## Subcommand options

Print the options supported by the current binary:

```
greptime flownode start --help
```
| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | The configuration file for Flownode                                                                                                                                                                                                                                           |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_FLOWNODE`                                                                                                                                                                                                         |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                           |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                               |
| `--log-dir <LOG_DIR>`                 | Log directory                                                                                                                                                                                                                                                                 |
| `--log-level <LOG_LEVEL>`             | Log level                                                                                                                                                                                                                                                                     |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv address list                                                                                                                                                                                                                                                          |
| `--node-id <NODE_ID>`                 | Flownode's id                                                                                                                                                                                                                                                                 |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                           |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `grpc_bind_addr` |

:::note
When deploying a separate flownode in a cluster with frontend authentication enabled, configure the frontend internal gRPC endpoint.
You can use the frontend `internal_grpc` options or the `--internal-grpc-bind-addr` and `--internal-grpc-server-addr` command line options.
Flownode connects to frontends through addresses discovered from metasrv and does not send authentication headers, so it should access the frontend internal gRPC service instead of the public authenticated gRPC service.
:::

## Examples

### Start service with configurations

Start a Flownode instance from a configuration file:

```sh
greptime flownode start -c config/flownode.example.toml
```

Start a Flownode instance and specify its node ID, gRPC address, and Metasrv address on the command line:

```sh
greptime flownode start --node-id=0 --grpc-bind-addr=127.0.0.1:6800 --metasrv-addrs=127.0.0.1:3002
```

The [`flownode.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/v1.1.4/config/flownode.example.toml) file is in the GreptimeDB repository. The `-c` option selects the configuration file; see [Configuration](/user-guide/deployments-administration/configuration.md) for details.
