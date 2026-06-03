---
keywords: [GreptimeDB flownode, command-line interface, flownode configuration, flownode startup, flownode options, flownode examples]
description: Comprehensive guide to GreptimeDB flownode command-line interface, including configuration options, startup commands, and practical examples for deploying flownode instances.
---

# Flownode

## Subcommand options

You can list all the options from the following command:

```
greptime flownode start --help
```
| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | The configuration file for flownode                                                                                                                                                                                                                                           |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_FLOWNODE`                                                                                                                                                                                                         |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv address list                                                                                                                                                                                                                                                          |
| `--node-id <NODE_ID>`                 | Flownode's id                                                                                                                                                                                                                                                                 |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                           |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr` |

## Examples

### Start service with configurations

Starts a flownode instance with customized configurations:

```sh
greptime flownode start -c config/flownode.example.toml
```

Starts a flownode instance with command line arguments specifying the address of the metasrv:

```sh
greptime flownode start --node-id=0 --rpc-bind-addr=127.0.0.1:6800 --metasrv-addrs=127.0.0.1:3002
```

The `flownode.example.toml` configuration file comes from the `config` directory of the `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` repository. You can find more example configuration files there. The `-c` option specifies the configuration file, for more information check [Configuration](/user-guide/deployments-administration/configuration.md).