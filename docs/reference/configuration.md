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

### Storage option

The `storage` options are valid in datanode and standalone mode, which specify the database data directory and other storage related options.

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

A file sample configuration:

```toml
[storage]
type = "File"
data_dir = "/tmp/greptimedb/data/"
```

A s3 sample configuration:

```toml
[storage]
type = "S3"
bucket = "test_greptimedb"
root = "/greptimedb"
access_key_id = "<access key id>"
secret_access_key = "<secret access key>"
```

## Standalone

When you use GreptimeDB in the standalone mode, you can configure it as below:

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
