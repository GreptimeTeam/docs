# Configuration

This page describes methods for configuring GreptimeDB server settings. Configuration can be set in TOML file.

The system assigns a default value for missing parameters in the configuration file.

All sample configuration files are in the project's [config](https://github.com/GreptimeTeam/greptimedb/tree/develop/config) folder.


## Specify configuration file

You can specify the configuration file by using the command line arg `-c [file_path]`, for example:

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

## Common configurations

Common protocol configurations in `frontend` and `standalone` sub command:

```toml
[http_options]
addr = "127.0.0.1:4000"
timeout = "30s"

[grpc_options]
addr = "127.0.0.1:4001"
runtime_size = 8

[mysql_options]
addr = "127.0.0.1:4002"
runtime_size = 2

[mysql_options.tls]
mode = "disable"
cert_path = ""
key_path = ""

[postgres_options]
addr = "127.0.0.1:4003"
runtime_size = 2

[postgres_options.tls]
mode = "disable"
cert_path = ""
key_path = ""

[opentsdb_options]
addr = "127.0.0.1:4242"
runtime_size = 2

[influxdb_options]
enable = true

[prometheus_options]
enable = true

[promql_options]
addr = "127.0.0.1:4004"
```

All of these options are optional, the default values are listed above. If you want to disable some options, such as OpenTSDB protocol support, you can remove the `prometheus_options` or set its `enable` value to be `false`.


### Protocol options

| Option             | Key          | Type    | Description                                                                     |
|--------------------|--------------|---------|---------------------------------------------------------------------------------|
| http_options       |              |         | HTTP server options                                                             |
|                    | addr         | String  | Server address, "127.0.0.1:4000" by default                                     |
|                    | timeout      | String  | HTTP request timeout, 30s by default                                            |
| grpc_options       |              |         | gRPC server options                                                             |
|                    | addr         | String  | Server address, "127.0.0.1:4001" by default                                     |
|                    | runtime_size | Integer | The number of server worker threads, 8 by default                               |
| mysql_options      |              |         | MySQL server options                                                            |
|                    | add          | String  | Server address, "127.0.0.1:4002" by default                                     |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
| influxdb_options   |              |         | InfluxDB Protocol options                                                       |
|                    | enable       | Boolean | Whether to enable InfluxDB protocol in HTTP API, true by default                |
| opentsdb_options   |              |         | OpenTSDB Protocol options                                                       |
|                    | addr         | String  | OpenTSDB telnet API server address, "127.0.0.1:4242" by default                 |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
| prometheus_options |              |         | Prometheus protocol options                                                     |
|                    | enable       | Boolean | Whether to enable Prometheus remote write and read in HTTP API, true by default |
| postgres_options   |              |         | PostgresSQL server options                                                      |
|                    | addr         | String  | Server address, "127.0.0.1:4003" by default                                     |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |

### Node options

There are also some node options in common:


| Option | Key                     | Type    | Description                                                                        |
|--------|-------------------------|---------|------------------------------------------------------------------------------------|
|        | mode                    | String  | Node running mode, includes "standalone" and "distributed"                         |
|        | enable_memory_catalog   | Boolean | Use in-memory catalog, false by default                                            |

### Storage options

The `storage` options are valid in datanode and standalone mode, which specify the database data directory and other storage-related options.

GreptimeDB supports storing data in local file system, AWS S3, Azure Blob Storage and Aliyun OSS.

| Option  | Key      | Type   | Description                                         |
|---------|----------|--------|-----------------------------------------------------|
| storage |          |        | Storage options                                     |
|         | type     | String | Storage type, Only supports "File" or "S3" right now |
| File    |          |        | Local File storage options, valid when type="file"        |
|         | data_home | String | Database storage root directory, "/tmp/greptimedb" by default   |
| S3      |          |        | AWS S3 storage options, valid when type="S3"            |
|         | bucket   | String | The s3 bucket name                                  |
|         | root     | String | The root path in s3 bucket                          |
|         | endpoint     | String | The API endpoint of S3           |
|         | access_key_id     | String | The s3 access key id                      |
|         | secret_access_key | String | The s3 secret access key                  |
| Oss      |          |        | Aliyun OSS storage options, valid when type="Oss"            |
|         | bucket   | String | The OSS bucket name                                  |
|         | root     | String | The root path in OSS bucket                          |
|         | endpoint     | String | The API endpoint of OSS           |
|         | access_key_id     | String | The OSS access key id                      |
|         | secret_access_key | String | The OSS secret access key                  |
| Azblob      |          |        | Azure Blob Storage options, valid when type="Azblob"            |
|         | container   | String |  The container name                                  |
|         | root     | String |  The root path in  container                          |
|         | endpoint     | String | The API endpoint of  Azure Blob Storage          |
|         | account_name     | String | The account name of Azure Blob Storage      |
|         | account_key    | String | The access key                  |
|         | sas_token | String | The shared access signature                   |

