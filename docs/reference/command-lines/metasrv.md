---
keywords: [GreptimeDB metasrv, command-line interface, metasrv configuration, metasrv startup, metasrv options, metasrv examples]
description: Command-line options and examples for starting GreptimeDB metasrv instances.
---

# Metasrv

## Subcommand options

Print the options supported by the current binary:

```
greptime metasrv start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | The configuration file for metasrv                                                                                                                                                                                                                                           |
| `--enable-region-failover <ENABLE_REGION_FAILOVER>` | Whether to enable region failover. Defaults to `false`. See [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md) for its prerequisites.                                                                                           |
| `--backend <BACKEND>`                 | Metadata store backend: `etcd-store`, `memory-store`, `postgres-store`, or `mysql-store`                                                                                                                                                                                       |
| `--data-home <DATA_HOME>`             | Working directory of this metasrv instance                                                                                                                                                                                                                                    |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_METASRV`                                                                                                                                                                                                         |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                          |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | Address advertised to Frontend, Datanode, and Flownode. When unset, GreptimeDB uses the first network interface address and the port from `grpc_bind_addr` |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                          |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                              |
| `--log-dir <LOG_DIR>`                 | Log directory                                                                                                                                                                                                                                                                |
| `--log-level <LOG_LEVEL>`             | Log level                                                                                                                                                                                                                                                                    |
| `--max-txn-ops <MAX_TXN_OPS>`         | Maximum number of operations in one transaction                                                                                                                                                                                                                               |
| `-s`/`--selector <SELECTOR>`          | Selector used for Region placement. See [Selector types](/contributor-guide/metasrv/selector.md#selector-type)                                                                                                                                                               |
| `--store-addrs <STORE_ADDRS>...`      | Metadata store addresses                                                                                                                                                                                                                                                      |
| `--store-key-prefix <STORE_KEY_PREFIX>` | Key prefix used in the metadata store                                                                                                                                                                                                                                       |

## Examples

### Start service with configurations

Start Metasrv from a configuration file:

```sh
greptime metasrv start -c config/metasrv.example.toml
```

The [`metasrv.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/main/config/metasrv.example.toml) file is in the GreptimeDB repository. The `-c` option selects the configuration file; see [Configuration](/user-guide/deployments-administration/configuration.md).
