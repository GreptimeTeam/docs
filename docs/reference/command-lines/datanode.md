---
keywords: [GreptimeDB datanode, command-line interface, datanode configuration, datanode startup, datanode options, datanode examples]
description: Comprehensive guide to GreptimeDB datanode command-line interface, including configuration options, startup commands, and practical examples for deploying and managing datanode instances.
---

# Datanode

## Subcommand options

You can list all the options from the following command:

```
greptime datanode start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | The configuration file for datanode                                                                                                                                                                                                                                           |
| `--data-home`                         | Database storage root directory                                                                                                                                                                                                                                               |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_DATANODE`                                                                                                                                                                                                         |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                           |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                               |
| `--metasrv-addrs <METASRV_ADDR>`      | Metasrv address list                                                                                                                                                                                                                                                          |
| `--node-id <NODE_ID>`                 | The datanode ID                                                                                                                                                                                                                                                               |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                           |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr` |
| `--wal-dir <WAL_DIR>`                 | The directory of WAL                                                                                                                                                                                                                                                          |

All the `addr` options are in the form of `ip:port`.

## Examples

### Start service with configurations

Starts a datanode instance with customized configurations:

```sh
greptime datanode start -c config/datanode.example.toml
```

Starts a datanode instance with command line arguments specifying the gRPC service address, the MySQL service address, the address of the metasrv, and the node id of the instance:

```sh
greptime datanode start --rpc-bind-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```