---
keywords: [GreptimeDB CLI, command-line interface, installation, starting services, upgrading versions]
description: Overview of the GreptimeDB command-line interface, including installation, available commands, options, and examples for starting services and upgrading versions.
---

# Greptime Command Line Interface

The `greptime` command can start/stop GreptimeDB and pass configuration options. 

## Install the Greptime CLI

The Greptime CLI comes bundled with the GreptimeDB binary.
After [installing GreptimeDB](/getting-started/installation/overview.md),
you can execute the `./greptime` command within the GreptimeDB directory.

For convenience, if you wish to run commands using `greptime` instead of `./greptime`,
consider moving the CLI binary to your system's `bin` directory or appending the binary's path to your `PATH` environment variable.

## CLI Options

The `help` command lists all available commands and options of `greptime`.

```sh
$ greptime help
Usage: greptime [OPTIONS] <COMMAND>

Commands:
  datanode    Start datanode service
  flownode    Start flownode service
  frontend    Start frontend service
  metasrv     Start metasrv service
  standalone  Run greptimedb as a standalone service
  cli         Execute the cli tools for greptimedb
  help        Print this message or the help of the given subcommand(s)


Options:
      --log-dir <LOG_DIR>
      --log-level <LOG_LEVEL>
  -h, --help                   Print help
  -V, --version                Print version
```

- `--log-dir=[dir]` specify logs directory, `./greptimedb_data/logs` by default.
- `--log-level=[info | debug | error | warn | trace]` specify the log level, `info` by default.

### Global options

- `-h`/`--help`: Print help information;
- `-V`/`--version`: Print version information;
- `--log-dir <LOG_DIR>`: The logging directory;
- `--log-level <LOG_LEVEL>`: The logging level;

### Datanode subcommand options

You can list all the options from the following command:

```
greptime datanode start --help
```

- `-c`/`--config-file`: The configuration file for datanode;
- `--data-home`: Database storage root directory;
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_DATANODE`;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds;
- `--metasrv-addrs <METASRV_ADDR>`: Metasrv address list;
- `--node-id <NODE_ID>`: The datanode ID;
- `--rpc-bind-addr <RPC_BIND_ADDR>`: The address to bind the gRPC server;
- `--rpc-server-addr <RPC_SERVER_ADDR>`: The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr`;
- `--wal-dir <WAL_DIR>`: The directory of WAL;

All the `addr` options are in the form of `ip:port`.

### Metasrv subcommand options

You can list all the options from the following command:

```
greptime metasrv start --help
```

- `-c`/`--config-file`: The configuration file for metasrv;
- `--enable-region-failover`: Whether to enable region failover, default is `false`.
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_METASRV`;
- `--rpc-bind-addr <RPC_BIND_ADDR>`: The address to bind the gRPC server;
- `--rpc-server-addr <RPC_SERVER_ADDR>`: The communication server address for the frontend and datanode to connect to metasrv. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr`;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds;
- `--selector <SELECTOR>`: You can refer [selector-type](/contributor-guide/metasrv/selector.md#selector-type);
- `--store-addrs <STORE_ADDR>`: Comma or space separated key-value storage server (default is etcd) address, used for storing metadata;
- `--use-memory-store`: Use memory store instead of etcd, for test purpose only;

### Frontend subcommand options

You can list all the options from the following command:

```
greptime frontend start --help
```

- `-c`/`--config-file`: The configuration file for frontend;
- `--disable-dashboard`: Disable dashboard http service, default is `false`.
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_FRONTEND`;
- `--rpc-bind-addr <RPC_BIND_ADDR>`: The address to bind the gRPC server;
- `--rpc-server-addr <RPC_SERVER_ADDR>`: The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr`;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--influxdb-enable`: Whether to enable InfluxDB protocol in HTTP API;
- `--metasrv-addrs <METASRV_ADDR>`: Metasrv address list;
- `--mysql-addr <MYSQL_ADDR>`: MySQL server address;
- `--postgres-addr <POSTGRES_ADDR>`: Postgres server address;
- `--tls-cert-path <TLS_CERT_PATH>`: The TLS public key file path;
- `--tls-key-path <TLS_KEY_PATH>`: The TLS private key file path;
- `--tls-mode <TLS_MODE>`: TLS Mode;
- `--user-provider <USER_PROVIDER>`: You can refer [authentication](/user-guide/deployments-administration/authentication/overview.md);

### Flownode subcommand options

You can list all the options from the following command:

```
greptime flownode start --help
```

- `--node-id <NODE_ID>`: Flownode's id
- `--rpc-bind-addr <RPC_BIND_ADDR>`: The address to bind the gRPC server;
- `--rpc-server-addr <RPC_SERVER_ADDR>`: The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `rpc_bind_addr`;
- `--metasrv-addrs <METASRV_ADDRS>...`: Metasrv address list
- `-c, --config-file <CONFIG_FILE>`: The configuration file for the flownode
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_FLOWNODE`

### Standalone subcommand options

You can list all the options from the following command:


```
greptime standalone start --help
```

- `-c`/`--config-file`: The configuration file for frontend;
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_STANDALONE`;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--influxdb-enable`: Whether to enable InfluxDB protocol in HTTP API;
- `--mysql-addr <MYSQL_ADDR>`: MySQL server address;
- `--postgres-addr <POSTGRES_ADDR>`: Postgres server address;
- `--rpc-bind-addr <RPC_BIND_ADDR>`: The address to bind the gRPC server;

## Examples

### Start service with configurations

Starts GreptimeDB in standalone mode with customized configurations:

```sh
greptime --log-dir=greptimedb_data/logs --log-level=info standalone start -c config/standalone.example.toml
```

The `standalone.example.toml` configuration file comes from the `config` directory of the `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` repository. You can find more example configuration files there. The `-c` option specifies the configuration file, for more information check [Configuration](../user-guide/deployments-administration/configuration.md).

To start GreptimeDB in distributed mode, you need to start each component separately. The following commands show how to start each component with customized configurations or command line arguments.

Starts a metasrv with customized configurations:

```sh
greptime metasrv start -c config/metasrv.example.toml
```

Starts a datanode instance with customized configurations:

```sh
greptime datanode start -c config/datanode.example.toml
```

Starts a datanode instance with command line arguments specifying the gRPC service address, the MySQL service address, the address of the metasrv, and the node id of the instance:

```sh
greptime datanode start --rpc-bind-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```

Starts a frontend instance with customized configurations:

```sh
greptime frontend start -c config/frontend.example.toml
```

Starts a frontend instance with command line arguments specifying the address of the metasrv:

```sh
greptime frontend start --metasrv-addrs=0.0.0.0:3002
```

Starts a flownode instance with customized configurations:

```sh
greptime flownode start -c config/flownode.example.toml
```

Starts a flownode instance with command line arguments specifying the address of the metasrv:

```sh
greptime flownode start --node-id=0 --rpc-bind-addr=127.0.0.1:6800 --metasrv-addrs=127.0.0.1:3002
```

### Upgrade GreptimeDB version

Please refer to [the upgrade steps](/user-guide/deployments-administration/upgrade.md)

