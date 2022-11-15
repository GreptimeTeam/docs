# Configuration

This page describes methods for configuring GreptimeDB server settings. Configuration can be set in TOML file.

When a parameter is absent in the configuration file, then the default value is used.

All sample configuration files are in project's [config](https://github.com/GreptimeTeam/greptimedb/tree/develop/config) folder.


## Specify configuration file

You can specify configuration file by command line arg `-c [file_path]`, for eaxmple:

```sh
greptime standalone start -c config/standalone.example.toml
```

## Common configurations

Common configurations in `frontend` and `standalone` sub command:

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
