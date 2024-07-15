# 配置 GreptimeDB

GreptimeDB 提供了层次化的配置能力，按照下列优先顺序来生效配置（每个项目都会覆盖下面的项目）：

- Greptime 命令行选项
- 配置文件选项
- 环境变量
- 默认值

你只需要设置所需的配置项。
GreptimeDB 将为未配置的任何设置分配默认值。

## 如何设置配置项

### Greptime 命令行选项

你可以使用命令行参数指定多个配置项。
例如，以配置的 HTTP 地址启动 GreptimeDB 的独立模式：

```shell
greptime standalone start --http-addr 127.0.0.1:4000 
```

有关 Greptime 命令行支持的所有选项，请参阅 [GreptimeDB 命令行界面](/reference/command-lines.md)。

### 配置文件选项

你可以在 TOML 文件中指定配置项。
例如，创建一个名为 `standalone.example.toml` 的配置文件，如下所示：

```toml
[storage]
type = "File"
data_home = "/tmp/greptimedb/"
```

然后使用命令行参数 `-c [file_path]` 指定配置文件。

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

例如以 standalone 模式启动 GreptimeDB：

```bash
greptime standalone start -c standalone.example.toml
```

#### 示例文件

以下是每个 GreptimeDB 组件的示例配置文件，包括所有可用配置项。
在实际场景中，你只需要配置所需的选项，不需要像示例文件中那样配置所有选项。

