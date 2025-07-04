---
keywords: [configuration, command line options, configuration file, environment variables, default values]
description: Detailed guide on configuring GreptimeDB, including command line options, configuration file options, environment variables, and default values for various components and features.
---

# Configuration

GreptimeDB supports **layered configuration** with the following precedence order (where each item overrides the one below it):

- Greptime command line options
- Configuration file options
- Environment variables
- Default values

You only need to set up the configurations you require.
GreptimeDB will assign default values for any settings not configured.

## How to set up configurations

### Greptime command line options

You can specify several configurations using command line arguments.
For example, to start GreptimeDB in standalone mode with a configured HTTP address:

```shell
greptime standalone start --http-addr 127.0.0.1:4000
```

For all the options supported by the Greptime command line,
refer to the [GreptimeDB Command Line Interface](/reference/command-lines.md).

### Configuration file options

You can specify configurations in a TOML file.
For example, create a configuration file `standalone.example.toml` as shown below:

```toml
[storage]
type = "File"
data_home = "./greptimedb_data/"
```

Then, specify the configuration file using the command line argument `-c [file_path]`.

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

For example, to start in standalone mode:

```bash
greptime standalone start -c standalone.example.toml
```

#### Example files

Below are example configuration files for each GreptimeDB component,
including all available configurations.
In actual scenarios,
you only need to configure the required options and do not need to configure all options as in the sample file.

- [standalone](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/standalone.example.toml)
- [frontend](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/frontend.example.toml)
- [datanode](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/datanode.example.toml)
- [flownode](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/flownode.example.toml)
- [metasrv](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/metasrv.example.toml)

### Environment variable

Every item in the configuration file can be mapped to environment variables.
For example, to set the `data_home` configuration item for the datanode using an environment variable:

```toml
# ...
[storage]
data_home = "/data/greptimedb"
# ...
```

Use the following shell command to set the environment variable in the following format:

```
export GREPTIMEDB_DATANODE__STORAGE__DATA_HOME=/data/greptimedb
```

#### Environment Variable Rules

- Each environment variable should have the component prefix, for example:

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- Use **double underscore `__`** separators. For example, the data structure `storage.data_home` is transformed to `STORAGE__DATA_HOME`.

The environment variable also accepts lists that are separated by commas `,`, for example:

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```

## Options

In this section, we will introduce some main configuration options.
For all options, refer to the [Configuration Reference](https://github.com/GreptimeTeam/greptimedb/blob/VAR::greptimedbVersion/config/config.md) on Github.

### Protocol options

Protocol options are valid in `frontend` and `standalone` subcommands,
specifying protocol server addresses and other protocol-related options.

Below is an example configuration with default values.
You can change the values or disable certain protocols in your configuration file.
For example, to disable OpenTSDB protocol support, set the `enable` parameter to `false`.
Note that HTTP and gRPC protocols cannot be disabled for the database to function correctly.

```toml
[http]
addr = "127.0.0.1:4000"
timeout = "30s"
body_limit = "64MB"

[grpc]
bind_addr = "127.0.0.1:4001"
runtime_size = 8

[mysql]
enable = true
addr = "127.0.0.1:4002"
runtime_size = 2

[mysql.tls]
mode = "disable"
cert_path = ""
key_path = ""
watch = false

[postgres]
enable = true
addr = "127.0.0.1:4003"
runtime_size = 2

[postgres.tls]
mode = "disable"
cert_path = ""
key_path = ""
watch = false

[opentsdb]
enable = true

[influxdb]
enable = true

