# 配置 GreptimeDB

本文介绍了配置 GreptimeDB server 的方法，用户可以在 TOML 文件中进行设置。

在配置文件中，对于缺失的参数，系统会赋予其一个默认值。

所有样本配置文件都放在项目的 [config](https://github.com/GreptimeTeam/greptimedb/tree/main/config) 文件夹中。

## 指定配置文件

用户可以通过使用命令行参数 `-c [file_path]` 指定配置文件，比如：

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

## 常见配置

在 `frontend` 和 `standalone` 子命令中常见的协议配置有：

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
```

所有选项都是可选的，上面列出了其默认值。如果想禁用某些选项，比如 OpenTSDB 协议，可以删除 `prometheus_options` 或将其中 `enable` 的值设为 `false`。

### 协议选项

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

### 节点选项

一些共同的节点选项：

| Option | Key                     | Type    | Description                                                                        |
|--------|-------------------------|---------|------------------------------------------------------------------------------------|
|        | mode                    | String  | Node running mode, includes "standalone" and "distributed"                         |
|        | enable_memory_catalog   | Boolean | Use in-memory catalog, false by default                                            |

### 存储选项

`存储`选项在 datanode 和单机模式下有效，它指定了数据库数据目录和其他存储相关的选项。

| Option  | Key      | Type   | Description                                         |
|---------|----------|--------|-----------------------------------------------------|
| storage |          |        | Storage options                                     |
|         | type     | String | Storage type, Only supports "File" or "S3" right now |
| File    |          |        | File storage options, valid when type="file"        |
|         | data_dir | String | Data directory, "/tmp/greptimedb/data" by default   |
| S3      |          |        | S3 storage options, valid when type="S3"            |
|         | bucket   | String | The s3 bucket name                                  |
|         | root     | String | The root path in s3 bucket                          |
|         | access_key_id     | String | The s3 access key id                      |
|         | secret_access_key | String | The s3 secret access key                  |

文件存储配置范例：

```toml
[storage]
type = "File"
data_dir = "/tmp/greptimedb/data/"
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

### Compaction

在 `[storage.compaction]` 中配置存储引擎的 compaction 选项：

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

在 `[storage.manifest]` 中配置存储引擎的 region manifest 选项：

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

## 单机模式

当用户在单机模式下使用 GreptimeDB 时，可以像下面这样进行配置：

```toml
mode = "standalone"

[http_options]
addr = "127.0.0.1:4000"
timeout = "30s"

[wal]
dir = "/tmp/greptimedb/wal"
file_size = "1GB"
purge_interval = "10m"
purge_threshold = "50GB"
read_batch_size = 128
sync_write = false

[storage]
type = "File"
data_dir = "/tmp/greptimedb/data/"

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

## 分布式模式下的 `Frontend`

在分布式模式下配置 `Frontend`：

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

通过 `meta_client_options` 配置 metasrv 客户端，包括：

* `metasrv_addrs`， metasrv 地址列表
* `timeout_millis`， 操作超时时长，单位为毫秒，默认为 3000。
* `connect_timeout_millis`，连接服务器超时时长，单位为毫秒，默认为 5000。
* `tcp_nodelay`，接受连接时的 `TCP_NODELAY` 选项，默认为 true。

## 分布式模式下的 `Datanode`

在分布式模式下配置 `datanode`：

```toml
node_id = 42
mode = "distributed"
rpc_addr = "127.0.0.1:3001"
rpc_runtime_size = 8
mysql_addr = "127.0.0.1:4406"
mysql_runtime_size = 4

[wal]
dir = "/tmp/greptimedb/wal"
file_size = "1GB"
purge_interval = "10m"
purge_threshold = "50GB"
read_batch_size = 128
sync_write = false

[storage]
type = "File"
data_dir = "/tmp/greptimedb/data/"

[meta_client_options]
metasrv_addrs = ["127.0.0.1:3002"]
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = false
```

分布式模式下的 datanode 应该在不同的节点上设置不同的 `node_id`。

## Metasrv 配置

一个配置范例：

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
