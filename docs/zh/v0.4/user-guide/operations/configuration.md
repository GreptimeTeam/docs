# 配置 GreptimeDB

GreptimeDB 提供了层次化的配置能力，按照下列优先顺序来生效配置：

- 命令行参数
- 配置文件
- 环境变量
- 默认值

本文介绍了配置 GreptimeDB server 的方法，用户可以在 TOML 文件中进行设置。

在配置文件中，对于缺失的参数，系统会赋予其一个默认值。

所有样本配置文件都放在项目的 [config](https://github.com/GreptimeTeam/greptimedb/tree/develop/config) 文件夹中。

## 命令行选项

请阅读[命令行工具](/reference/command-lines.md)学习如何使用 `greptime` 命令行工具。

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
- `--metasrv-addr <METASRV_ADDR>`:  Metasrv 服务器列表，用逗号隔开
- `--node-id <NODE_ID>`: 节点 ID
- `--rpc-addr <RPC_ADDR>`:  gRPC 服务地址
- `--rpc-hostname <RPC_HOSTNAME>`:  节点 hostname

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
- `--selector <SELECTOR>`: 参考 [selector 类型](/developer-guide/metasrv/selector#selector-type);
- `--server-addr <SERVER_ADDR>`: 提供给 frontend 和 datanode 的外部通讯服务器地址
- `--store-addr <STORE_ADDR>`:  etcd 地址列表，用逗号隔开
- `--use-memory-store`: 是否使用内存存储替代 etcd，仅用于测试

### frontend 子命令选项

通过执行下列命令来获取 `frontend` 子命令的帮助菜单：

```
greptime frontend start --help
```

- `-c`/`--config-file`: 指定 `frontend` 启动配置文件
- `--disable-dashboard`:  是否禁用 dashboard，默认为 `false`。
- `--env-prefix <ENV_PREFIX>`: 配置的环境变量前缀，默认为`GREPTIMEDB_FRONTEND`;
- `--grpc-addr <GPRC_ADDR>`: gRPC 服务地址
- `--http-addr <HTTP_ADDR>`: HTTP 服务器地址
- `--http-timeout <HTTP_TIMEOUT>`:  HTTP 超时设置，单位秒
- `--influxdb-enable`:  是否启用 `influxdb` HTTP 接口，默认为 true。
- `--metasrv-addr <METASRV_ADDR>`:   Metasrv 地址列表，用逗号隔开
- `--mysql-addr <MYSQL_ADDR>`:  MySQL 服务地址
- `--opentsdb-addr <OPENTSDB_ADDR>`:  OpenTSDB 服务地址
- `--postgres-addr <POSTGRES_ADDR>`: Postgres 服务地址
- `--tls-cert-path <TLS_CERT_PATH>`: TLS 公钥文件地址
- `--tls-key-path <TLS_KEY_PATH>`: TLS 私钥文件地址
- `--tls-mode <TLS_MODE>`: TLS 模式
- `--user-provider <USER_PROVIDER>`: 参考 [鉴权](/user-guide/clients/authentication);

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
- `--opentsdb-addr <OPENTSDB_ADDR>`:  OpenTSDB 服务地址
- `--postgres-addr <POSTGRES_ADDR>`: Postgres 服务地址
- `--rpc-addr <RPC_ADDR>`:  gRPC 服务地址


## 配置文件

### 指定配置文件

用户可以通过使用命令行参数 `-c [file_path]` 指定配置文件，比如：

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

### 常见配置

在 `frontend` 和 `standalone` 子命令中常见的协议配置有：

```toml
[http]
addr = "127.0.0.1:4000"
timeout = "30s"
body_limit = "64MB"

[grpc]
addr = "127.0.0.1:4001"
runtime_size = 8

[mysql]
enable = true
addr = "127.0.0.1:4002"
runtime_size = 2

[mysql.tls]
mode = "disable"
cert_path = ""
key_path = ""

[postgres]
enable = true
addr = "127.0.0.1:4003"
runtime_size = 2

[postgres.tls]
mode = "disable"
cert_path = ""
key_path = ""

[opentsdb]
enable = true
addr = "127.0.0.1:4242"
runtime_size = 2

[influxdb]
enable = true

[prom_store]
enable = true
```

除了 HTTP 和 gRPC 以外，其他协议都是可选的，上面列出了其默认值。如果想禁用某些协议，比如 OpenTSDB 协议，可以将 `enable` 的值设为 `false`。

### 协议选项

| 选项       | 键           | 类型   | 描述                                                    |
| ---------- | ------------ | ------ | ------------------------------------------------------- |
| http       |              |        | HTTP 服务器选项                                         |
|            | addr         | 字符串 | 服务器地址，默认为 "127.0.0.1:4000"                     |
|            | timeout      | 字符串 | HTTP 请求超时时间，默认为 "30s"                         |
|            | body_limit   | 字符串 | HTTP 最大体积大小，默认为 "64MB"                        |
| grpc       |              |        | gRPC 服务器选项                                         |
|            | addr         | 字符串 | 服务器地址，默认为 "127.0.0.1:4001"                     |
|            | runtime_size | 整数   | 服务器工作线程数量，默认为 8                            |
| mysql      |              |        | MySQL 服务器选项                                        |
|            | enable       | 布尔值 | 是否启用 MySQL 协议，默认为 true                        |
|            | add          | 字符串 | 服务器地址，默认为 "127.0.0.1:4002"                     |
|            | runtime_size | 整数   | 服务器工作线程数量，默认为 2                            |
| influxdb   |              |        | InfluxDB 协议选项                                       |
|            | enable       | 布尔值 | 是否在 HTTP API 中启用 InfluxDB 协议，默认为 true       |
| opentsdb   |              |        | OpenTSDB 协议选项                                       |
|            | enable       | 布尔值 | 是否启用 OpenTSDB 协议，默认为 true                     |
|            | addr         | 字符串 | OpenTSDB telnet API 服务器地址，默认为 "127.0.0.1:4242" |
|            | runtime_size | 整数   | 服务器工作线程数量，默认为 2                            |
| prom_store |              |        | Prometheus 远程存储选项                                 |
|            | enable       | 布尔值 | 是否在 HTTP API 中启用 Prometheus 远程读写，默认为 true |
| postgres   |              |        | PostgresSQL 服务器选项                                  |
|            | enable       | 布尔值 | 是否启用 PostgresSQL 协议，默认为 true                  |
|            | addr         | 字符串 | 服务器地址，默认为 "127.0.0.1:4003"                     |
|            | runtime_size | 整数   | 服务器工作线程数量，默认为 2                            |

### 节点选项

一些共同的节点选项：

| Option | Key  | Type   | Description                                              |
| ------ | ---- | ------ | -------------------------------------------------------- |
|        | mode | 字符串 | 节点运行模式，可以是 `"standalone"` 或者 `"distributed"` |

### 存储选项

`存储`选项在 `datanode` 和 `standalone` 模式下有效，它指定了数据库数据目录和其他存储相关的选项。

GreptimeDB 支持将数据保存在本地文件系统， AWS S3 以及其兼容服务（比如 MinIO、digitalocean space、腾讯 COS、百度对象存储（BOS）等），Azure Blob Storage 和阿里云 OSS。

| 选项   | 键                   | 类型   | 描述                                                           |
| ------- | ----------------- | ------ | ------------------------------------------------------------- |
| storage |                   |        | 存储选项                                                       |
|         | type              | 字符串 | 存储类型，支持 "File"，"S3" 和 "Oss" 等.       |
| File    |                   |        | 本地文件存储选项，当 type="File" 时有效            |
|         | data_home         | 字符串 | 数据库存储根目录，默认为 "/tmp/greptimedb" |
| S3      |                   |        | AWS S3 存储选项，当 type="S3" 时有效                  |
|         | bucket            | 字符串 | S3 桶名称                                            |
|         | root              | 字符串 | S3 桶中的根路径                                    |
|         | endpoint          | 字符串 | S3 的 API 端点                                        |
|         | region            | 字符串 | S3 区域                                                 |
|         | access_key_id     | 字符串 | S3 访问密钥 id                                          |
|         | secret_access_key | 字符串 | S3 秘密访问密钥                                      |
| Oss     |                   |        | 阿里云 OSS 存储选项，当 type="Oss" 时有效             |
|         | bucket            | 字符串 | OSS 桶名称                                           |
|         | root              | 字符串 | OSS 桶中的根路径                                   |
|         | endpoint          | 字符串 | OSS 的 API 端点                                       |
|         | access_key_id     | 字符串 | OSS 访问密钥 id                                         |
|         | secret_access_key | 字符串 | OSS 秘密访问密钥                                     |
| Azblob  |                   |        | Azure Blob 存储选项，当 type="Azblob" 时有效          |
|         | container         | 字符串 | 容器名称                                            |
|         | root              | 字符串 | 容器中的根路径                                    |
|         | endpoint          | 字符串 | Azure Blob 存储的 API 端点                        |
|         | account_name      | 字符串 | Azure Blob 存储的账户名                        |
|         | account_key       | 字符串 | 访问密钥                                                |
|         | sas_token         | 字符串 | 共享访问签名                                           |
| Gsc     |                   |        | Google Cloud Storage 存储选项，当 type="Gsc" 时有效          |
|         | root              | 字符串 | Gsc 桶中的根路径                                    |
|         | bucket            | 字符串 | Gsc 桶名称                                    |
|         | scope             | 字符串 | Gsc 权限                                    |
|         | credential_path   | 字符串 | Gsc 访问证书                                    |
|         | endpoint          | 字符串 | GSC 的 API 端点                                    |

文件存储配置范例：

```toml
[storage]
type = "File"
data_home = "/tmp/greptimedb/"
```

s3 配置范例：

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
```

#### 对象存储缓存

当使用 S3、阿里云 OSS 等对象存储的时候，最好开启缓存来加速查询：

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
## 开启对象存储缓存
cache_path = "/var/data/s3_local_cache"
cache_capacity = "256MiB"
```

`cache_path` 指定本地的缓存目录， `cache_capacity` 指定缓存的最大大小（字节）。

### WAL 选项

datanode 和 standalone 在 `[wal]` 部分可以配置 Write-Ahead-Log 的对应参数：

```toml
[wal]
file_size = "256MB"
purge_threshold = "4GB"
purge_interval = "10m"
read_batch_size = 128
sync_write = false
```

- `dir`: WAL 的日志目录， 当使用文件 `File` 存储的时候, 默认值为`{data_home}/wal` 。当使用对象存储的时候，必须明确指定。
- `file_size`: 单个日志文件的最大大小，默认为 `256MB`。
- `purge_threshold` 和 `purge_interval`: 控制清除任务的触发阈值和间隔
- `sync_write`: 是否在写入每条日志的时候调用 l `fsync` 刷盘。

### 单机模式

当用户在单机模式（standalone）下使用 GreptimeDB 时，可以参考 [standalone.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/standalone.example.toml) 配置文件。

类似下面这样的命令启动：

```
greptime standalone start -c standalone.example.toml
```

### 分布式模式下的 `Frontend`

在分布式模式下配置 `Frontend`：

```toml
mode = "distributed"

[meta_client]
metasrv_addrs = ["127.0.0.1:3002"]
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = true
```

指定运行模式为 `"distributed"`。

通过 `meta_client` 配置 metasrv 客户端，包括：

- `metasrv_addrs`， Metasrv 地址列表，对应 Metasrv 启动配置的 server address。
- `timeout_millis`， 操作超时时长，单位为毫秒，默认为 3000。
- `connect_timeout_millis`，连接服务器超时时长，单位为毫秒，默认为 5000。
- `tcp_nodelay`，接受连接时的 `TCP_NODELAY` 选项，默认为 true。

这里可以找到配置 frontend 分布式模式运行的样例配置文件 [frontend.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/frontend.example.toml).

### 分布式模式下的 `Datanode`

在分布式模式下配置 `datanode`：

```toml
node_id = 42
mode = "distributed"
rpc_hostname = "127.0.0.1"
rpc_addr = "127.0.0.1:3001"
rpc_runtime_size = 8

[meta_client]
metasrv_addrs = ["127.0.0.1:3002"]
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = false
```

分布式模式下的 datanode 应该在不同的节点上设置**不同**的 `node_id`。

这里可以找到配置 datanode 分布式模式运行的样例配置文件 [datanode.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/datanode.example.toml).

### Metasrv 配置

一份配置样例文件 [metasrv.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/metasrv.example.toml)：

```toml
# The working home directory.
data_home = "/tmp/metasrv/"
# The bind address of metasrv, "127.0.0.1:3002" by default.
bind_addr = "127.0.0.1:3002"
# The communication server address for frontend and datanode to connect to metasrv,  "127.0.0.1:3002" by default for localhost.
server_addr = "127.0.0.1:3002"
# Etcd server addresses, "127.0.0.1:2379" by default.
store_addr = "127.0.0.1:2379"
# Datanode selector type.
# - "LeaseBased" (default value).
# - "LoadBased"
# For details, please see "https://docs.greptime.com/developer-guide/meta/selector".
selector = "LeaseBased"
# Store data in memory, false by default.
use_memory_store = false
```

| 键               | 类型   | 描述                                                                                                   |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| data_home        | 字符串 | Metasrv 的工作目录，默认为 `"/tmp/metasrv/"`                                                        |
| bind_addr        | 字符串 | Metasrv 的绑定地址，默认为 `"127.0.0.1:3002"`。                                                     |
| server_addr      | 字符串 | 前端和数据节点连接到 Metasrv 的通信服务器地址，默认为 `"127.0.0.1:3002"`（适用于本地主机）          |
| store_addr       | 字符串 | Etcd 服务器地址，默认为 `"127.0.0.1:2379"`，服务器地址由逗号分隔，格式为 `"ip1:port1,ip2:port2,..."`。 |
| selector         | 字符串 | 创建新表时选择数据节点的负载均衡策略，参见 [选择器](/developer-guide/metasrv/selector.md)              |
| use_memory_store | 布尔值 | 仅在测试时使用，当你没有 etcd 集群时，将数据存储在内存中，默认为 `false`                               |

## 环境变量配置

配置文件中的每一项都可以映射到环境变量。例如，如果我们想通过环境变量设置 datanode 的配置项 `data_home`：

```toml
# ...
[storage]
data_home = "/data/greptimedb"
# ...
```

你可以使用以下的 shell 命令来设置环境变量，格式如下：

```
export GREPTIMEDB_DATANODE__STORAGE__DATA_HOME=/data/greptimedb
```

### 环境变量规则

- 每个环境变量应该有组件前缀，例如：

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- 我们使用**双下划线 `__`** 作为分隔符。例如，上述的数据结构 `storage.data_home` 将被转换为 `STORAGE__DATA_HOME`。

环境变量也接受用逗号 `,` 分隔的列表，例如：

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```
