# Command lines

The `greptime` command provided by the pre-built binary can start/stop GreptimeDB and pass configuration options. To execute the binary with `greptime` instead of the ad-hoc `./greptime`, you might need to move the binary into the system `bin` directory or add the binary path to the `PATH` environment variable.

The `help` command lists all available commands and options of `greptime`.

```sh
$ greptime help
greptimedb
branch:  ...
commit:  ...
dirty:   ...
version: ...

USAGE:
    greptime [OPTIONS] <SUBCOMMAND>

OPTIONS:
    -h, --help                     Print help information
        --log-dir <LOG_DIR>
        --log-level <LOG_LEVEL>
    -V, --version                  Print version information

SUBCOMMANDS:
    cli
    datanode
    frontend
    help          Print this message or the help of the given subcommand(s)
    metasrv
    standalone
```

- `--log-dir=[dir]` specify logs directory, `/tmp/greptimedb/logs` by default.
- `--log-level=[info | debug | error | warn | trace]` specify the log level, `info` by default.

Starts GreptimeDB in standalone mode with customized configurations:

```sh
greptime --log-dir=/tmp/greptimedb/logs --log-level=info standalone start -c config/standalone.example.toml
```

The `standalone.example.toml` configuration file comes from the `config` directory of the `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` repository. You can find more example configuration files there. The `-c` option specifies the configuration file, for more information check [Configuration](../user-guide/operations/configuration.md).

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
greptime datanode start --rpc-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addr=0.0.0.0:3002 --node-id=1
```

Starts a frontend instance with customized configurations:

```sh
greptime frontend start -c config/frontend.example.toml
```

Starts a frontend instance with command line arguments specifying the address of the metasrv:

```sh
greptime frontend start --metasrv-addr=0.0.0.0:3002
```
