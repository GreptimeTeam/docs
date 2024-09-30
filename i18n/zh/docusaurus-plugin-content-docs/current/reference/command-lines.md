# Greptime 命令行工具

`greptime` 命令行工具可以启动、停止、或传递配置项给 GreptimeDB。

## 安装命令行工具

Greptime 命令行工具与 GreptimeDB 二进制文件捆绑在一起。
在[安装 GreptimeDB](/getting-started/installation/overview.md)之后，
你可以在 GreptimeDB 的当前目录中执行 `./greptime` 命令。

为了方便起见，如果你希望使用 `greptime` 而不是 `./greptime` 来运行命令，
可以将命令行工具的二进制文件移动到系统的 `bin` 目录，或者将二进制文件的路径添加到 `PATH` 环境变量中。

## 选项

`help` 命令列出了 `greptime` 所有可用的命令和选项。

```sh
$ greptime help
Usage: greptime [OPTIONS] <COMMAND>

Commands:
  datanode    Start datanode service
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

- `--log-dir=[dir]` specify logs directory, `/tmp/greptimedb/logs` by default.
- `--log-level=[info | debug | error | warn | trace]` specify the log level, `info` by default.

### 全局选项

- `-h`/`--help`: 打印命令行帮助信息
- `-V`/`--version`: 打印 GreptimeDB 版本信息
- `--log-dir <LOG_DIR>`: 指定日志路径
- `--log-level <LOG_LEVEL>`: 指定日志级别，如 `info`、`debug` 等。

### datanode 子命令选项

通过执行下列命令来获取 `datanode` 子命令的帮助菜单：

```
greptime datanode start --help
```

- `-c`/`--config-file`:  指定 datanode 启动的配置文件
- `--data-home`: 数据库存储 home 目录
- `--env-prefix <ENV_PREFIX>`: 配置的环境变量前缀，默认为 `GREPTIMEDB_DATANODE`;
- `--http-addr <HTTP_ADDR>`:  HTTP 服务地址
- `--http-timeout <HTTP_TIMEOUT>`:  HTTP 超时设置，单位秒
- `--metasrv-addrs <METASRV_ADDR>`:  Metasrv 服务器列表，用逗号或者空格隔开
- `--node-id <NODE_ID>`: 节点 ID
- `--rpc-addr <RPC_ADDR>`:  gRPC 服务地址
- `--rpc-hostname <RPC_HOSTNAME>`:  节点 hostname
- `--wal-dir <WAL_DIR>`: WAL 日志目录;

所有的地址类选项都是 `ip:port` 形式的字符串。

### metasrv 子命令选项

通过执行下列命令来获取 `metasrv` 子命令的帮助菜单：

```
greptime metasrv start --help
```

- `-c`/`--config-file`: 指定 `metasrv` 启动配置文件
- `--enable-region-failover`: 是否启动 region 自动容灾，默认为 `false` 不启用。
- `--env-prefix <ENV_PREFIX>`: 配置的环境变量前缀，默认为`GREPTIMEDB_METASRV`;
- `--bind-addr <BIND_ADDR>`:服务监听地址，默认为 `127.0.0.1:3002`.
- `--http-addr <HTTP_ADDR>`: HTTP 服务器地址
- `--http-timeout <HTTP_TIMEOUT>`: HTTP 超时设置，单位秒
- `--selector <SELECTOR>`: 参考 [selector 类型](/contributor-guide/metasrv/selector.md#selector-type);
- `--server-addr <SERVER_ADDR>`: 提供给 frontend 和 datanode 的外部通讯服务器地址
- `--store-addrs <STORE_ADDR>`: 逗号或空格分隔的键值存储服务器（默认为 etcd）地址，用于存储元数据；
- `--use-memory-store`: 是否使用内存存储替代 etcd，仅用于测试

### frontend 子命令选项

通过执行下列命令来获取 `frontend` 子命令的帮助菜单：

```
greptime frontend start --help
```

- `-c`/`--config-file`: 指定 `frontend` 启动配置文件
- `--disable-dashboard`:  是否禁用 dashboard，默认为 `false`。
- `--env-prefix <ENV_PREFIX>`: 配置的环境变量前缀，默认为`GREPTIMEDB_FRONTEND`;
- `--rpc-addr <RPC_ADDR>`: gRPC 服务地址
- `--http-addr <HTTP_ADDR>`: HTTP 服务器地址
- `--http-timeout <HTTP_TIMEOUT>`:  HTTP 超时设置，单位秒
- `--influxdb-enable`:  是否启用 `influxdb` HTTP 接口，默认为 true。
- `--metasrv-addrs <METASRV_ADDR>`:   Metasrv 地址列表，用逗号或者空格隔开
- `--mysql-addr <MYSQL_ADDR>`:  MySQL 服务地址
- `--postgres-addr <POSTGRES_ADDR>`: Postgres 服务地址
- `--tls-cert-path <TLS_CERT_PATH>`: TLS 公钥文件地址
- `--tls-key-path <TLS_KEY_PATH>`: TLS 私钥文件地址
- `--tls-mode <TLS_MODE>`: TLS 模式
- `--user-provider <USER_PROVIDER>`: 参考 [鉴权](/user-guide/deployments/authentication/overview.md);


### Flownode 子命令选项

通过执行下列命令来获取 `flownode` 子命令的帮助菜单：

```
greptime flownode start --help
```

- `--node-id <NODE_ID>`: Flownode的ID
- `--rpc-addr <RPC_ADDR>`: gRPC服务器的绑定地址
- `--rpc-hostname <RPC_HOSTNAME>`: gRPC服务器的主机名
- `--metasrv-addrs <METASRV_ADDRS>...`: Metasrv地址列表
- `-c, --config-file <CONFIG_FILE>`: Flownode的配置文件
- `--env-prefix <ENV_PREFIX>`: 环境变量的前缀，默认为 `GREPTIMEDB_FLOWNODE`

### standalone 子命令选项

通过执行下列命令来获取 `standalone` 子命令的帮助菜单：

```
greptime standalone start --help
```

- `-c`/`--config-file`: 指定 `standalone` 启动配置文件
- `--env-prefix <ENV_PREFIX>`: 配置的环境变量前缀，默认为`GREPTIMEDB_STANDALONE`;
- `--http-addr <HTTP_ADDR>`: HTTP 服务器地址
- `--influxdb-enable`:  是否启用 `influxdb` HTTP 接口，默认为 true。
- `--mysql-addr <MYSQL_ADDR>`:  MySQL 服务地址
- `--postgres-addr <POSTGRES_ADDR>`: Postgres 服务地址
- `--rpc-addr <RPC_ADDR>`:  gRPC 服务地址

## 配置示例

### 启动服务时使用相关配置

使用自定义配置以 standalone 模式启动 GreptimeDB：

```sh
greptime --log-dir=/tmp/greptimedb/logs --log-level=info standalone start -c config/standalone.example.toml
```

`standalone.example.toml` 配置文件来自 `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` 仓库的 `config` 目录。您可以在那里找到更多示例配置文件。使用 `-c` 选项可以指定配置文件，有关更多信息，更多信息请查看[配置](../user-guide/deployments/configuration.md)。

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
greptime datanode start --rpc-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```

使用自定义配置启动 frontend：

```sh
greptime frontend start -c config/frontend.example.toml
```

使用命令行参数启动 frontend，指定 metasrv 的地址：

```sh
greptime frontend start --metasrv-addrs=0.0.0.0:3002
```

使用自定义配置启动 flownode

```sh
greptime flownode start -c config/flownode.example.toml
```

使用命令行参数启动 flownode，指定 metasrv 和 frontend 的地址：

```sh
greptime flownode start --node-id=0 --rpc-addr=127.0.0.1:6800 --metasrv-addrs=127.0.0.1:3002;
```

### 升级 GreptimeDB 版本

请参考具体的[升级步骤](/user-guide/operations/upgrade.md)
