---
keywords: [GreptimeDB metasrv, command-line interface, metasrv configuration, metasrv startup, metasrv options, metasrv examples]
description: Comprehensive guide to GreptimeDB metasrv command-line interface, including configuration options, startup commands, and practical examples for deploying and managing metasrv instances.
---

# Metasrv

## Subcommand options

You can list all the options from the following command:

```
greptime metasrv start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | The configuration file for metasrv                                                                                                                                                                                                                                           |
| `--enable-region-failover`            | Whether to enable region failover, default is `false`                                                                                                                                                                                                                        |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_METASRV`                                                                                                                                                                                                         |
| `--rpc-bind-addr <RPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                          |
| `--rpc-server-addr <RPC_SERVER_ADDR>` | The communication server address for the frontend and datanode to connect to metasrv. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr` |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                          |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                              |
| `--selector <SELECTOR>`               | You can refer [selector-type](/contributor-guide/metasrv/selector.md#selector-type)                                                                                                                                                                                          |
| `--store-addrs <STORE_ADDR>`          | Comma or space separated key-value storage server (default is etcd) address, used for storing metadata                                                                                                                                                                       |
| `--use-memory-store`                  | Use memory store instead of etcd, for test purpose only                                                                                                                                                                                                                      |

## Examples

### Start service with configurations

Starts a metasrv with customized configurations:

```sh
greptime metasrv start -c config/metasrv.example.toml
```
