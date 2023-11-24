# 命令行工具

预构建二进制文件所提供的 `greptime` 命令可以启动、停止、或传递配置项给 GreptimeDB。为了使用 `greptime` 而不是 `./greptime` 命令，您可能需要将二进制文件移动到系统的 `bin` 文件夹，或者将二进制文件的路径添加到 `PATH` 环境变量。

`help` 命令列出了 `greptime` 所有可用的命令和选项。

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

使用自定义配置以 standalone 模式启动 GreptimeDB：

```sh
greptime --log-dir=/tmp/greptimedb/logs --log-level=info standalone start -c config/standalone.example.toml
```

`standalone.example.toml` 配置文件来自 `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` 仓库的 `config` 目录。您可以在那里找到更多示例配置文件。使用 `-c` 选项可以指定配置文件，有关更多信息，更多信息请查看[配置](../user-guide/operations/configuration.md)。

为了以分布式模式启动 GreptimeDB，您需要分别启动每个组件。以下命令显示了如何使用自定义配置或命令行参数启动每个组件：

使用自定义配置启动 metasrv：

```sh
greptime metasrv start -c config/metasrv.example.toml
```

使用自定义配置启动 datanode：

```sh
greptime datanode start -c config/datanode.example.toml
```

使用命令行参数启动 datanode，指定 gRPC 服务地址、MySQL 服务地址、metasrv 地址和该 datanode 的 ID：

```sh
greptime datanode start --rpc-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addr=0.0.0.0:3002 --node-id=1
```

使用自定义配置启动 frontend：

```sh
greptime frontend start -c config/frontend.example.toml
```

使用命令行参数启动 frontend，指定 metasrv 的地址：

```sh
greptime frontend start --metasrv-addr=0.0.0.0:3002
```
