# 命令行工具

预构建二进制文件中的命令行 `greptime` 可以启动/停止 GreptimeDB 并传递配置选项。

`help` 列出了 `greptime` 的所有命令和选项。

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


以独立模式启动 GreptimeDB：

```sh
greptime --log-dir=/tmp/greptimedb/logs --log-level=info standalone start -c  config/standalone.example.toml
```

`-c` 指定配置文件，更多信息请查看[配置](/user-guide/operations/configuration.md)。

启动 meta server:

```sh
greptime metasrv start -c config/metasrv.example.toml
```

使用配置文件启动 datanode 实例：

```sh
greptime datanode start -c config/datanode.example.toml
```

使用命令行参数启动 datanode 实例：

```sh
greptime datanode start --rpc-addr=0.0.0.0:4100 --mysql-addr=0.0.0.0:4102 --metasrv-addr=0.0.0.0:3002 --node-id=1
```

使用配置文件启动 frontend 实例：

```sh
greptime frontend start -c config/frontend.example.toml
```

使用命令行参数启动 frontend 实例：

```sh
greptime frontend start --metasrv-addr=0.0.0.0:3002
```
