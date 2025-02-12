---
keywords: [configuration, command line options, configuration file, environment variables, default values]
description: Detailed guide on configuring GreptimeDB, including command line options, configuration file options, environment variables, and default values for various components and features.
---

# Configuration

GreptimeDB supports **layered configuration** and uses the following precedence order(each item takes precedence over the item below it):

- Command-line options
- Configuration file
- Environment variables
- Default values

This page describes methods for configuring GreptimeDB server settings. Configuration can be set in TOML file.

The system assigns a default value for missing parameters in the configuration file.

All sample configuration files are in the project's [config](https://github.com/GreptimeTeam/greptimedb/tree/main/config) folder.

## Command-line options

See [Command lines](/reference/command-lines.md) to learn how to use the `greptime` command line.

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
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--metasrv-addrs <METASRV_ADDR>`: Metasrv address list;
- `--node-id <NODE_ID>`: The datanode ID;
- `--rpc-addr <RPC_ADDR>`: The datanode RPC addr;
- `--rpc-hostname <RPC_HOSTNAME>`: The datanode hostname;
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
- `--bind-addr <BIND_ADDR>`: The bind address of metasrv;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--selector <SELECTOR>`: You can refer [selector-type](/contributor-guide/metasrv/selector.md#selector-type);
- `--server-addr <SERVER_ADDR>`: The communication server address for frontend and datanode to connect to metasrv;
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
- `--rpc-addr <RPC_ADDR>`: GRPC server address;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--influxdb-enable`: Whether to enable InfluxDB protocol in HTTP API;
- `--metasrv-addr <METASRV_ADDR>`: Metasrv address list;
- `--mysql-addr <MYSQL_ADDR>`: MySQL server address;
- `--postgres-addr <POSTGRES_ADDR>`: Postgres server address;
- `--tls-cert-path <TLS_CERT_PATH>`: The TLS public key file path;
- `--tls-key-path <TLS_KEY_PATH>`: The TLS private key file path;
- `--tls-mode <TLS_MODE>`: TLS Mode;
- `--user-provider <USER_PROVIDER>`: You can refer [authentication](/user-guide/clients/authentication.md);

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
- `--rpc-addr <RPC_ADDR>`:  gRPC server address;


## Configuration File

### Examples

Configurations can be used in one or multiple components according to their features.
This document only contains examples for frequently used configurations. Please refer to the auto-generated [document](https://github.com/GreptimeTeam/greptimedb/blob/main/config/config.md) for all available configurations.

You can find all available configurations for each component on GitHub:

- [standalone](https://github.com/GreptimeTeam/greptimedb/blob/main/config/standalone.example.toml)
- [frontend](https://github.com/GreptimeTeam/greptimedb/blob/main/config/frontend.example.toml)
- [datanode](https://github.com/GreptimeTeam/greptimedb/blob/main/config/datanode.example.toml)
- [metasrv](https://github.com/GreptimeTeam/greptimedb/blob/main/config/metasrv.example.toml)


### Specify configuration file

You can specify the configuration file by using the command line arg `-c [file_path]`.

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

For example, start the standalone as below:

```bash
greptime standalone start -c standalone.example.toml
```

### Protocol options

Protocol options are valid in `frontend` and `standalone` sub commands, which specify the protocol server addresses and other protocol-related options.

Below is an example configuration with default values.
The HTTP and gRPC protocols must be enabled for the database to work correctly.
The other protocols are optional.
If you want to disable certain protocols, such as OpenTSDB protocol support, you can set the `enable` parameter to `false`.

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
with_metric_engine = true
```

The following table describes the options in detail:

| Option     | Key                | Type    | Description                                                                     |
| ---------- | ------------------ | ------- | ------------------------------------------------------------------------------- |
| http       |                    |         | HTTP server options                                                             |
|            | addr               | String  | Server address, "127.0.0.1:4000" by default                                     |
|            | timeout            | String  | HTTP request timeout, "30s" by default                                          |
|            | body_limit         | String  | HTTP max body size, "64MB" by default                                           |
|            | is_strict_mode     | Boolean | Whether to enable the strict verification mode of the protocol, which will slightly affect performance. False by default.                          |
| grpc       |                    |         | gRPC server options                                                             |
|            | addr               | String  | Server address, "127.0.0.1:4001" by default                                     |
|            | runtime_size       | Integer | The number of server worker threads, 8 by default                               |
| mysql      |                    |         | MySQL server options                                                            |
|            | enable             | Boolean | Whether to enable MySQL protocol, true by default                               |
|            | add                | String  | Server address, "127.0.0.1:4002" by default                                     |
|            | runtime_size       | Integer | The number of server worker threads, 2 by default                               |
| influxdb   |                    |         | InfluxDB Protocol options                                                       |
|            | enable             | Boolean | Whether to enable InfluxDB protocol in HTTP API, true by default                |
| opentsdb   |                    |         | OpenTSDB Protocol options                                                       |
|            | enable             | Boolean | Whether to enable OpenTSDB protocol in HTTP API, true by default                |
| prom_store |                    |         | Prometheus remote storage options                                               |
|            | enable             | Boolean | Whether to enable Prometheus Remote Write and read in HTTP API, true by default |
|            | with_metric_engine | Boolean | Whether to use the metric engine on Prometheus Remote Write, true by default    |
| postgres   |                    |         | PostgresSQL server options                                                      |
|            | enable             | Boolean | Whether to enable PostgresSQL protocol, true by default                         |
|            | addr               | String  | Server address, "127.0.0.1:4003" by default                                     |
|            | runtime_size       | Integer | The number of server worker threads, 2 by default                               |

### Storage options

The `storage` options are valid in datanode and standalone mode, which specify the database data directory and other storage-related options.

GreptimeDB supports storing data in local file system, AWS S3 and compatible services (including MinIO, digitalocean space, Tencent Cloud Object Storage(COS), Baidu Object Storage(BOS) and so on), Azure Blob Storage and Aliyun OSS.

| Option  | Key               | Type   | Description                                                   |
| ------- | ----------------- | ------ | ------------------------------------------------------------- |
| storage |                   |        | Storage options                                               |
|         | type              | String | Storage type, supports "File", "S3" and "Oss" etc.            |
| File    |                   |        | Local file storage options, valid when type="File"            |
|         | data_home         | String | Database storage root directory, "/tmp/greptimedb" by default |
| S3      |                   |        | AWS S3 storage options, valid when type="S3"                  |
|         | bucket            | String | The S3 bucket name                                            |
|         | root              | String | The root path in S3 bucket                                    |
|         | endpoint          | String | The API endpoint of S3                                        |
|         | region            | String | The S3 region                                                 |
|         | access_key_id     | String | The S3 access key id                                          |
|         | secret_access_key | String | The S3 secret access key                                      |
| Oss     |                   |        | Aliyun OSS storage options, valid when type="Oss"             |
|         | bucket            | String | The OSS bucket name                                           |
|         | root              | String | The root path in OSS bucket                                   |
|         | endpoint          | String | The API endpoint of OSS                                       |
|         | access_key_id     | String | The OSS AccessKey ID                                         |
|         | access_key_secret | String | The OSS AccessKey Secret                                     |
| Azblob  |                   |        | Azure Blob Storage options, valid when type="Azblob"          |
|         | container         | String | The container name                                            |
|         | root              | String | The root path in container                                    |
|         | endpoint          | String | The API endpoint of Azure Blob Storage                        |
|         | account_name      | String | The account name of Azure Blob Storage                        |
|         | account_key       | String | The access key                                                |
|         | sas_token         | String | The shared access signature                                   |
| Gsc     |                   |        | Google Cloud Storage options, valid when type="Gsc"           |
|         | root              | String | The root path in Gsc bucket                                   |
|         | bucket            | String | The Gsc bucket name                                           |
|         | scope             | String | The Gsc service scope                                         |
|         | credential_path   | String | The Gsc credentials path                                      |
|         | endpoint          | String | The API endpoint of Gsc                                       |

A file storage sample configuration:

```toml
[storage]
type = "File"
data_home = "/tmp/greptimedb/"
```

A S3 storage sample configuration:

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
```

### Storage engine provider

`[[storage.providers]]`  setups the table storage engine providers. Based on these providers,  you can create a table with a specified storage, see [create table](/reference/sql/create.md#create-table):

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

All configured providers can be used as the `storage` option when creating tables.

### Object storage cache

When using S3, OSS or Azure Blob Storage, it's better to enable object storage caching for speedup data querying:

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
## Enable object storage caching
cache_path = "/var/data/s3_local_cache"
cache_capacity = "256MiB"
```

The `cache_path` is the local file directory that keeps cache files, and the `cache_capacity` is the maximum total file size in the cache directory.

### WAL options

The `[wal]` section in datanode or standalone config file configures the options of Write-Ahead-Log:

```toml
[wal]
file_size = "256MB"
purge_threshold = "4GB"
purge_interval = "10m"
read_batch_size = 128
sync_write = false
```

- `dir`: is the directory where to write logs. When using `File` storage, it's `{data_home}/wal` by default. It must be configured explicitly when using other storage types such as `S3` etc.
- `file_size`: the maximum size of the WAL log file, default is `256MB`.
- `purge_threshold` and `purge_interval`: control the purging of wal files, default is `4GB`.
- `sync_write`: whether to call `fsync` when writing every log.

### Logging options

`frontend`, `metasrv`, `datanode` and `standalone` can all configure log and tracing related parameters in the `[logging]` section:

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

- `dir`: log output directory.
- `level`: output log level, available log level are `info`, `debug`, `error`, `warn`, the default level is `info`.
- `enable_otlp_tracing`: whether to turn on tracing, not turned on by default.
- `otlp_endpoint`: Export the target endpoint of tracing using gRPC-based OTLP protocol, the default value is `localhost:4317`.
- `append_stdout`: Whether to append logs to stdout. Defaults to `true`.
- `tracing_sample_ratio`: This field can configure the sampling rate of tracing. How to use `tracing_sample_ratio`, please refer to [How to configure tracing sampling rate](./tracing.md#guide-how-to-configure-tracing-sampling-rate).

How to use distributed tracing, please reference [Tracing](./tracing.md#tutorial-use-jaeger-to-trace-greptimedb)

### Region engine options

The parameters corresponding to different storage engines can be configured for `datanode` and `standalone` in the `[region_engine]` section. Currently, only options for `mito` region engine is available.


Frequently used options:

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


The `mito` engine provides an experimental memtable which optimizes for write performance and memory efficiency under large amounts of time-series. Its read performance might not as fast as the default `time_series` memtable.
```toml
[region_engine.mito.memtable]
type = "partition_tree"
index_max_keys_per_shard = 8192
data_freeze_threshold = 32768
fork_dictionary_bytes = "1GiB"
```

Available options:

| Key | Type | Default | Descriptions |
| --- | -----| ------- | ----------- |
| `num_workers` | Integer | `8` | Number of region workers. |
| `manifest_checkpoint_distance` | Integer | `10` | Number of meta action updated to trigger a new checkpoint for the manifest. |
| `max_background_jobs` | Integer | `4` | Max number of running background jobs |
| `auto_flush_interval` | String | `1h` | Interval to auto flush a region if it has not flushed yet. |
| `global_write_buffer_size` | String | `1GB` | Global write buffer size for all regions. If not set, it's default to 1/8 of OS memory with a max limitation of 1GB. |
| `global_write_buffer_reject_size` | String | `2GB` | Global write buffer size threshold to reject write requests. If not set, it's default to 2 times of `global_write_buffer_size` |
| `sst_meta_cache_size` | String | `128MB` | Cache size for SST metadata. Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/32 of OS memory with a max limitation of 128MB. |
| `vector_cache_size` | String | `512MB` | Cache size for vectors and arrow arrays. Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/16 of OS memory with a max limitation of 512MB. |
| `page_cache_size` | String | `512MB` | Cache size for pages of SST row groups. Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/16 of OS memory with a max limitation of 512MB. |
| `sst_write_buffer_size` | String | `8MB` | Buffer size for SST writing. |
| `scan_parallelism` | Integer | `0` | Parallelism to scan a region (default: 1/4 of cpu cores).<br/>- `0`: using the default value (1/4 of cpu cores).<br/>- `1`: scan in current thread.<br/>- `n`: scan in parallelism n. |
| `inverted_index` | -- | -- | The options for inverted index in Mito engine. |
| `inverted_index.create_on_flush` | String | `auto` | Whether to create the index on flush.<br/>- `auto`: automatically<br/>- `disable`: never |
| `inverted_index.create_on_compaction` | String | `auto` | Whether to create the index on compaction.<br/>- `auto`: automatically<br/>- `disable`: never |
| `inverted_index.apply_on_query` | String | `auto` | Whether to apply the index on query<br/>- `auto`: automatically<br/>- `disable`: never |
| `inverted_index.mem_threshold_on_create` | String | `64M` | Memory threshold for performing an external sort during index creation.<br/>Setting to empty will disable external sorting, forcing all sorting operations to happen in memory. |
| `inverted_index.intermediate_path` | String | `""` | File system path to store intermediate files for external sorting (default `{data_home}/index_intermediate`). |
| `memtable.type` | String | `time_series` | Memtable type.<br/>- `time_series`: time-series memtable<br/>- `partition_tree`: partition tree memtable (experimental) |
| `memtable.index_max_keys_per_shard` | Integer | `8192` | The max number of keys in one shard.<br/>Only available for `partition_tree` memtable. |
| `memtable.data_freeze_threshold` | Integer | `32768` | The max rows of data inside the actively writing buffer in one shard.<br/>Only available for `partition_tree` memtable. |
| `memtable.fork_dictionary_bytes` | String | `1GiB` | Max dictionary bytes.<br/>Only available for `partition_tree` memtable. |


### Specify meta client

The `meta_client` options are valid in `datanode` and `frontend` mode, which specify the Metasrv client information.

```toml
metasrv_addrs = ["127.0.0.1:3002"]
timeout = "3s"
connect_timeout = "1s"
ddl_timeout = "10s"
tcp_nodelay = true
```

The `meta_client` configures the Metasrv client, including:

- `metasrv_addrs`: The Metasrv address list.
- `timeout`: operation timeout, `3s` by default.
- `connect_timeout`, connect server timeout, `1s` by default.
- `ddl_timeout`, DDL execution timeout, `10s` by default.
- `tcp_nodelay`, `TCP_NODELAY` option for accepted connections, true by default.

### Monitor metrics options

These options are used to save system metrics to GreptimeDB itself.
For instructions on how to use this feature, please refer to the [Monitoring](/user-guide/operations/monitoring.md) guide.

```toml
[export_metrics]
# Whether to enable export_metrics
enable=true
# Export time interval
write_interval = "30s"
```

- `enable`: Whether to enable export_metrics, `false` by default.
- `write_interval`: Export time interval.

#### `self_import` method

Only `frontend` and `standalone` support exporting metrics using `self_import` method.

```toml
[export_metrics]
# Whether to enable export_metrics
enable=true
# Export time interval
write_interval = "30s"
[export_metrics.self_import]
db = "information_schema"
```

- `db`: The default database used by `self_import` is `information_schema`. You can also create another database for saving system metrics.

#### `remote_write` method

The `remote_write` method is supported by `datanode`, `frontend`, `metasrv`, and `standalone`.
It sends metrics to a receiver compatible with the [Prometheus Remote-Write protocol](https://prometheus.io/docs/concepts/remote_write_spec/).

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

- `url`: URL specified by Prometheus Remote-Write protocol.
- `headers`: Some optional HTTP parameters, such as authentication information.


### Mode option

The `mode` option is valid in `datanode`, `frontend` and `standalone`, which specify the running mode of the component.

In the configuration files of `datanode` and `frontend` of distributed GreptimeDB, the value needs to be set as `distributed`:

```toml
mode = "distributed"
```

In the configuration files of standalone GreptimeDB, the value needs to be set as `standalone`:

```toml
mode = "standalone"
```

### Metasrv-only configuration

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
selector = "LeaseBased"
# Store data in memory, false by default.
use_memory_store = false
```

| Key              | Type    | Description                                                                                                                             |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| data_home        | String  | The working home of Metasrv, `"/tmp/metasrv/"` by default                                                                               |
| bind_addr        | String  | The bind address of Metasrv, `"127.0.0.1:3002"` by default.                                                                             |
| server_addr      | String  | The communication server address for frontend and datanode to connect to Metasrv, `"127.0.0.1:3002"` by default for localhost           |
| store_addr       | String  | etcd server addresses, `"127.0.0.1:2379"` by default, server address separated by commas, in the format of `"ip1:port1,ip2:port2,..."`. |
| selector         | String  | Load balance strategy to choose datanode when creating new tables, see [Selector](/contributor-guide/metasrv/selector.md)               |
| use_memory_store | Boolean | Only used for testing when you don't have an etcd cluster, store data in memory, `false` by default.                                    |

### Datanode-only configuration

```toml
node_id = 42
rpc_hostname = "127.0.0.1"
rpc_addr = "127.0.0.1:3001"
rpc_runtime_size = 8
```

| Key              | Type    | Description                                             |
| ---------------- | ------- | ------------------------------------------------------- |
| node_id          | Integer | The datanode identifier, should be unique.              |
| rpc_hostname     | String  | Hostname of this node.                                  |
| rpc_addr         | String  | gRPC server address, `"127.0.0.1:3001"` by default.     |
| rpc_runtime_size | Integer | The number of gRPC server worker threads, 8 by default. |

## Environment variable

Every item in the configuration file can be mapped into environment variables. For example, if we want to set the configuration item `data_home` of the datanode by environment variable:

```toml
# ...
[storage]
data_home = "/data/greptimedb"
# ...
```

You can use the following shell command to setup the environment variable as the following format:

```
export GREPTIMEDB_DATANODE__STORAGE__DATA_HOME=/data/greptimedb
```

### Environment Variable Rules

- Every environment variable should have the component prefix, for example:

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- We use **double underscore `__`** as a separator. For example, the above data structure `storage.data_home` will be transformed to `STORAGE__DATA_HOME`.

The environment variable also accepts list that are separated by a comma `,`, for example:

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```