[prom_store]
enable = true
with_metric_engine = true
```

The following table describes the options in detail:

| Option     | Key                | Type    | Description                                                                                                               |
| ---------- | ------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| http       |                    |         | HTTP server options                                                                                                       |
|            | addr               | String  | Server address, "127.0.0.1:4000" by default                                                                               |
|            | timeout            | String  | HTTP request timeout, "30s" by default                                                                                    |
|            | body_limit         | String  | HTTP max body size, "64MB" by default                                                                                     |
|            | is_strict_mode     | Boolean | Whether to enable the strict verification mode of the protocol, which will slightly affect performance. False by default. |
| grpc       |                    |         | gRPC server options                                                                                                       |
|            | bind_addr          | String  | The address to bind the gRPC server, "127.0.0.1:4001" by default                                                                               |
|            | runtime_size       | Integer | The number of server worker threads, 8 by default                                                                         |
| mysql      |                    |         | MySQL server options                                                                                                      |
|            | enable             | Boolean | Whether to enable MySQL protocol, true by default                                                                         |
|            | addr               | String  | Server address, "127.0.0.1:4002" by default                                                                               |
|            | runtime_size       | Integer | The number of server worker threads, 2 by default                                                                         |
| influxdb   |                    |         | InfluxDB Protocol options                                                                                                 |
|            | enable             | Boolean | Whether to enable InfluxDB protocol in HTTP API, true by default                                                          |
| opentsdb   |                    |         | OpenTSDB Protocol options                                                                                                 |
|            | enable             | Boolean | Whether to enable OpenTSDB protocol in HTTP API, true by default                                                          |
| prom_store |                    |         | Prometheus remote storage options                                                                                         |
|            | enable             | Boolean | Whether to enable Prometheus Remote Write and read in HTTP API, true by default                                           |
|            | with_metric_engine | Boolean | Whether to use the metric engine on Prometheus Remote Write, true by default                                              |
| postgres   |                    |         | PostgresSQL server options                                                                                                |
|            | enable             | Boolean | Whether to enable PostgresSQL protocol, true by default                                                                   |
|            | addr               | String  | Server address, "127.0.0.1:4003" by default                                                                               |
|            | runtime_size       | Integer | The number of server worker threads, 2 by default                                                                         |

For MySQL and Postgres interface, TLS can be configured to enable transport
layer security.

| Option                        | Key         | Type    | Description                                                   |
|-------------------------------|-------------|---------|---------------------------------------------------------------|
| `mysql.tls` or `postgres.tls` |             |         | TLS configuration for MySQL and Postgres                      |
|                               | `mode`      | String  | TLS mode, options are `disable`, `prefer` and `require`       |
|                               | `cert_path` | String  | File path for TLS certificate                                 |
|                               | `key_path`  | String  | File path for TLS private key                                 |
|                               | `watch`     | Boolean | Watch file system changes and reload certificate and key file |

### Storage options

The `storage` options are valid in datanode and standalone mode, which specify the database data directory and other storage-related options.

GreptimeDB supports storing data in local file system, AWS S3 and compatible services (including MinIO, digitalocean space, Tencent Cloud Object Storage(COS), Baidu Object Storage(BOS) and so on), Azure Blob Storage and Aliyun OSS.

| Option  | Key               | Type   | Description                                                   |
| ------- | ----------------- | ------ | ------------------------------------------------------------- |
| storage |                   |        | Storage options                                               |
|         | type              | String | Storage type, supports "File", "S3" and "Oss" etc.            |
| File    |                   |        | Local file storage options, valid when type="File"            |
|         | data_home         | String | Database storage root directory, "./greptimedb_data/" by default |
| S3      |                   |        | AWS S3 storage options, valid when type="S3"                  |
|         | name            | String | The  storage provider name, default is `S3`               |
|         | bucket            | String | The S3 bucket name                                            |
|         | root              | String | The root path in S3 bucket                                    |
|         | endpoint          | String | The API endpoint of S3                                        |
|         | region            | String | The S3 region                                                 |
|         | access_key_id     | String | The S3 access key id                                          |
|         | secret_access_key | String | The S3 secret access key                                      |
|         | enable_virtual_host_style | Boolean | Send API requests in virtual host style instead of path style. Default is false. |
| Oss     |                   |        | Aliyun OSS storage options, valid when type="Oss"             |
|         | name            | String | The  storage provider name, default is `Oss`               |
|         | bucket            | String | The OSS bucket name                                           |
|         | root              | String | The root path in OSS bucket                                   |
|         | endpoint          | String | The API endpoint of OSS                                       |
|         | access_key_id     | String | The OSS AccessKey ID                                         |
|         | access_key_secret | String | The OSS AccessKey Secret                                     |
| Azblob  |                   |        | Azure Blob Storage options, valid when type="Azblob"          |
|         | name            | String | The  storage provider name, default is `Azblob`               |
|         | container         | String | The container name                                            |
|         | root              | String | The root path in container                                    |
|         | endpoint          | String | The API endpoint of Azure Blob Storage                        |
|         | account_name      | String | The account name of Azure Blob Storage                        |
|         | account_key       | String | The access key                                                |
|         | sas_token         | String | The shared access signature                                   |
| Gsc     |                   |        | Google Cloud Storage options, valid when type="Gsc"           |
|         | name            | String | The  storage provider name, default is `Gsc`               |
|         | root              | String | The root path in Gsc bucket                                   |
|         | bucket            | String | The Gsc bucket name                                           |
|         | scope             | String | The Gsc service scope                                         |
|         | credential_path   | String | The Gsc credentials path                                      |
|         | endpoint          | String | The API endpoint of Gsc                                       |

A file storage sample configuration:

```toml
[storage]
type = "File"
data_home = "./greptimedb_data/"
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

