---
keywords: [配置指南, 命令行选项, 配置文件, 环境变量, 协议选项, 存储选项, WAL 选项, 日志选项]
description: GreptimeDB 的配置指南，介绍了命令行选项、配置文件、环境变量、协议选项、存储选项、WAL 选项、日志选项等详细配置方法。
---

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

- [独立模式](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/standalone.example.toml)
- [前端](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/frontend.example.toml)
- [数据节点](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/datanode.example.toml)
- [流节点](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/flownode.example.toml)
- [元服务](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/metasrv.example.toml)

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

| 选项       | 键                 | 类型   | 描述                                                         |
| ---------- | ------------------ | ------ | ------------------------------------------------------------ |
| http       |                    |        | HTTP 服务器选项                                              |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4000"                          |
|            | timeout            | 字符串 | HTTP 请求超时时间，默认为 "30s"                              |
|            | body_limit         | 字符串 | HTTP 最大体积大小，默认为 "64MB"                             |
|            | is_strict_mode     | 布尔值 | 是否启用协议的严格校验模式，启用会轻微影响性能，默认为 false |
| grpc       |                    |        | gRPC 服务器选项                                              |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4001"                          |
|            | runtime_size       | 整数   | 服务器工作线程数量，默认为 8                                 |
| mysql      |                    |        | MySQL 服务器选项                                             |
|            | enable             | 布尔值 | 是否启用 MySQL 协议，默认为 true                             |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4002"                          |
|            | runtime_size       | 整数   | 服务器工作线程数量，默认为 2                                 |
| influxdb   |                    |        | InfluxDB 协议选项                                            |
|            | enable             | 布尔值 | 是否在 HTTP API 中启用 InfluxDB 协议，默认为 true            |
| opentsdb   |                    |        | OpenTSDB 协议选项                                            |
|            | enable             | 布尔值 | 是否启用 OpenTSDB 协议，默认为 true                          |
| prom_store |                    |        | Prometheus 远程存储选项                                      |
|            | enable             | 布尔值 | 是否在 HTTP API 中启用 Prometheus 远程读写，默认为 true      |
|            | with_metric_engine | 布尔值 | 是否在 Prometheus 远程写入中使用 Metric Engine，默认为 true  |
| postgres   |                    |        | PostgresSQL 服务器选项                                       |
|            | enable             | 布尔值 | 是否启用 PostgresSQL 协议，默认为 true                       |
|            | addr               | 字符串 | 服务器地址，默认为 "127.0.0.1:4003"                          |
|            | runtime_size       | 整数   | 服务器工作线程数量，默认为 2                                 |

对 MySQL 和 Postgres 接口，我们支持 TLS 配置

| Option                        | Key         | Type    | Description                                      |
|-------------------------------|-------------|---------|--------------------------------------------------|
| `mysql.tls` 或 `postgres.tls` |             |         | MySQL 或 Postgres 的 TLS 配置                    |
|                               | `mode`      | String  | TLS 模式，支持 `disable`, `prefer` and `require` |
|                               | `cert_path` | String  | TLS 证书文件路径                                 |
|                               | `key_path`  | String  | TLS 私钥文件路径                                 |
|                               | `watch`     | Boolean | 监控文件变化，自动重新加载证书或私钥             |


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
|         | name            | String |  存储提供商名字，默认为 `S3`               |
|         | bucket            | 字符串 | S3 桶名称                                           |
|         | root              | 字符串 | S3 桶中的根路径                                     |
|         | endpoint          | 字符串 | S3 的 API 端点                                      |
|         | region            | 字符串 | S3 区域                                             |
|         | access_key_id     | 字符串 | S3 访问密钥 id                                      |
|         | secret_access_key | 字符串 | S3 秘密访问密钥                                     |
| Oss     |                   |        | 阿里云 OSS 存储选项，当 type="Oss" 时有效           |
|         | name            | String |  存储提供商名字，默认为 `Oss`               |
|         | bucket            | 字符串 | OSS 桶名称                                          |
|         | root              | 字符串 | OSS 桶中的根路径                                    |
|         | endpoint          | 字符串 | OSS 的 API 端点                                     |
|         | access_key_id     | 字符串 | OSS 访问密钥 id                                     |
|         | secret_access_key | 字符串 | OSS 秘密访问密钥                                    |
| Azblob  |                   |        | Azure Blob 存储选项，当 type="Azblob" 时有效        |
|         | name            | String |  存储提供商名字，默认为 `Azblob`               |
|         | container         | 字符串 | 容器名称                                            |
|         | root              | 字符串 | 容器中的根路径                                      |
|         | endpoint          | 字符串 | Azure Blob 存储的 API 端点                          |
|         | account_name      | 字符串 | Azure Blob 存储的账户名                             |
|         | account_key       | 字符串 | 访问密钥                                            |
|         | sas_token         | 字符串 | 共享访问签名                                        |
| Gsc     |                   |        | Google Cloud Storage 存储选项，当 type="Gsc" 时有效 |
|         | name            | String |  存储提供商名字，默认为 `Gsc`               |
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

