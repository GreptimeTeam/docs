# Configuration

This page describes methods for configuring GreptimeDB server settings. Configuration can be set in TOML file.

When a parameter is absent in the configuration file, then the default value is used.

All sample configuration files are in project's [config](https://github.com/GreptimeTeam/greptimedb/tree/develop/config) folder.


## Specify configuration file

You can specify the configuration file by using the command line arg `-c [file_path]`, for example:

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

## Common configurations

Common protocol configurations in `frontend` and `standalone` sub command:

```toml
[grpc_options]
addr = '0.0.0.0:4001'
runtime_size = 8

[mysql_options]
addr = '0.0.0.0:4002'
runtime_size = 2

[influxdb_options]
enable = true

[opentsdb_options]
addr = "0.0.0.0:4242"
enable = true
runtime_size = 2

[prometheus_options]
enable = true

[postgres_options]
addr = '0.0.0.0:4003'
runtime_size = 2
check_pwd = false
```

All these options are optional, the default values are list as above. If you want to disable some options such as disabling OpenTSDB protocol support, you can just remove the `prometheus_options` or set it's `enable` value to be `false`.


### Protocol options

| Option             | Key          | Type    | Description                                                                     |
|--------------------|--------------|---------|---------------------------------------------------------------------------------|
| grpc_options       |              |         | gRPC server options                                                             |
|                    | addr         | String  | Server address, "0.0.0.0:4001" by default                                       |
|                    | runtime_size | Integer | The number of server worker threads, 8 by default                               |
| mysql_options      |              |         | MySQL server options                                                            |
|                    | add          | String  | Server address, "0.0.0.0:4002" by default                                       |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
| influxdb_options   |              |         |                                                                                 |
|                    | enable       | Boolean | Whether to enable InfluxDB protocol in HTTP API, true by default                |
| opentsdb_options   |              |         | OpenTSDB Protocol options                                                       |
|                    | enable       | Boolean | Whether to enable OpenTSDB protocol in HTTP API, true by default                |
|                    | addr         | String  | OpenTSDB telnet API server address, "0.0.0.0:4242" by default                   |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
| prometheus_options |              |         | Prometheus protocol options                                                     |
|                    | enable       | Boolean | Whether to enable Prometheus remote write and read in HTTP API, true by default |
| postgres_options   |              |         | PostgresSQL server options                                                      |
|                    | addr         | String  | Server address, '0.0.0.0:4003' by default                                       |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
|                    | check_pwd    | boolean | Wheter to check password, it's not supported right now, always false.           |

### Node options

There are also some node options in common:


| Option | Key       | Type    | Description                                                                        |
|--------|-----------|---------|------------------------------------------------------------------------------------|
|        | node_id   | Integer | The datanode identifier, set it 0 in standalone mode, otherwise should be different|
|        | mode      | String  | Node running mode, includes 'standalone' or 'distributed'                          |
|        | http_addr | String  | HTTP API server address, '0.0.0.0:4000' by default                                 |

### Storage option

The `storage` options are valid in datanode and standalone mode, which specify the WAL and database data directories and other storage related options.

| Option  | Key      | Type   | Description                                         |
|---------|----------|--------|-----------------------------------------------------|
|         | wal_dir  | String | Write-ahead log directory, "/tmp/greptimedb/wal"    |
| storage |          |        | Storage engine options                              |
|         | type     | String | Storage engine type, Only supports 'File' right now |
|         | data_dir | String | Data directory, "/tmp/greptimedb/data" by default   |



## Standalone

When you start the GreptimeDB in standalone mode, you can configure it as below:

```toml
node_id = 0
mode = 'standalone'
http_addr = '0.0.0.0:4000'
datanode_mysql_addr = "0.0.0.0:3306"
datanode_mysql_runtime_size = 4
wal_dir = "/tmp/greptimedb/wal/"

[storage]
type = 'File'
data_dir = '/tmp/greptimedb/data/'

[grpc_options]
addr = '0.0.0.0:4001'
runtime_size = 8

[mysql_options]
addr = '0.0.0.0:4002'
runtime_size = 2

[influxdb_options]
enable = true

[opentsdb_options]
addr = "0.0.0.0:4242"
enable = true
runtime_size = 2

[prometheus_options]
enable = true

[postgres_options]
addr = '0.0.0.0:4003'
runtime_size = 2
check_pwd = false
```

Some specific options for standalone:

* `datanode_mysql_addr` and `datanode_mysql_runtime_size`, to set datanode's MySQL server configurations.

## Frontend in distributed mode

Configure frontend in distributed mode:

```toml
mode = "distributed"
datanode_rpc_addr = '127.0.0.1:3001'
http_addr = '0.0.0.0:4000'

[meta_client_opts]
metasrv_addr = "1.1.1.1:3002"
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = false
```

The `datanode_rpc_addr` is not used in `distributed` mode, you can leave it in default value.

The `meta_client_opts` configure the metasrv client confugrations, incuding:

* `metasrv_addr`, metasrv address.
* `timeout_millis`, operation timeout in milliseconds, 3000 by default.
* `connect_timeout_millis`, connect server timeout in milliseconds,5000 by default.


## Datanode in distributed mode

Configure datanode in distributed mode:

```toml
node_id = 42
mode = "distributed"
rpc_addr = '0.0.0.0:3001'
wal_dir = '/tmp/greptimedb/wal'
rpc_runtime_size = 8
mysql_addr = '0.0.0.0:3306'
mysql_runtime_size = 4

[storage]
type = 'File'
data_dir = '/tmp/greptimedb/data/'

[meta_client_opts]
metasrv_addr = "1.1.1.1:3002"
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = false
```

Datanode in distributed mode should set different `node_id` in different nodes.

## Metasrv configuration

A sample configurations:

```toml
bind_addr = '127.0.0.1:3002'
server_addr = '0.0.0.0:3002'
store_addr = '127.0.0.1:2379'
datanode_lease_secs = 30
```

| Key                 | Type    | Description                                                                                                             |   |
|---------------------|---------|-------------------------------------------------------------------------------------------------------------------------|---|
| bind_addr           | String  | The bind address of metasrv, '0.0.0.0:3002' by default.                                                                 |   |
| server_addr         | String  | The communication server address for frontend and datanode to connect metasrv,  '0.0.0.0:3002' by default for localhost |   |
| store_addr          | String  | Etcd server address, '127.0.0.1:2379' by default                                                                        |   |
| datanode_lease_secs | Integer | Datanode lease in seconds, 15 seconds by default.                                                                       |   |