A file storage sample configuration:

```toml
[storage]
type = "File"
data_home = "/tmp/greptimedb/"
```

A s3 storage sample configuration:

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
```


#### Object storage cache
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
cache_capacity = 1024
```

The `cache_path` is the local file directory that keeps cache files, and the `cache_capacity` is the maximum file number in the cache directory.

### WAL options

The `[wal]` section in datanode or standalone config file configures the options of Write-Ahead-Log:
```toml
[wal]
# WAL data directory
# dir = "/tmp/greptimedb/wal"
file_size = "1GB"
purge_threshold = "50GB"
purge_interval = "10m"
read_batch_size = 128
sync_write = false
```

* `dir`: is the directory where to write logs. When using `File` storage, it's `{data_home}/wal` by default. It must be configured explicitly when using other storage types such as `S3` etc.
* `file_size`:  the maximum file size of the WAL log file, default is 1GB.
* `purge_threshold`  and `purge_interval`: control the purging of wal files.
* `sync_write`: whether to call `fsync` when writing every log.

### Compaction

The `[storage.compaction]` section configures the compaction options of storage engine:

```toml
[storage.compaction]
# Max task number that can concurrently run.
max_inflight_tasks = 4
# Max files in level 0 to trigger compaction.
max_files_in_level0 = 8
# Max task number for SST purge task after compaction.
max_purge_tasks = 32
```

### Manifest

The `[storage.manifest]` section configures the region manifest options of storage engine:

```toml
[storage.manifest]
# Region checkpoint actions margin.
# Create a checkpoint every <checkpoint_margin> actions.
checkpoint_margin = 10
# Region manifest logs and checkpoints gc execution duration
gc_duration = '30s'
# Whether to try creating a manifest checkpoint on region opening
checkpoint_on_startup = false
```

## Standalone

When you use GreptimeDB in the standalone mode, you can configure it as below:

```toml
mode = "standalone"

[http_options]
addr = "127.0.0.1:4000"
timeout = "30s"

[wal]
#dir = "/tmp/greptimedb/wal"
file_size = "1GB"
purge_interval = "10m"
purge_threshold = "50GB"
read_batch_size = 128
sync_write = false

[storage]
type = "File"
data_home = "/tmp/greptimedb/"

[grpc_options]
addr = "127.0.0.1:4001"
runtime_size = 8

[mysql_options]
addr = "127.0.0.1:4002"
runtime_size = 2

[influxdb_options]
enable = true

[opentsdb_options]
addr = "127.0.0.1:4242"
enable = true
runtime_size = 2

[prometheus_options]
enable = true

[postgres_options]
addr = "127.0.0.1:4003"
runtime_size = 2
```


## Frontend in distributed mode

Configure frontend in distributed mode:

```toml
mode = "distributed"

[http_options]
addr = "127.0.0.1:4000"
timeout = "30s"

[meta_client_options]
metasrv_addrs = ["127.0.0.1:3002"]
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = false
```

The `meta_client_options` configure the metasrv client, including:

* `metasrv_addrs`, metasrv address list
* `timeout_millis`, operation timeout in milliseconds, 3000 by default.
* `connect_timeout_millis`, connect server timeout in milliseconds,5000 by default.
* `tcp_nodelay`, `TCP_NODELAY` option for accepted connections, true by default.


## Datanode in distributed mode

Configure datanode in distributed mode:

```toml
node_id = 42
mode = "distributed"
rpc_addr = "127.0.0.1:3001"
rpc_runtime_size = 8
mysql_addr = "127.0.0.1:4406"
mysql_runtime_size = 4

[wal]
#dir = "/tmp/greptimedb/wal"
file_size = "1GB"
purge_interval = "10m"
purge_threshold = "50GB"
read_batch_size = 128
sync_write = false

[storage]
type = "File"
data_home = "/tmp/greptimedb/"

[meta_client_options]
metasrv_addrs = ["127.0.0.1:3002"]
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = false
```

Datanode in distributed mode should set different `node_id` in different nodes.

## Metasrv configuration

A sample configurations:

```toml
bind_addr = "127.0.0.1:3002"
server_addr = "127.0.0.1:3002"
store_addr = "127.0.0.1:2379"
datanode_lease_secs = 30
```

| Key                 | Type    | Description                                                                                                             |
|---------------------|---------|-------------------------------------------------------------------------------------------------------------------------|
| bind_addr           | String  | The bind address of metasrv, "127.0.0.1:3002" by default.                                                                 |
| server_addr         | String  | The communication server address for frontend and datanode to connect to metasrv,  "127.0.0.1:3002" by default for localhost |
| store_addr          | String  | Etcd server address, "127.0.0.1:2379" by default                                                                        |
| datanode_lease_secs | Integer | Datanode lease in seconds, 15 seconds by default.                                                                       |