### 存储服务的 http 客户端

`[storage.http_client]` 设置了向存储服务发送请求的 http 客户端的各种配置。

仅当存储服务类型是 “S3”，“Oss”，“Azblob” 或 “Gcs” 时生效。

| Key                      | 类型  | 默认值        | 含义                                                          |
|--------------------------|-----|------------|-------------------------------------------------------------|
| `pool_max_idle_per_host` | 数字  | 1024       | http 连接池中对每个 host 的最大空闲连接数。                                 |
| `connect_timeout`        | 字符串 | “30s”（30秒） | http 客户端在进行连接时的超时                                           |
| `timeout`                | 字符串 | “30s”（30秒） | 总的 http 请求超时，包括了从建立连接到接收完返回值为止的时间。也可视为一个请求从开始到结束的一个完整的截止时间。 |
| `pool_idle_timeout`      | 字符串 | “90s”（90秒） | 对空闲连接进行保活（ "keep-alive" ）的超时。                               |

### 存储引擎提供商

`[[storage.providers]]` 用来设置存储引擎的提供商列表。基于这个配置，你可以为每张表指定不同的存储引擎，具体请参考 [create table](/reference/sql/create.md#create-table):

```toml
# Allows using multiple storages
[[storage.providers]]
name = "S3"
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"

[[storage.providers]]
name = "Gcs"
type = "Gcs"
bucket = "test_greptimedb"
root = "/greptimedb"
credential_path = "<gcs credential path>"
```

所有配置的这些存储引擎提供商的 `name` 都可以在创建表时用作 `storage` 选项。

对于同样提供商的存储，比如你希望使用不同 S3 bucket 来作为不同表的存储引擎，你就可以设置不同的 `name`，并在创建表的时候指定 `storage` 选项。

### 对象存储缓存

在使用 AWS S3、阿里云 OSS 或 Azure Blob Storage 等远程存储服务时，查询过程中获取数据通常会很耗时，尤其在公有云环境。为了解决这个问题，GreptimeDB 提供了本地缓存机制来加速重复数据的访问。

从 v0.11 版本开始，GreptimeDB 默认启用远程对象存储的本地文件缓存。读取和写入缓存容量都设置为 `5GiB`。


通常你无需专门配置缓存，除非你需要修改缓存的大小
```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
cache_capacity = "10GiB"
```


我们建议你不用设置缓存的目录，因为数据库会自动创建该目录。默认的缓存目录位于 `{data_home}` 目录下。


对于 v0.11 之前的版本，你需要通过在存储设置中配置 `cache_path` 来手动启用读取缓存：

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
## 启用对象存储缓存
cache_path = "/var/data/s3_read_cache"
cache_capacity = "5GiB"
```

`cache_path` 指定存储缓存文件的本地目录，而 `cache_capacity` 则决定缓存目录中允许的最大文件总大小（以字节为单位）。你可以通过将 `cache_path` 设置为空字符串来禁用读取缓存。


自 `v0.12` 之后，写入缓存不再是实验性的功能。你可以通过修改 mito 的配置调整缓存的大小

```toml
[[region_engine]]
[region_engine.mito]

write_cache_size = "10GiB"
````


对于 v0.11 之前版本的写入缓存，你需要在 `[region_engine.mito]` 部分将 `enable_experimental_write_cache` 设置为 `true` 来启用：

```toml
[[region_engine]]
[region_engine.mito]

enable_experimental_write_cache = true
experimental_write_cache_path = "/var/data/s3_write_cache"
experimental_write_cache_size = "5GiB"
```

`experimental_write_cache_path` 默认值位于 `{data_home}` 目录下。
要禁用写入缓存，请将 `enable_experimental_write_cache` 设置为 `false`。

更详细的信息请参阅[性能调优技巧](/user-guide/administration/performance-tuning-tips)。


### WAL 选项

datanode 和 standalone 在 `[wal]` 部分可以配置 Write-Ahead-Log 的对应参数：

#### Local WAL

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

#### Remote WAL

```toml
[wal]
provider = "kafka"
broker_endpoints = ["127.0.0.1:9092"]
max_batch_bytes = "1MB"
consumer_wait_timeout = "100ms"
backoff_init = "500ms"
backoff_max = "10s"
backoff_base = 2
backoff_deadline = "5mins"
overwrite_entry_start_id = false
```

- `broker_endpoints`：Kafka 端点
- `max_batch_bytes`：单个 producer batch 的最大值
- `consumer_wait_timeout`：consumer 的等待超时时间
- `backoff_init`：backoff 初始延迟
- `backoff_max`：：backoff 最大延迟
- `backoff_base`：：backoff 指数
- `backoff_deadline`：重试的截止时间
- `overwrite_entry_start_id`: 该选项确保在 Kafka 消息被误删除时，系统仍然能够成功重放内存表数据，而不会抛出超出范围（out-of-range）的错误。然而，启用此选项可能会导致意外的数据丢失，因为系统会跳过缺失的条目，而不是将其视为严重错误。

##### Remote WAL 鉴权 (Optional)

```toml
[wal.sasl]
type = "SCRAM-SHA-512"
username = "user"
password = "secret"
```

Kafka 客户端 SASL 鉴权配置，支持的 SASL 机制 : `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.

##### Remote WAL TLS (Optional)

```toml
[wal.tls]
server_ca_cert_path = "/path/to/server_cert"
client_cert_path = "/path/to/client_cert"
client_key_path = "/path/to/key"
```

Kafka 客户端 TLS 配置，支持 TLS（使用系统 CA 证书），TLS（使用特定 CA 证书），mTLS。

配置示例:

**TLS (使用系统 CA 证书)**

```toml
[wal.tls]
```

**TLS (使用特定 CA 证书)**

```toml
[wal.tls]
server_ca_cert_path = "/path/to/server_cert"
```

**mTLS**

```toml
[wal.tls]
server_ca_cert_path = "/path/to/server_cert"
client_cert_path = "/path/to/client_cert"
client_key_path = "/path/to/key"
```

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
- `append_stdout`：是否将日志打印到 stdout。默认是`true`。
- `tracing_sample_ratio`：该字段可以配置 tracing 的采样率，如何使用 `tracing_sample_ratio`，请参考 [如何配置 tracing 采样率](/user-guide/administration/monitoring/tracing.md#指南如何配置-tracing-采样率)。

如何使用分布式追踪，请参考 [Tracing](/user-guide/administration/monitoring/tracing.md#教程使用-jaeger-追踪-greptimedb-调用链路)

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

[region_engine.mito.index]
aux_path = ""
staging_size = "2GB"
metadata_cache_size = "64MiB"
content_cache_size = "128MiB"
content_cache_page_size = "64KiB"

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

| 键                                       | 类型   | 默认值        | 描述                                                                                                                   |
| ---------------------------------------- | ------ | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `num_workers`                            | 整数   | `8`           | 写入线程数量                                                                                                           |
| `manifest_checkpoint_distance`           | 整数   | `10`          | 每写入 `manifest_checkpoint_distance` 个 manifest 文件创建一次 checkpoint                                              |
| `max_background_jobs`                    | 整数   | `4`           | 后台线程数量                                                                                                           |
| `auto_flush_interval`                    | 字符串 | `1h`          | 自动 flush 超过 `auto_flush_interval` 没 flush 的 region                                                               |
| `global_write_buffer_size`               | 字符串 | `1GB`         | 写入缓冲区大小，默认值为内存总量的 1/8，但不会超过 1GB                                                                 |
| `global_write_buffer_reject_size`        | 字符串 | `2GB`         | 写入缓冲区内数据的大小超过 `global_write_buffer_reject_size` 后拒绝写入请求，默认为 `global_write_buffer_size` 的 2 倍 |
| `sst_meta_cache_size`                    | 字符串 | `128MB`       | SST 元数据缓存大小。设为 0 可关闭该缓存<br/>默认为内存的 1/32，不超过 128MB                                            |
| `vector_cache_size`                      | 字符串 | `512MB`       | 内存向量和 arrow array 的缓存大小。设为 0 可关闭该缓存<br/>默认为内存的 1/16，不超过 512MB                             |
| `page_cache_size`                        | 字符串 | `512MB`       | SST 数据页的缓存。设为 0 可关闭该缓存<br/>默认为内存的 1/8                                                             |
| `selector_result_cache_size`             | 字符串 | `512MB`       | `last_value()` 等时间线检索结果的缓存。设为 0 可关闭该缓存<br/>默认为内存的 1/16，不超过 512MB                         |
| `sst_write_buffer_size`                  | 字符串 | `8MB`         | SST 的写缓存大小                                                                                                       |
| `scan_parallelism`                       | 整数   | `0`           | 扫描并发度 (默认 1/4 CPU 核数)<br/>- `0`: 使用默认值 (1/4 CPU 核数)<br/>- `1`: 单线程扫描<br/>- `n`: 按并行度 n 扫描   |
| `index` | -- | -- | Mito 引擎中索引的选项。 |
| `index.aux_path` | 字符串 | `""` | 文件系统中索引的辅助目录路径，用于存储创建索引的中间文件和搜索索引的暂存文件，默认为 `{data_home}/index_intermediate`。为了向后兼容，该目录的默认名称为 `index_intermediate`。此路径包含两个子目录：- `__intm`: 用于存储创建索引时使用的中间文件。- `staging`: 用于存储搜索索引时使用的暂存文件。 |
| `index.staging_size` | 字符串 | `2GB` | 暂存目录的最大容量。 |
| `index.metadata_cache_size` | 字符串 | `64MiB` | 索引元数据的缓存大小。 |
| `index.content_cache_size` | 字符串 | `128MiB` | 索引内容的缓存大小。 |
| `index.content_cache_page_size` | 字符串 | `64KiB` | 倒排索引内容缓存的页大小。 |
| `inverted_index.create_on_flush`         | 字符串 | `auto`        | 是否在 flush 时构建索引<br/>- `auto`: 自动<br/>- `disable`: 从不                                                       |
| `inverted_index.create_on_compaction`    | 字符串 | `auto`        | 是否在 compaction 时构建索引<br/>- `auto`: 自动<br/>- `disable`: 从不                                                  |
| `inverted_index.apply_on_query`          | 字符串 | `auto`        | 是否在查询时使用索引<br/>- `auto`: 自动<br/>- `disable`: 从不                                                          |
| `inverted_index.mem_threshold_on_create` | 字符串 | `64M`         | 创建索引时如果超过该内存阈值则改为使用外部排序<br/>设置为空会关闭外排，在内存中完成所有排序                            |
| `inverted_index.intermediate_path`       | 字符串 | `""`          | 存放外排临时文件的路径 (默认 `{data_home}/index_intermediate`).                                                        |
| `memtable.type`                          | 字符串 | `time_series` | Memtable type.<br/>- `time_series`: time-series memtable<br/>- `partition_tree`: partition tree memtable (实验性功能)  |
| `memtable.index_max_keys_per_shard`      | 整数   | `8192`        | 一个 shard 内的主键数<br/>只对 `partition_tree` memtable 生效                                                          |
| `memtable.data_freeze_threshold`         | 整数   | `32768`       | 一个 shard 内写缓存可容纳的最大行数<br/>只对 `partition_tree` memtable 生效                                            |
| `memtable.fork_dictionary_bytes`         | 字符串 | `1GiB`        | 主键字典的大小<br/>只对 `partition_tree` memtable 生效                                                                 |

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
有关如何使用此功能的说明，请参见 [监控](/user-guide/administration/monitoring/export-metrics.md) 指南。

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

### 心跳配置
心跳配置在 `frontend` 和 `datanode` 中可用。
```toml
[heartbeat]
interval = "3s"
retry_interval = "3s"
```

| 键                          | 类型  | 默认值  | 描述                                                       |
|----------------------------|-----|------|----------------------------------------------------------|
| `heartbeat`                | --  | --   | --                                                       |
| `heartbeat.interval`       | 字符串 | `3s` | 向 Metasrv 发送心跳信息的时间间隔                                    |
| `heartbeat.retry_interval` | 字符串 | `3s` | 向 Metasrv 重试建立心跳连接的时间间隔。（注意在 Datanode 的心跳实现中，这个配置是被忽略的，因为 Datanode 必须在保活机制的租约期内通过心跳完成续租，也就是说其 retry 有特殊策略不允许自定义配置。） |

### 默认时区配置

`default_timezone` 选项适用于 `frontend` 模块和 `standalone` 模式，默认值为 `UTC`。
它指定了与 GreptimeDB 交互时的客户端默认时区。
如果在客户端中[指定了时区](/user-guide/timezone.md#在客户端中指定时区)，此选项将在该客户端会话中被覆盖。

```toml
default_timezone = "UTC"
```

`default_timezone` 的值可以是任何时区名称，例如 `Europe/Berlin` 或 `Asia/Shanghai`。
有关客户端时区如何影响数据的写入和查询，请参阅[时区](/user-guide/timezone.md#时区对-sql-语句的影响)文档。

### 仅限于 Metasrv 的配置

```toml
# 工作主目录。
data_home = "/tmp/metasrv/"
# metasrv 的绑定地址，默认为 "127.0.0.1:3002"。
bind_addr = "127.0.0.1:3002"
# frontend 和 datanode 连接到 metasrv 的通信服务器地址，本地默认为 "127.0.0.1:3002"。
server_addr = "127.0.0.1:3002"
# metasrv 存储端服务器地址，默认为 "127.0.0.1:2379"。
# 根据你的存储服务器类型配置地址，例如：
# - 使用 "127.0.0.1:2379" 连接到 etcd
# - 使用 "password=password dbname=postgres user=postgres host=localhost port=5432" 连接到 postgres
store_addr = "127.0.0.1:2379"
# Datanode 选择器类型。
# - "lease_based" (默认值)
# - "load_based"
# 详情请参阅 "https://docs.greptime.com/contributor-guide/meta/selector"
selector = "lease_based"
# 将数据存储在内存中，默认值为 false。
use_memory_store = false
## 是否启用 region failover。
## 该功能仅适用于运行在集群模式下的 GreptimeDB，并且
## - 使用 Remote WAL
## - 使用共享存储（例如 s3）。
enable_region_failover = false
# metasrv 的数据库类型.
## 可选项：
## - "etcd_store" (默认值)
## - "memory_store" (纯内存存储 - 仅用于测试)
## - "postgres_store"
backend = "etcd_store"

## Procedure 选项
[procedure]

## 最大重试次数
max_retry_times = 12

## 程序的初始重试延迟
retry_delay = "500ms"

# Failure detector 选项
[failure_detector]

## Failure detector 检测阈值
threshold = 8.0

## 心跳间隔的最小标准差，用于计算可接受的变化。
min_std_deviation = "100ms"

## 心跳之间可接受的暂停时间长度。
acceptable_heartbeat_pause = "10000ms"

## 首次心跳间隔的估计值。
first_heartbeat_estimate = "1000ms"

## Datanode 选项。
[datanode]

## Datanode 客户端配置。
[datanode.client]

## 操作超时时间
timeout = "10s"

## 连接服务器超时时间。
connect_timeout = "10s"

## 接受连接时的 `TCP_NODELAY` 选项，默认为 true。
tcp_nodelay = true

[wal]
# 可用的 WAL 提供者：
# - `raft_engine`（默认）：由于 metasrv 目前仅涉及远程 WAL，因此没有 raft-engine WAL 配置。
# - `kafka`：在 datanode 中使用 kafka WAL 提供者时，metasrv **必须** 配置 kafka WAL 配置。
provider = "raft_engine"

# Kafka WAL 配置。

## Kafka 集群的代理端点。
broker_endpoints = ["127.0.0.1:9092"]

## 自动为 WAL 创建 topics
## 设置为 `true` 则自动为 WAL 创建 topics
## 否则，使用名为 `topic_name_prefix_[0..num_topics)` 的 topics
auto_create_topics = true

## Topic 数量。
num_topics = 64

## Topic selector 类型。
## 可用的 selector 类型：
## - `round_robin`（默认）
selector_type = "round_robin"

## Kafka topic 通过连接 `topic_name_prefix` 和 `topic_id` 构建。
topic_name_prefix = "greptimedb_wal_topic"

## 每个分区的预期副本数。
replication_factor = 1

## 超过此时间创建 topic 的操作将被取消。
create_topic_timeout = "30s"

## Kafka 客户端的 backoff 初始时间。
backoff_init = "500ms"

## Kafka 客户端的 backoff 最大时间。
backoff_max = "10s"

## backoff 指数，即下一个 backoff 时间 = 该指数 * 当前 backoff 时间。
backoff_base = 2

## 如果总等待时间达到截止时间，则停止重新连接。如果此配置缺失，则重新连接不会终止。
backoff_deadline = "5mins"
```

| 键                                            | 类型    | 默认值               | 描述                                                                                                                                 |
| --------------------------------------------- | ------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `data_home`                                   | String  | `/tmp/metasrv/`      | 工作目录。                                                                                                                           |
| `bind_addr`                                   | String  | `127.0.0.1:3002`     | Metasrv 的绑定地址。                                                                                                                 |
| `server_addr`                                 | String  | `127.0.0.1:3002`     | 前端和 datanode 连接到 Metasrv 的通信服务器地址，默认为本地主机的 `127.0.0.1:3002`。                                                 |
| `store_addrs`                                 | Array   | `["127.0.0.1:2379"]`     | 元数据服务地址，默认值为 `["127.0.0.1:2379"]`。支持配置多个服务地址，格式为 `["ip1:port1","ip2:port2",...]`。默认使用 Etcd 做为元数据后端。<br/>根据你的存储服务器类型配置地址，例如：<br/>- 使用 `"127.0.0.1:2379"` 连接到 etcd<br/>- 使用 `"password=password dbname=postgres user=postgres host=localhost port=5432"` 连接到 postgres |
| `selector`                                    | String  | `lease_based`        | 创建新表时选择 datanode 的负载均衡策略，详见 [选择器](/contributor-guide/metasrv/selector.md)。                                      |
| `use_memory_store`                            | Boolean | `false`              | 仅用于在没有 etcd 集群时的测试，将数据存储在内存中，默认值为 `false`。                                                               |
| enable_region_failover                        | Bool    | false                | 是否启用 region failover。<br/>该功能仅在以集群模式运行的 GreptimeDB 上可用，并且<br/>- 使用远程 WAL<br/>- 使用共享存储（如 s3）。   |
| `backend`                                     | String  | `etcd_store`           | 元数据存储类型。<br/>- `etcd_store` (默认)<br/>- `memory_store` (纯内存存储 - 仅用于测试)<br/>- `postgres_store`|
| `meta_table_name` | String | `greptime_metakv` | 使用 RDS 存储元数据时的表名。**仅在 backend 为  postgre_store 时有效。** |
| `meta_election_lock_id` | Integer | `1` | 用于领导选举的 PostgreSQL 咨询锁 id。**仅在 backend 为  postgre_store 时有效。** |
| `procedure`                                   | --      | --                   |                                                                                                                                      |
| `procedure.max_retry_times`                   | 整数    | `12`                 | Procedure 的最大重试次数。                                                                                                           |
| `procedure.retry_delay`                       | 字符串  | `500ms`              | Procedure 初始重试延迟，延迟会指数增长。                                                                                             |
| `failure_detector`                            | --      | --                   | 故障检测选项。                                                                                                                       |
| `failure_detector.threshold`                  | 浮点数  | `8.0`                | Failure detector 用来判断故障条件的阈值。                                                                                            |
| `failure_detector.min_std_deviation`          | 字符串  | `100ms`              | 心跳间隔的最小标准差，用于计算可接受的变动范围。                                                                                     |
| `failure_detector.acceptable_heartbeat_pause` | 字符串  | `10000ms`            | 允许的最大心跳暂停时间，用于确定心跳间隔是否可接受。                                                                                 |
| `failure_detector.first_heartbeat_estimate`   | 字符串  | `1000ms`             | 初始心跳间隔估算值。                                                                                                                 |
| `datanode`                                    | --      | --                   |                                                                                                                                      |
| `datanode.client`                             | --      | --                   | Datanode 客户端选项。                                                                                                                |
| `datanode.client.timeout`                     | 字符串  | `10s`                | 操作超时。                                                                                                                           |
| `datanode.client.connect_timeout`             | 字符串  | `10s`                | 连接服务器超时。                                                                                                                     |
| `datanode.client.tcp_nodelay`                 | 布尔值  | `true`               | 接受连接的 `TCP_NODELAY` 选项。                                                                                                      |
| wal                                           | --      | --                   | --                                                                                                                                   |
| wal.provider                                  | String  | raft_engine          | --                                                                                                                                   |
| wal.broker_endpoints                          | Array   | --                   | Kafka 集群的端点                                                                                                                     |
| `wal.auto_create_topics`                      | Bool    | `true`               | 自动为 WAL 创建 topics <br/>设置为 `true` 则自动为 WAL 创建 topics <br/>否则，使用名为 `topic_name_prefix_[0..num_topics)` 的 topics |
| `wal.num_topics`                              | Integer | `64`                 | Topic 数量                                                                                                                           |
| wal.selector_type                             | String  | round_robin          | topic selector 类型 <br/>可用 selector 类型：<br/>- round_robin（默认）                                                              |
| wal.topic_name_prefix                         | String  | greptimedb_wal_topic | 一个 Kafka topic 是通过连接 topic_name_prefix 和 topic_id 构建的                                                                     |
| wal.replication_factor                        | Integer | 1                    | 每个分区的副本数                                                                                                                     |
| wal.create_topic_timeout                      | String  | 30s                  | 超过该时间后，topic 创建操作将被取消                                                                                                 |
| wal.backoff_init                              | String  | 500ms                | Kafka 客户端的 backoff 初始时间                                                                                                      |
| wal.backoff_max                               | String  | 10s                  | Kafka 客户端的 backoff 最大时间                                                                                                      |
| wal.backoff_base                              | Integer | 2                    | backoff 指数，即下一个 backoff 时间 = 该指数 \* 当前 backoff 时间                                                                    |
| wal.backoff_deadline                          | String  | 5mins                | 如果总等待时间达到截止时间，则停止重新连接。如果此配置缺失，则重新连接不会终止                                                       |
| `wal.sasl`                                    | String  | --                   | Kafka 客户端 SASL 配置                                                                                                               |
| `wal.sasl.type`                               | String  | --                   | SASL 机制, 可选值: `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`                                                                         |
| `wal.sasl.username`                           | String  | --                   | SASL 鉴权用户名                                                                                                                      |
| `wal.sasl.password`                           | String  | --                   | SASL 鉴权密码                                                                                                                        |
| `wal.tls`                                     | String  | --                   | Kafka 客户端 TLS 配置                                                                                                                |
| `wal.tls.server_ca_cert_path`                 | String  | --                   | 服务器 CA 证书地址                                                                                                                   |
| `wal.tls.client_cert_path`                    | String  | --                   | 客户端证书地址（用于启用 mTLS）                                                                                                      |
| `wal.tls.client_key_path`                     | String  | --                   | 客户端密钥地址（用于启用 mTLS）                                                                                                      |

### 仅限于 `Datanode` 的配置

```toml
node_id = 42
rpc_hostname = "127.0.0.1"
rpc_addr = "127.0.0.1:3001"
rpc_runtime_size = 8
```

| Key              | Type   | Description                                 |
| ---------------- | ------ | ------------------------------------------- |
| node_id          | 整数   | 该 `datanode` 的唯一标识符。                |
| rpc_hostname     | 字符串 | 该 `datanode` 的 Hostname。                 |
| rpc_addr         | 字符串 | gRPC 服务端地址，默认为`"127.0.0.1:3001"`。 |
| rpc_runtime_size | 整数   | gRPC 服务器工作线程数，默认为 8。           |

### 仅限于 `Frontend` 的配置

```toml
[datanode]
[datanode.client]
connect_timeout = "1s"
tcp_nodelay = true
```

| Key                               | Type | Default | Description             |
|-----------------------------------|------|---------|-------------------------|
| `datanode`                        | --   | --      |                         |
| `datanode.client`                 | --   | --      | Datanode 客户端选项。         |
| `datanode.client.connect_timeout` | 字符串  | `1s`    | 连接服务器超时。                |
| `datanode.client.tcp_nodelay`     | 布尔值  | `true`  | 接受连接的 `TCP_NODELAY` 选项。 |