### Storage http client

`[storage.http_client]` sets the options for the http client that is used to send requests to the storage service.

Only applied for storage types "S3", "Oss", "Azblob" and "Gcs".

| Key                      | Type    | Default            | Description                                                                                                                                        |
|--------------------------|---------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `pool_max_idle_per_host` | Integer | 1024               | The maximum idle connection per host allowed in the pool.                                                                                          |
| `connect_timeout`        | String  | "30s" (30 seconds) | The timeout for only the connect phase of a http client.                                                                                           |
| `timeout`                | String  | "30s" (30 seconds) | The total request timeout, applied from when the request starts connecting until the response body has finished. Also considered a total deadline. |
| `pool_idle_timeout`      | String  | "90s" (90 seconds) | The timeout for idle sockets being kept-alive.                                                                                                     |

### Storage engine provider

`[[storage.providers]]` setups the table storage engine providers. Based on these providers, you can create a table with a specified storage, see [create table](/reference/sql/create.md#create-table):

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

All configured providers' names can be used as the `storage` option when creating tables.

For storage from the same provider, if you want to use different S3 buckets as storage engines for different tables, you can set different `name` values and specify the `storage` option when creating the table.

### Object storage cache

When using remote storage services like AWS S3, Alibaba Cloud OSS, or Azure Blob Storage, fetching data during queries can be time-consuming. To address this, GreptimeDB provides a local cache mechanism to speed up repeated data access.

GreptimeDB enables local file caching for remote object storage by default, with both read and write cache capacity set to `5GiB`.


Usually you don't have to configure the cache unless you want to specify the cache capacity.
```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
cache_capacity = "10GiB"
# cache_path = "/path/to/cache/home"
```

The `cache_path` specifies the home directory for storing cache files, while `cache_capacity` determines the maximum total file size allowed in the cache directory in bytes. You can disable the read cache by setting `cache_path` to an empty string. The default cache path is under the `{data_home}`. We recommend that you don't set the `cache_path` because the database can choose it automatically.

The write cache is no more experimental since `v0.12`. You can configure the cache size in the mito config if you don't want to use the default value.
```toml
[[region_engine]]
[region_engine.mito]

write_cache_size = "10GiB"
```

Read [Performance Tuning Tips](/user-guide/administration/performance-tuning-tips.md) for more detailed info.

### WAL options

The `[wal]` section in datanode or standalone config file configures the options of Write-Ahead-Log:

#### Local WAL

```toml
[wal]
provider = "raft_engine"
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

- `broker_endpoints`: The Kafka broker endpoints.
- `max_batch_bytes`: The max size of a single producer batch.
- `consumer_wait_timeout`: The consumer wait timeout.
- `backoff_init`: The initial backoff delay.
- `backoff_max`: The maximum backoff delay.
- `backoff_base`: The exponential backoff rate.
- `backoff_deadline`: The deadline of retries.
- `overwrite_entry_start_id`: This option ensures that when Kafka messages are accidentally deleted, the system can still successfully replay memtable data without throwing an out-of-range error. However, enabling this option might lead to unexpected data loss, as the system will skip over missing entries instead of treating them as critical errors.

##### Remote WAL Authentication (Optional)

```toml
[wal.sasl]
type = "SCRAM-SHA-512"
username = "user"
password = "secret"
```

The SASL configuration for Kafka client, available SASL mechanisms: `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.

##### Remote WAL TLS (Optional)

```toml
[wal.tls]
server_ca_cert_path = "/path/to/server_cert"
client_cert_path = "/path/to/client_cert"
client_key_path = "/path/to/key"
```

The TLS configuration for Kafka client, support modes: TLS (using system ca certs), TLS (with specified ca certs), mTLS.

Examples:

**TLS (using system ca certs)**

```toml
[wal.tls]
```

**TLS (with specified ca cert)**

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

### Logging options

`frontend`, `metasrv`, `datanode` and `standalone` can all configure log and tracing related parameters in the `[logging]` section:

```toml
[logging]
dir = "./greptimedb_data/logs"
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
- `tracing_sample_ratio`: This field can configure the sampling rate of tracing. How to use `tracing_sample_ratio`, please refer to [How to configure tracing sampling rate](/user-guide/administration/monitoring/tracing.md#guide-how-to-configure-tracing-sampling-rate).

How to use distributed tracing, please reference [Tracing](/user-guide/administration/monitoring/tracing.md#tutorial-use-jaeger-to-trace-greptimedb)

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

The `mito` engine provides an experimental memtable which optimizes for write performance and memory efficiency under large amounts of time-series. Its read performance might not as fast as the default `time_series` memtable.

```toml
[region_engine.mito.memtable]
type = "partition_tree"
index_max_keys_per_shard = 8192
data_freeze_threshold = 32768
fork_dictionary_bytes = "1GiB"
```

Available options:

| Key                                      | Type    | Default       | Descriptions                                                                                                                                                                          |
| ---------------------------------------- | ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `num_workers`                            | Integer | `8`           | Number of region workers.                                                                                                                                                             |
| `manifest_checkpoint_distance`           | Integer | `10`          | Number of meta action updated to trigger a new checkpoint for the manifest.                                                                                                           |
| `max_background_jobs`                    | Integer | `4`           | Max number of running background jobs                                                                                                                                                 |
| `auto_flush_interval`                    | String  | `1h`          | Interval to auto flush a region if it has not flushed yet.                                                                                                                            |
| `global_write_buffer_size`               | String  | `1GB`         | Global write buffer size for all regions. If not set, it's default to 1/8 of OS memory with a max limitation of 1GB.                                                                  |
| `global_write_buffer_reject_size`        | String  | `2GB`         | Global write buffer size threshold to reject write requests. If not set, it's default to 2 times of `global_write_buffer_size`                                                        |
| `sst_meta_cache_size`                    | String  | `128MB`       | Cache size for SST metadata. Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/32 of OS memory with a max limitation of 128MB.                                  |
| `vector_cache_size`                      | String  | `512MB`       | Cache size for vectors and arrow arrays. Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/16 of OS memory with a max limitation of 512MB.                      |
| `page_cache_size`                        | String  | `512MB`       | Cache size for pages of SST row groups. Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/8 of OS memory.                                                       |
| `selector_result_cache_size`             | String  | `512MB`       | Cache size for time series selector (e.g. `last_value()`). Setting it to 0 to disable the cache.<br/>If not set, it's default to 1/8 of OS memory.                                    |
| `sst_write_buffer_size`                  | String  | `8MB`         | Buffer size for SST writing.                                                                                                                                                          |
| `scan_parallelism`                       | Integer | `0`           | Parallelism to scan a region (default: 1/4 of cpu cores).<br/>- `0`: using the default value (1/4 of cpu cores).<br/>- `1`: scan in current thread.<br/>- `n`: scan in parallelism n. |
| `index` | -- | -- | The options for index in Mito engine. |
| `index.aux_path` | String | `""` | Auxiliary directory path for the index in the filesystem. This path is used to store intermediate files for creating the index and staging files for searching the index. It defaults to `{data_home}/index_intermediate`. The default name for this directory is `index_intermediate` for backward compatibility. This path contains two subdirectories: `__intm` for storing intermediate files used during index creation, and `staging` for storing staging files used during index searching. |
| `index.staging_size` | String | `2GB` | The maximum capacity of the staging directory. |
| `index.metadata_cache_size` | String | `64MiB` | Cache size for index metadata. |
| `index.content_cache_size` | String | `128MiB` | Cache size for index content. |
| `index.content_cache_page_size` | String | `64KiB` | Page size for index content cache. |
| `inverted_index`                         | --      | --            | The options for inverted index in Mito engine.                                                                                                                                        |
| `inverted_index.create_on_flush`         | String  | `auto`        | Whether to create the index on flush.<br/>- `auto`: automatically<br/>- `disable`: never                                                                                              |
| `inverted_index.create_on_compaction`    | String  | `auto`        | Whether to create the index on compaction.<br/>- `auto`: automatically<br/>- `disable`: never                                                                                         |
| `inverted_index.apply_on_query`          | String  | `auto`        | Whether to apply the index on query<br/>- `auto`: automatically<br/>- `disable`: never                                                                                                |
| `inverted_index.mem_threshold_on_create` | String  | `64M`         | Memory threshold for performing an external sort during index creation.<br/>Setting to empty will disable external sorting, forcing all sorting operations to happen in memory.       |
| `inverted_index.intermediate_path`       | String  | `""`          | File system path to store intermediate files for external sorting (default `{data_home}/index_intermediate`).                                                                         |
| `memtable.type`                          | String  | `time_series` | Memtable type.<br/>- `time_series`: time-series memtable<br/>- `partition_tree`: partition tree memtable (experimental)                                                               |
| `memtable.index_max_keys_per_shard`      | Integer | `8192`        | The max number of keys in one shard.<br/>Only available for `partition_tree` memtable.                                                                                                |
| `memtable.data_freeze_threshold`         | Integer | `32768`       | The max rows of data inside the actively writing buffer in one shard.<br/>Only available for `partition_tree` memtable.                                                               |
| `memtable.fork_dictionary_bytes`         | String  | `1GiB`        | Max dictionary bytes.<br/>Only available for `partition_tree` memtable.                                                                                                               |

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
For instructions on how to use this feature, please refer to the [Monitoring](/user-guide/administration/monitoring/export-metrics.md) guide.

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

### Heartbeat configuration
Heartbeat configuration is available in `frontend` and `datanode`.
```toml
[heartbeat]
interval = "3s"
retry_interval = "3s"
```

| Key                        | Type   | Default | Description                                                                                                                                        |
|----------------------------|--------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `heartbeat`                | --     | --      | --                                                                                                                                                 |
| `heartbeat.interval`       | String | `3s`    | Interval for sending heartbeat messages to the Metasrv.                                                                                            |
| `heartbeat.retry_interval` | String | `3s`    | Interval for retrying to establish the heartbeat connection to the Metasrv. Note that this option is ignored in Datanode heartbeat implementation because the Datanode must renew its lease through heartbeat within the keep-alive mechanism's lease period. It has a special retry strategy and doesn't allow custom configuration. |

### Default time zone configuration

The `default_timezone` option is applicable in both `frontend` and `standalone` modes, with a default value of `UTC`.
It specifies the default client timezone for interactions with GreptimeDB.
If the time zone is [specified in the clients](/user-guide/timezone.md#specify-time-zone-in-clients), this option will be overridden for that client session.

```toml
default_timezone = "UTC"
```

The `default_timezone` value can be any named time zone, such as `Europe/Berlin` or `Asia/Shanghai`.
For information on how the client time zone affects data ingestion and querying,
refer to the [Time Zone](/user-guide/timezone.md#impact-of-time-zone-on-sql-statements) guide.

### Metasrv-only configuration

```toml
# The working home directory.
data_home = "./greptimedb_data/metasrv/"
# The bind address of metasrv, "127.0.0.1:3002" by default.
bind_addr = "127.0.0.1:3002"
# The communication server address for frontend and datanode to connect to metasrv,  "127.0.0.1:3002" by default for localhost.
server_addr = "127.0.0.1:3002"
# Store server address
# Configure the address based on your backend type, for example:
# - Use "127.0.0.1:2379" to connect to etcd
# - Use "password=password dbname=postgres user=postgres host=localhost port=5432" to connect to postgres
store_addr = "127.0.0.1:2379"
# Datanode selector type.
# - "lease_based" (default value).
# - "load_based"
# For details, please see "https://docs.greptime.com/contributor-guide/meta/selector".
selector = "LeaseBased"
# Store data in memory, false by default.
use_memory_store = false
## Whether to enable region failover.
## This feature is only available on GreptimeDB running on cluster mode and
## - Using Remote WAL
## - Using shared storage (e.g., s3).
enable_region_failover = false
# The datastore for metasrv.
## Available datastore:
## - "etcd_store" (default)
## - "memory_store" (In memory metadata storage - only used for testing.)
## - "postgres_store"
backend = "etcd_store"

## Procedure storage options.
[procedure]

## Procedure max retry time.
max_retry_times = 12

## Initial retry delay of procedures, increases exponentially
retry_delay = "500ms"

# Failure detectors options.
[failure_detector]

## The threshold value used by the failure detector to determine failure conditions.
threshold = 8.0

## The minimum standard deviation of the heartbeat intervals, used to calculate acceptable variations.
min_std_deviation = "100ms"

## The acceptable pause duration between heartbeats, used to determine if a heartbeat interval is acceptable.
acceptable_heartbeat_pause = "10000ms"

## The initial estimate of the heartbeat interval used by the failure detector.
first_heartbeat_estimate = "1000ms"

## Datanode options.
[datanode]

## Datanode client options.
[datanode.client]

## Operation timeout.
timeout = "10s"

## Connect server timeout.
connect_timeout = "10s"

## `TCP_NODELAY` option for accepted connections.
tcp_nodelay = true

[wal]
# Available wal providers:
# - `raft_engine` (default): there're none raft-engine wal config since metasrv only involves in remote wal currently.
# - `kafka`: metasrv **have to be** configured with kafka wal config when using kafka wal provider in datanode.
provider = "raft_engine"

# Kafka wal config.

## The broker endpoints of the Kafka cluster.
broker_endpoints = ["127.0.0.1:9092"]

## Automatically create topics for WAL.
## Set to `true` to automatically create topics for WAL.
## Otherwise, use topics named `topic_name_prefix_[0..num_topics)`
auto_create_topics = true

## Number of topics.
num_topics = 64

## Topic selector type.
## Available selector types:
## - `round_robin` (default)
selector_type = "round_robin"

## A Kafka topic is constructed by concatenating `topic_name_prefix` and `topic_id`.
topic_name_prefix = "greptimedb_wal_topic"

## Expected number of replicas of each partition.
replication_factor = 1

## Above which a topic creation operation will be cancelled.
create_topic_timeout = "30s"
## The initial backoff for kafka clients.
backoff_init = "500ms"

## The maximum backoff for kafka clients.
backoff_max = "10s"

## Exponential backoff rate, i.e. next backoff = base * current backoff.
backoff_base = 2

## Stop reconnecting if the total wait time reaches the deadline. If this config is missing, the reconnecting won't terminate.
backoff_deadline = "5mins"

# The Kafka SASL configuration.
# **It's only used when the provider is `kafka`**.
# Available SASL mechanisms:
# - `PLAIN`
# - `SCRAM-SHA-256`
# - `SCRAM-SHA-512`
# [wal.sasl]
# type = "SCRAM-SHA-512"
# username = "user_kafka"
# password = "secret"

# The Kafka TLS configuration.
# **It's only used when the provider is `kafka`**.
# [wal.tls]
# server_ca_cert_path = "/path/to/server_cert"
# client_cert_path = "/path/to/client_cert"
# client_key_path = "/path/to/key"

```

| Key                                           | Type    | Default                | Descriptions                                                                                                                                                                  |
| --------------------------------------------- | ------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data_home`                                   | String  | `./greptimedb_data/metasrv/`        | The working home directory.                                                                                                                                                   |
| `bind_addr`                                   | String  | `127.0.0.1:3002`       | The bind address of metasrv.                                                                                                                                                  |
| `server_addr`                                 | String  | `127.0.0.1:3002`       | The communication server address for frontend and datanode to connect to metasrv, "127.0.0.1:3002" by default for localhost.                                                  |
| `store_addrs`                                  | Array   | `["127.0.0.1:2379"]`       | Store server address. Configure the address based on your backend type, for example:<br/>- Use `"127.0.0.1:2379"` to connect to etcd<br/>- Use `"password=password dbname=postgres user=postgres host=localhost port=5432"` to connect to postgres |
| `selector`                                    | String  | `lease_based`          | Datanode selector type.<br/>- `lease_based` (default value).<br/>- `load_based`<br/>For details, see [Selector](/contributor-guide/metasrv/selector.md)                       |
| `use_memory_store`                            | Bool    | `false`                | Store data in memory.                                                                                                                                                         |
| `enable_region_failover`                      | Bool    | `false`                | Whether to enable region failover.<br/>This feature is only available on GreptimeDB running on cluster mode and<br/>- Using Remote WAL<br/>- Using shared storage (e.g., s3). |
| `backend`                                     | String  | `etcd_store`           | The datastore for metasrv.<br/>- `etcd_store` (default)<br/>- `memory_store` (In memory metadata storage - only used for testing.)<br/>- `postgres_store` |
| `meta_table_name` | String | `greptime_metakv` | Table name in RDS to store metadata. Effect when using a RDS kvbackend.<br/>**Only used when backend is `postgres_store`.** |
| `meta_election_lock_id` | Integer | `1` | Advisory lock id in PostgreSQL for election. Effect when using PostgreSQL as kvbackend<br/>**Only used when backend is `postgres_store`.** |
| `procedure`                                   | --      | --                     | Procedure storage options.                                                                                                                                                    |
| `procedure.max_retry_times`                   | Integer | `12`                   | Procedure max retry time.                                                                                                                                                     |
| `procedure.retry_delay`                       | String  | `500ms`                | Initial retry delay of procedures, increases exponentially                                                                                                                    |
| `failure_detector`                            | --      | --                     | --                                                                                                                                                                            |
| `failure_detector.threshold`                  | Float   | `8.0`                  | The threshold value used by the failure detector to determine failure conditions.                                                                                             |
| `failure_detector.min_std_deviation`          | String  | `100ms`                | The minimum standard deviation of the heartbeat intervals, used to calculate acceptable variations.                                                                           |
| `failure_detector.acceptable_heartbeat_pause` | String  | `10000ms`              | The acceptable pause duration between heartbeats, used to determine if a heartbeat interval is acceptable.                                                                    |
| `failure_detector.first_heartbeat_estimate`   | String  | `1000ms`               | The initial estimate of the heartbeat interval used by the failure detector.                                                                                                  |
| `datanode`                                    | --      | --                     | Datanode options.                                                                                                                                                             |
| `datanode.client`                             | --      | --                     | Datanode client options.                                                                                                                                                      |
| `datanode.client.timeout`                     | String  | `10s`                  | Operation timeout.                                                                                                                                                            |
| `datanode.client.connect_timeout`             | String  | `10s`                  | Connect server timeout.                                                                                                                                                       |
| `datanode.client.tcp_nodelay`                 | Bool    | `true`                 | `TCP_NODELAY` option for accepted connections.                                                                                                                                |
| `wal`                                         | --      | --                     | --                                                                                                                                                                            |
| `wal.provider`                                | String  | `raft_engine`          | --                                                                                                                                                                            |
| `wal.broker_endpoints`                        | Array   | --                     | The broker endpoints of the Kafka cluster.                                                                                                                                    |
| `wal.auto_create_topics`                      | Bool    | `true`                 | Automatically create topics for WAL.<br/>Set to `true` to automatically create topics for WAL.<br/>Otherwise, use topics named `topic_name_prefix_[0..num_topics)`            |
| `wal.num_topics`                              | Integer | `64`                   | Number of topics.                                                                                                                                                             |
| `wal.selector_type`                           | String  | `round_robin`          | Topic selector type.<br/>Available selector types:<br/>- `round_robin` (default)                                                                                              |
| `wal.topic_name_prefix`                       | String  | `greptimedb_wal_topic` | A Kafka topic is constructed by concatenating `topic_name_prefix` and `topic_id`.                                                                                             |
| `wal.replication_factor`                      | Integer | `1`                    | Expected number of replicas of each partition.                                                                                                                                |
| `wal.create_topic_timeout`                    | String  | `30s`                  | Above which a topic creation operation will be cancelled.                                                                                                                     |
| `wal.backoff_init`                            | String  | `500ms`                | The initial backoff for kafka clients.                                                                                                                                        |
| `wal.backoff_max`                             | String  | `10s`                  | The maximum backoff for kafka clients.                                                                                                                                        |
| `wal.backoff_base`                            | Integer | `2`                    | Exponential backoff rate, i.e. next backoff = base \* current backoff.                                                                                                        |
| `wal.backoff_deadline`                        | String  | `5mins`                | Stop reconnecting if the total wait time reaches the deadline. If this config is missing, the reconnecting won't terminate.                                                   |
| `wal.sasl`                                    | String  | --                     | The Kafka SASL configuration.                                                                                                                                                 |
| `wal.sasl.type`                               | String  | --                     | The SASL mechanisms, available values: `PLAIN`, `SCRAM-SHA-256`, `SCRAM-SHA-512`.                                                                                             |
| `wal.sasl.username`                           | String  | --                     | The SASL username.                                                                                                                                                            |
| `wal.sasl.password`                           | String  | --                     | The SASL password.                                                                                                                                                            |
| `wal.tls`                                     | String  | --                     | The Kafka TLS configuration.                                                                                                                                                  |
| `wal.tls.server_ca_cert_path`                 | String  | --                     | The path of trusted server ca certs.                                                                                                                                          |
| `wal.tls.client_cert_path`                    | String  | --                     | The path of client cert (Used for enable mTLS).                                                                                                                               |
| `wal.tls.client_key_path`                     | String  | --                     | The path of client key (Used for enable mTLS).                                                                                                                                |

### Datanode-only configuration

```toml
node_id = 42
[grpc]
bind_addr = "127.0.0.1:3001"
server_addr = "127.0.0.1:3001"
runtime_size = 8
```

| Key              | Type    | Description                                             |
| ---------------- | ------- | ------------------------------------------------------- |
| node_id          | Integer | The datanode identifier, should be unique.              |
| grpc.bind_addr    | String  | The address to bind the gRPC server, `"127.0.0.1:3001"` by default.     |
| grpc.server_addr  | String  | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `grpc.bind_addr`. |
| grpc.runtime_size | Integer | The number of gRPC server worker threads, 8 by default. |

### Frontend-only configuration

```toml
[datanode]
[datanode.client]
connect_timeout = "1s"
tcp_nodelay = true
```

| Key                               | Type   | Default | Description                                    |
|-----------------------------------|--------|---------|------------------------------------------------|
| `datanode`                        | --     | --      | Datanode options.                              |
| `datanode.client`                 | --     | --      | Datanode client options.                       |
| `datanode.client.connect_timeout` | String | `1s`    | Connect server timeout.                        |
| `datanode.client.tcp_nodelay`     | Bool   | `true`  | `TCP_NODELAY` option for accepted connections. |