- [独立模式](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/standalone.example.toml)
- [前端](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/frontend.example.toml)
- [数据节点](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/datanode.example.toml)
- [流节点](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/flownode.example.toml)
- [元服务](https://github.com/GreptimeTeam/greptimedb/blob/<%greptimedb-version%>/config/metasrv.example.toml)

### 环境变量

配置文件中的每个项目都可以映射到环境变量。
例如，使用环境变量设置数据节点的 `data_home` 配置项：

```toml
# ...
[storage]
data_home = "/data/greptimedb"
# ...
```

使用以下 shell 命令以以下格式设置环境变量：

```
export GREPTIMEDB_DATANODE__STORAGE__DATA_HOME=/data/greptimedb
```

#### 环境变量规则

- 每个环境变量应具有组件前缀，例如：

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- 使用**双下划线 `__`**作为分隔符。例如，数据结构 `storage.data_home` 转换为 `STORAGE__DATA_HOME`。

环境变量还接受以逗号 `,` 分隔的列表，例如：

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```

### 协议选项

协议选项适用于 `frontend` 和 `standalone` 子命令，它指定了协议服务器地址和其他协议相关的选项。

下面的示例配置包含了所有协议选项的默认值。
你可以在配置文件中更改这些值或禁用某些协议。
例如禁用 OpenTSDB 协议支持，可以将 `enable` 参数设置为 `false`。
请注意，为了保障数据库的正常工作，无法禁用 HTTP 和 gRPC 协议。

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

[influxdb]
enable = true

[prom_store]
enable = true
```

下表描述了每个选项的详细信息：

| 选项       | 键                 | 类型   | 描述                                                        |
| ---------- | ------------------ | ------ | ----------------------------------------------------------- |
| http       |                    |        | HTTP 服务器选项                                             |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4000"                         |
|            | timeout            | 字符串 | HTTP 请求超时时间，默认为 "30s"                             |
|            | body_limit         | 字符串 | HTTP 最大体积大小，默认为 "64MB"                            |
|            | is_strict_mode     | 布尔值 | 是否启用协议的严格校验模式，启用会轻微影响性能，默认为false  |
| grpc       |                    |        | gRPC 服务器选项                                             |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4001"                         |
|            | runtime_size       | 整数   | 服务器工作线程数量，默认为 8                                |
| mysql      |                    |        | MySQL 服务器选项                                            |
|            | enable             | 布尔值 | 是否启用 MySQL 协议，默认为 true                            |
|            | add                | 字符串 | 服务器地址，默认为 "127.0.0.1:4002"                         |
|            | runtime_size       | 整数   | 服务器工作线程数量，默认为 2                                |
| influxdb   |                    |        | InfluxDB 协议选项                                           |
|            | enable             | 布尔值 | 是否在 HTTP API 中启用 InfluxDB 协议，默认为 true           |
| opentsdb   |                    |        | OpenTSDB 协议选项                                           |
|            | enable             | 布尔值 | 是否启用 OpenTSDB 协议，默认为 true                         |
| prom_store |                    |        | Prometheus 远程存储选项                                     |
|            | enable             | 布尔值 | 是否在 HTTP API 中启用 Prometheus 远程读写，默认为 true     |
|            | with_metric_engine | 布尔值 | 是否在 Prometheus 远程写入中使用 Metric Engine，默认为 true |
| postgres   |                    |        | PostgresSQL 服务器选项                                      |
|            | enable             | 布尔值 | 是否启用 PostgresSQL 协议，默认为 true                      |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4003"                         |
|            | runtime_size       | 整数   | 服务器工作线程数量，默认为 2                                |

### 存储选项

`存储`选项在 `datanode` 和 `standalone` 模式下有效，它指定了数据库数据目录和其他存储相关的选项。

GreptimeDB 支持将数据保存在本地文件系统， AWS S3 以及其兼容服务（比如 MinIO、digitalocean space、腾讯 COS、百度对象存储（BOS）等），Azure Blob Storage 和阿里云 OSS。

| 选项    | 键                | 类型   | 描述                                                |
| ------- | ----------------- | ------ | --------------------------------------------------- |
| storage |                   |        | 存储选项                                            |
|         | type              | 字符串 | 存储类型，支持 "File"，"S3" 和 "Oss" 等.            |
| File    |                   |        | 本地文件存储选项，当 type="File" 时有效             |
|         | data_home         | 字符串 | 数据库存储根目录，默认为 "/tmp/greptimedb"          |
| S3      |                   |        | AWS S3 存储选项，当 type="S3" 时有效                |
|         | bucket            | 字符串 | S3 桶名称                                           |
|         | root              | 字符串 | S3 桶中的根路径                                     |
|         | endpoint          | 字符串 | S3 的 API 端点                                      |
|         | region            | 字符串 | S3 区域                                             |
|         | access_key_id     | 字符串 | S3 访问密钥 id                                      |
|         | secret_access_key | 字符串 | S3 秘密访问密钥                                     |
| Oss     |                   |        | 阿里云 OSS 存储选项，当 type="Oss" 时有效           |
|         | bucket            | 字符串 | OSS 桶名称                                          |
|         | root              | 字符串 | OSS 桶中的根路径                                    |
|         | endpoint          | 字符串 | OSS 的 API 端点                                     |
|         | access_key_id     | 字符串 | OSS 访问密钥 id                                     |
|         | secret_access_key | 字符串 | OSS 秘密访问密钥                                    |
| Azblob  |                   |        | Azure Blob 存储选项，当 type="Azblob" 时有效        |
|         | container         | 字符串 | 容器名称                                            |
|         | root              | 字符串 | 容器中的根路径                                      |
|         | endpoint          | 字符串 | Azure Blob 存储的 API 端点                          |
|         | account_name      | 字符串 | Azure Blob 存储的账户名                             |
|         | account_key       | 字符串 | 访问密钥                                            |
|         | sas_token         | 字符串 | 共享访问签名                                        |
| Gsc     |                   |        | Google Cloud Storage 存储选项，当 type="Gsc" 时有效 |
|         | root              | 字符串 | Gsc 桶中的根路径                                    |
|         | bucket            | 字符串 | Gsc 桶名称                                          |
|         | scope             | 字符串 | Gsc 权限                                            |
|         | credential_path   | 字符串 | Gsc 访问证书                                        |
|         | endpoint          | 字符串 | GSC 的 API 端点                                     |

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

### 存储引擎提供商

`[[storage.providers]]`  用来设置存储引擎的提供商列表。基于这个配置，你可以为每张表指定不同的存储引擎，具体请参考 [create table](/reference/sql/create#create-table):

```toml
# Allows using multiple storages
[[storage.providers]]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"

[[storage.providers]]
type = "Gcs"
bucket = "test_greptimedb"
root = "/greptimedb"
credential_path = "<gcs credential path>"
```

所有配置的这些存储引擎提供商都可以在创建表时用作 `storage` 选项。

### 对象存储缓存

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

### Logging 选项

`frontend`、`metasrv`、`datanode` 和 `standalone` 都可以在 `[logging]` 部分配置 log、tracing 相关参数：

```toml
[logging]
dir = "/tmp/greptimedb/logs"
level = "info"
enable_otlp_tracing = false
otlp_endpoint = "localhost:4317"
append_stdout = true
[logging.tracing_sample_ratio]
default_ratio = 1.0
```

- `dir`: log 输出目录。
- `level`: log 输出的日志等级，日志等级有 `info`, `debug`, `error`, `warn`，默认等级为 `info`。
- `enable_otlp_tracing`：是否打开分布式追踪，默认不开启。
- `otlp_endpoint`：使用基于 gRPC 的 OTLP 协议导出 tracing 的目标端点，默认值为 `localhost:4317`。
- `append_stdout`：是否将日志打印到stdout。默认是`true`。
- `tracing_sample_ratio`：该字段可以配置 tracing 的采样率，如何使用 `tracing_sample_ratio`，请参考 [如何配置 tracing 采样率](./tracing.md#指南如何配置-tracing-采样率)。

如何使用分布式追踪，请参考 [Tracing](./tracing.md#教程使用-jaeger-追踪-greptimedb-调用链路)

### Region 引擎选项

datanode 和 standalone 在 `[region_engine]` 部分可以配置不同存储引擎的对应参数。目前只可以配置存储引擎 `mito` 的选项。

部分常用的选项如下

```toml
[[region_engine]]
[region_engine.mito]
num_workers = 8
manifest_checkpoint_distance = 10
max_background_jobs = 4
auto_flush_interval = "1h"
global_write_buffer_size = "1GB"
global_write_buffer_reject_size = "2GB"
sst_meta_cache_size = "128MB"
vector_cache_size = "512MB"
page_cache_size = "512MB"
sst_write_buffer_size = "8MB"
scan_parallelism = 0

[region_engine.mito.inverted_index]
create_on_flush = "auto"
create_on_compaction = "auto"
apply_on_query = "auto"
mem_threshold_on_create = "64M"
intermediate_path = ""

[region_engine.mito.memtable]
type = "time_series"
```

此外，`mito` 也提供了一个实验性质的 memtable。该 memtable 主要优化大量时间序列下的写入性能和内存占用。其查询性能可能会不如默认的 `time_series` memtable。

```toml
[region_engine.mito.memtable]
type = "partition_tree"
index_max_keys_per_shard = 8192
data_freeze_threshold = 32768
fork_dictionary_bytes = "1GiB"
```

以下是可供使用的选项

| 键 | 类型 | 默认值 | 描述 |
| --- | -----| ------- | ----------- |
| `num_workers` | 整数 | `8` | 写入线程数量 |
| `manifest_checkpoint_distance` | 整数 | `10` | 每写入 `manifest_checkpoint_distance` 个 manifest 文件创建一次 checkpoint |
| `max_background_jobs` | 整数 | `4` | 后台线程数量 |
| `auto_flush_interval` | 字符串 | `1h` | 自动 flush 超过 `auto_flush_interval` 没 flush 的 region |
| `global_write_buffer_size` | 字符串 | `1GB` | 写入缓冲区大小，默认值为内存总量的 1/8，但不会超过 1GB |
| `global_write_buffer_reject_size` | 字符串 | `2GB` | 写入缓冲区内数据的大小超过 `global_write_buffer_reject_size` 后拒
绝写入请求，默认为 `global_write_buffer_size` 的 2 倍 |
| `sst_meta_cache_size` | 字符串 | `128MB` | SST 元数据缓存大小。设为 0 可关闭该缓存<br/>默认为内存的 1/32，不超过 128MB |
| `vector_cache_size` | 字符串 | `512MB` | 内存向量和 arrow array 的缓存大小。设为 0 可关闭该缓存<br/>默认为内存的 1/16，不超过 512MB |
| `page_cache_size` | 字符串 | `512MB` | SST 数据页的缓存。设为 0 可关闭该缓存<br/>默认为内存的 1/16，不超过 512MB |
| `sst_write_buffer_size` | 字符串 | `8MB` | SST 的写缓存大小 |
| `scan_parallelism` | 整数 | `0` | 扫描并发度 (默认 1/4 CPU 核数)<br/>- `0`: 使用默认值 (1/4 CPU 核数)<br/>- `1`: 单线程扫描<br/>- `n`: 按并行度 n 扫描 |
| `inverted_index.create_on_flush` | 字符串 | `auto` | 是否在 flush 时构建索引<br/>- `auto`: 自动<br/>- `disable`: 从不 |
| `inverted_index.create_on_compaction` | 字符串 | `auto` | 是否在 compaction 时构建索引<br/>- `auto`: 自动<br/>- `disable`: 从不 |
| `inverted_index.apply_on_query` | 字符串 | `auto` | 是否在查询时使用索引<br/>- `auto`: 自动<br/>- `disable`: 从不 |
| `inverted_index.mem_threshold_on_create` | 字符串 | `64M` | 创建索引时如果超过该内存阈值则改为使用外部排序<br/>设置为空会关闭外排，在内存中完成所有排序 |
| `inverted_index.intermediate_path` | 字符串 | `""` | 存放外排临时文件的路径 (默认 `{data_home}/index_intermediate`). |
| `memtable.type` | 字符串 | `time_series` | Memtable type.<br/>- `time_series`: time-series memtable<br/>- `partition_tree`: partition tree memtable (实验性功能) |
| `memtable.index_max_keys_per_shard` | 整数 | `8192` | 一个 shard 内的主键数<br/>只对 `partition_tree` memtable 生效 |
| `memtable.data_freeze_threshold` | 整数 | `32768` | 一个 shard 内写缓存可容纳的最大行数<br/>只对 `partition_tree` memtable 生效 |
| `memtable.fork_dictionary_bytes` | 字符串 | `1GiB` | 主键字典的大小<br/>只对 `partition_tree` memtable 生效 |




### 设定 meta client

`meta_client` 选项适用于 `datanode` 和 `frontend` 模块，用于指定 Metasrv 的相关信息。

```toml
[meta_client]
metasrv_addrs = ["127.0.0.1:3002"]
timeout = "3s"
connect_timeout = "1s"
ddl_timeout = "10s"
tcp_nodelay = true
```

通过 `meta_client` 配置 metasrv 客户端，包括：

- `metasrv_addrs`， Metasrv 地址列表，对应 Metasrv 启动配置的 server address。
- `timeout`， 操作超时时长，默认为 3 秒。
- `connect_timeout`，连接服务器超时时长，默认为 1 秒。
- `ddl_timeout`， DDL 执行的超时时间，默认 10 秒。
- `tcp_nodelay`，接受连接时的 `TCP_NODELAY` 选项，默认为 true。

### 指标监控选项

这些选项用于将系统监控指标保存到 GreptimeDB 本身。
有关如何使用此功能的说明，请参见 [监控](/user-guide/operations/monitoring.md) 指南。

```toml
[export_metrics]
# Whether to enable export_metrics
enable=true
# Export time interval
write_interval = "30s"
```

- `enable`: 是否启用导出指标功能，默认为 `false`。
- `write_interval`: 指标导出时间间隔。

#### `self_import` 方法

仅 `frontend` 和 `standalone` 支持使用 `self_import` 方法导出指标。

```toml
[export_metrics]
# Whether to enable export_metrics
enable=true
# Export time interval
write_interval = "30s"
[export_metrics.self_import]
db = "information_schema"
```

- `db`: 默认的数据库为 `information_schema`，你也可以创建另一个数据库来保存系统指标。

#### `remote_write` 方法

`datanode`、`frontend`、`metasrv` 和 `standalone` 支持使用 `remote_write` 方法导出指标。
它将指标发送到与 [Prometheus Remote-Write protocol](https://prometheus.io/docs/concepts/remote_write_spec/) 兼容的接受端。

```toml
[export_metrics]
# Whether to enable export_metrics
enable=true
# Export time interval
write_interval = "30s"
[export_metrics.remote_write]
# URL specified by Prometheus Remote-Write protocol
url = "http://127.0.0.1:4000/v1/prometheus/write?db=information_schema"
# Some optional HTTP parameters, such as authentication information
headers = { Authorization = "Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=" }
```

- `url`: Prometheus Remote-Write 协议指定的 URL。
- `headers`: 一些可选的 HTTP 参数，比如认证信息。

### Mode 选项

`mode` 选项在 `datanode`、`frontend` 和 `standalone` 中可用，它指定了组件的运行模式。

在分布式 GreptimeDB 的 `datanode` 和 `frontend` 的配置文件中，需要将值设置为 `distributed`：

```toml
mode = "distributed"
```

在 standalone GreptimeDB 的配置文件中，需要将值设置为 `standalone`：

```toml
mode = "standalone"
```

### 仅限于 Metasrv 的配置

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
# - "lease_based" (default value).
# - "load_based"
# For details, please see "https://docs.greptime.com/contributor-guide/meta/selector".
selector = "lease_based"
# Store data in memory, false by default.
use_memory_store = false
```

| 键               | 类型   | 描述                                                                                                   |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| data_home        | 字符串 | Metasrv 的工作目录，默认为 `"/tmp/metasrv/"`                                                           |
| bind_addr        | 字符串 | Metasrv 的绑定地址，默认为 `"127.0.0.1:3002"`。                                                        |
| server_addr      | 字符串 | 前端和数据节点连接到 Metasrv 的通信服务器地址，默认为 `"127.0.0.1:3002"`（适用于本地主机）             |
| store_addr       | 字符串 | etcd 服务器地址，默认为 `"127.0.0.1:2379"`，服务器地址由逗号分隔，格式为 `"ip1:port1,ip2:port2,..."`。 |
| selector         | 字符串 | 创建新表时选择数据节点的负载均衡策略，参见 [选择器](/contributor-guide/metasrv/selector.md)            |
| use_memory_store | 布尔值 | 仅在测试时使用，当你没有 etcd 集群时，将数据存储在内存中，默认为 `false`                               |


### 仅限于 `Datanode` 的配置

```toml
node_id = 42
rpc_hostname = "127.0.0.1"
rpc_addr = "127.0.0.1:3001"
rpc_runtime_size = 8
```

| Key              | Type    | Description                                 |
| ---------------- | ------- | ------------------------------------------- |
| node_id          | 整数 | 该 `datanode` 的唯一标识符。                |
| rpc_hostname     | 字符串  | 该 `datanode` 的 Hostname。                 |
| rpc_addr         | 字符串  | gRPC 服务端地址，默认为`"127.0.0.1:3001"`。 |
| rpc_runtime_size | 整数 | gRPC 服务器工作线程数，默认为 8。           |

