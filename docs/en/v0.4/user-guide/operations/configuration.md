# Configuration

GreptimeDB supports **layered configuration** and uses the following precedence order(each item takes precedence over the item below it):

- Command-line flags
- Configuration file
- Environment variables
- Default values

This page describes methods for configuring GreptimeDB server settings. Configuration can be set in TOML file.

The system assigns a default value for missing parameters in the configuration file.

All sample configuration files are in the project's [config](https://github.com/GreptimeTeam/greptimedb/tree/develop/config) folder.

## Command-line flags

See [Command lines](/en/v0.4//reference/command-lines.md) to learn how to use the `greptime` command line.

### Global flags

- `-h`/`--help`: Print help information;
- `-V`/`--version`: Print version information;
- `--log-dir <LOG_DIR>`: The logging directory;
- `--log-level <LOG_LEVEL>`: The logging level;

### Datanode subcommand flags

You can list all the flags from the following command:

```
greptime datanode start --help
```

- `-c`/`--config-file`: The configuration file for datanode;
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_DATANODE`;
- `--data-home`: Database storage root directory;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--metasrv-addr <METASRV_ADDR>`: Metasrv address list;
- `--node-id <NODE_ID>`: The datanode ID;
- `--rpc-addr <RPC_ADDR>`: The datanode RPC addr;
- `--rpc-hostname <RPC_HOSTNAME>`: The datanode hostname;
- `--wal-dir <WAL_DIR>`: The wal directory of WAL;

All the `addr` options are in the form of `ip:port`.

### Metasrv subcommand flags

You can list all the flags from the following command:

```
greptime metasrv start --help
```

- `-c`/`--config-file`: The configuration file for metasrv;
- `--enable-region-failover`: Whether to enable region failover, default is `false`.
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_METASRV`;
- `--bind-addr <BIND_ADDR>`: The bind address of metasrv;
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--selector <SELECTOR>`: You can refer [selector-type](/en/v0.4/developer-guide/metasrv/selector#selector-type);
- `--server-addr <SERVER_ADDR>`: The communication server address for frontend and datanode to connect to metasrv;
- `--store-addr <STORE_ADDR>`: Etcd server addresses;
- `--use-memory-store`: Use memory store instead of etcd;

### Frontend subcommand flags

You can list all the flags from the following command:

```
greptime frontend start --help
```

- `-c`/`--config-file`: The configuration file for frontend;
- `--env-prefix <ENV_PREFIX>`: The prefix of environment variables, default is `GREPTIMEDB_FRONTEND`;
- `--disable-dashboard`: Disable dashboard http service, default is `false`.
- `--http-addr <HTTP_ADDR>`: HTTP server address;
- `--http-timeout <HTTP_TIMEOUT>`: HTTP request timeout in seconds.
- `--influxdb-enable`: Whether to enable InfluxDB protocol in HTTP API;
- `--grpc-addr <GPRC_ADDR>`: GRPC server address;
- `--metasrv-addr <METASRV_ADDR>`: Metasrv address list;
- `--mysql-addr <MYSQL_ADDR>`: MySQL server address;
- `--opentsdb-addr <OPENTSDB_ADDR>`: OpenTSDB server address;
- `--postgres-addr <POSTGRES_ADDR>`: Postgres server address;
- `--tls-cert-path <TLS_CERT_PATH>`: The TLS public key file path;
- `--tls-key-path <TLS_KEY_PATH>`: The TLS private key file path;
- `--tls-mode <TLS_MODE>`: TLS Mode;
- `--user-provider <USER_PROVIDER>`: You can refer [authentication](/en/v0.4/user-guide/clients/authentication);

## Configuration File

### Specify configuration file

You can specify the configuration file by using the command line arg `-c [file_path]`, for example:

```sh
greptime [standalone | frontend | datanode | metasrv]  start -c config/standalone.example.toml
```

### Common configurations

Common protocol configurations in `frontend` and `standalone` sub command:

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

All of these protocols except HTTP and gRPC are optional, the default values are listed above. If you want to disable some options, such as OpenTSDB protocol support, you can set the `enable` to `false`.

#### Protocol options

| Option             | Key          | Type    | Description                                                                     |
| ------------------ | ------------ | ------- | ------------------------------------------------------------------------------- |
| http       |              |         | HTTP server options                                                             |
|                    | addr         | String  | Server address, "127.0.0.1:4000" by default                                     |
|                    | timeout      | String  | HTTP request timeout, "30s" by default                                            |
|                    | body_limit      | String  | HTTP max body size, "64MB" by default                                            |
| grpc       |              |         | gRPC server options                                                             |
|                    | addr         | String  | Server address, "127.0.0.1:4001" by default                                     |
|                    | runtime_size | Integer | The number of server worker threads, 8 by default                               |
| mysql      |              |         | MySQL server options                                                            |
|                    | enable       | Boolean | Whether to enable MySQL protocol, true by default |
|                    | add          | String  | Server address, "127.0.0.1:4002" by default                                     |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
| influxdb   |              |         | InfluxDB Protocol options                                                       |
|                    | enable       | Boolean | Whether to enable InfluxDB protocol in HTTP API, true by default                |
| opentsdb   |              |         | OpenTSDB Protocol options                                                       |
|                    | enable       | Boolean | Whether to enable OpenTSDB protocol, true by default |
|                    | addr         | String  | OpenTSDB telnet API server address, "127.0.0.1:4242" by default                 |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |
| prom_store |              |         | Prometheus remote storage options                                                     |
|                    | enable       | Boolean | Whether to enable Prometheus remote write and read in HTTP API, true by default |
| postgres   |              |         | PostgresSQL server options                                                      |
|                    | enable       | Boolean | Whether to enable PostgresSQL protocol, true by default |
|                    | addr         | String  | Server address, "127.0.0.1:4003" by default                                     |
|                    | runtime_size | Integer | The number of server worker threads, 2 by default                               |

#### Node options

There are also some node options in common:

| Option | Key                   | Type    | Description                                                |
| ------ | --------------------- | ------- | ---------------------------------------------------------- |
|        | mode                  | String  | Node running mode, includes "standalone" and "distributed" |

#### Storage options

The `storage` options are valid in datanode and standalone mode, which specify the database data directory and other storage-related options.

GreptimeDB supports storing data in local file system, AWS S3 and compatible services (including minio, digitalocean space, Tencent Cloud Object Storage(COS), Baidu Object Storage(BOS) and so on), Azure Blob Storage and Aliyun OSS.

| Option  | Key               | Type   | Description                                                   |
| ------- | ----------------- | ------ | ------------------------------------------------------------- |
| storage |                   |        | Storage options                                               |
|         | type              | String | Storage type, Only supports "File", "S3" and "Oss" etc.       |
| File    |                   |        | Local file storage options, valid when type="file"            |
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
|         | access_key_id     | String | The OSS access key id                                         |
|         | secret_access_key | String | The OSS secret access key                                     |
| Azblob  |                   |        | Azure Blob Storage options, valid when type="Azblob"          |
|         | container         | String | The container name                                            |
|         | root              | String | The root path in container                                    |
|         | endpoint          | String | The API endpoint of Azure Blob Storage                        |
|         | account_name      | String | The account name of Azure Blob Storage                        |
|         | account_key       | String | The access key                                                |
|         | sas_token         | String | The shared access signature                                   |

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
cache_capacity = "256MiB"
```

The `cache_path` is the local file directory that keeps cache files, and the `cache_capacity` is the maximum total file size in the cache directory.

### WAL options

The `[wal]` section in datanode or standalone config file configures the options of Write-Ahead-Log:

```toml
[wal]
# WAL data directory
# dir = "/tmp/greptimedb/wal"
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

#### Compaction

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

#### Manifest

The `[storage.manifest]` section configures the region manifest options of storage engine:

```toml
[storage.manifest]
# Region checkpoint actions margin.
# Create a checkpoint every <checkpoint_margin> actions.
checkpoint_margin = 10
# Region manifest logs and checkpoints gc execution duration
gc_duration = '10m'
```

### Standalone

A sample standalone configuration can be found at [standalone.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/standalone.example.toml).

Start the standalone mode as below:

```
greptime standalone start -c standalone.example.toml
```

### Frontend in distributed mode

Configure frontend in distributed mode:

```toml
mode = "distributed"

[meta_client]
metasrv_addrs = ["127.0.0.1:3002"]
timeout_millis = 3000
connect_timeout_millis = 5000
tcp_nodelay = true
```

Specify the running mode to be `"distributed"`.

The `meta_client` configures the MetaServer client, including:

- `metasrv_addrs`, The MetaServer address list.
- `timeout_millis`, operation timeout in milliseconds, 3000 by default.
- `connect_timeout_millis`, connect server timeout in milliseconds,5000 by default.
- `tcp_nodelay`, `TCP_NODELAY` option for accepted connections, true by default.

A sample frontend configuration for distributed mode can be found at [frontend.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/frontend.example.toml).

### Datanode in distributed mode

Configure datanode in distributed mode:

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

Datanode in distributed mode should set **different** `node_id` in different nodes.

A sample datanode configuration for distributed mode can be found at [datanode.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/datanode.example.toml).

### MetaServer configuration

A sample configuration can be found at [metasrv.example.toml](https://github.com/GreptimeTeam/greptimedb/blob/develop/config/metasrv.example.toml).

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

| Key                 | Type    | Description                                                                                                                 |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| data_home           | String  | The working home of MetaServer,    `"/tmp/metasrv/"` by default                                                                |
| bind_addr           | String  | The bind address of MetaServer, `"127.0.0.1:3002"` by default.                                                                   |
| server_addr         | String  | The communication server address for frontend and datanode to connect to MetaServer, `"127.0.0.1:3002"` by default for localhost |
| store_addr          | String  | Etcd server addresses, `"127.0.0.1:2379"` by default, server address separated by commas, in the format of `"ip1:port1,ip2:port2,..."`.                                                                            |
| selector          | String  |  Load balance strategy to choose datanode when creating new tables, see [Selector](/en/v0.4/developer-guide/meta/selector.md)                                                                     |
|   use_memory_store   | Boolean  |   Only used for testing when you don't have an etcd cluster, store data in memory, `false` by default.   |

## Environment variable

Every item in the configuration file can be mapped into environment variables. For example, if we want to set the configuration item `max_inflight_tasks` of datanode by environment variable:

```toml
# ...
[storage.compaction]
# Max task number that can concurrently run.
max_inflight_tasks = 4
# ...
```

You can use the following shell command to setup the environment variable as the following format:

```
export GREPTIMEDB_DATANODE__STORAGE__COMPACTION__MAX_INFLIGHT_TASKS=4
```

### Environment Variable Rules

- Every environment variable should have the component prefix, for example:

  - `GREPTIMEDB_FRONTEND`
  - `GREPTIMEDB_METASRV`
  - `GREPTIMEDB_DATANODE`
  - `GREPTIMEDB_STANDALONE`

- We use **double underscore `__`** as a separator. For example, the above data structure `storage.compaction.max_inflight_tasks` will be transformed to `STORAGE__COMPACTION__MAX_INFLIGHT_TASKS`.

The environment variable also accepts list that are separated by a comma `,`, for example:

```
GREPTIMEDB_METASRV__META_CLIENT__METASRV_ADDRS=127.0.0.1:3001,127.0.0.1:3002,127.0.0.1:3003
```
