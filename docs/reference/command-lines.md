# Command lines

The command line `greptime` in pre-built binary can start/stop GreptimeDB and pass configuration options.


`help` lists all commands and options of the `greptime`.

```sh
$ greptime help
greptimedb

USAGE:
    greptime [OPTIONS] <SUBCOMMAND>

OPTIONS:
    -h, --help                     Print help information
        --log-dir <LOG_DIR>        [default: /tmp/greptimedb/logs]
        --log-level <LOG_LEVEL>    [default: info]

SUBCOMMANDS:
    datanode
    frontend
    help          Print this message or the help of the given subcommand(s)
    metasrv
    standalone
```

* `--log-dir=[dir]` specify logs directory, `/tmp/greptimedb/logs` by default.
* `--log-level=[info | debug | error | warn]` specify the log level, `info` by default.


Starts GreptimeDB in standalone mode:

```sh
greptime --log-dir=/tmp/greptimedb/logs --log-level=info standalone start -c  config/standalone.example.toml
```

`-c` specifies the configuration file, for more information check [Configuration](./configuration.md).

Starts a meta server:

```sh
greptime metasrv start -c config/metasrv.example.toml
```

Starts a datanode instance with a configuration file:

```sh
greptime datanode start -c config/datanode.example.toml
```

Starts a datanode instance with command line args:

```sh
greptime datanode start --rpc-addr=0.0.0.0:4100 --mysql-addr=0.0.0.0:4102 --metasrv-addr=0.0.0.0:3002 --node-id=1
```

Starts a frontend instance with a configuration file:

```sh
greptime frontend start -c config/frontend.example.toml
```

Starts a frontend instance with command line args:

```sh
greptime frontend start --metasrv-addr=0.0.0.0:3002
```
