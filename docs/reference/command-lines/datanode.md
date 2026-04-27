---
keywords: [GreptimeDB datanode, command-line interface, datanode configuration, datanode startup, datanode options, datanode examples]
description: Comprehensive guide to GreptimeDB datanode command-line interface, including configuration options, startup commands, and practical examples for deploying datanode instances.
---

# Datanode

The `greptime datanode` command provides subcommands for managing and benchmarking datanode instances.

## start

Start the datanode service.

### Options

You can list all the options from the following command:

```
greptime datanode start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file`                  | The configuration file for datanode                                                                                                                                                                                                                                           |
| `--data-home`                         | Database storage root directory                                                                                                                                                                                                                                               |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_DATANODE`                                                                                                                                                                                                         |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                           |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                               |
| `--metasrv-addrs <METASRV_ADDR>`      | Metasrv address list                                                                                                                                                                                                                                                          |
| `--node-id <NODE_ID>`                 | The datanode ID                                                                                                                                                                                                                                                               |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                           |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `grpc_bind_addr` |
| `--wal-dir <WAL_DIR>`                 | The directory of WAL                                                                                                                                                                                                                                                          |

All the `addr` options are in the form of `ip:port`.

### Examples

#### Start service with configurations

Starts a datanode instance with customized configurations:

```sh
greptime datanode start -c config/datanode.example.toml
```

Starts a datanode instance with command line arguments specifying the gRPC service address, the MySQL service address, the address of the metasrv, and the node id of the instance:

```sh
greptime datanode start --grpc-bind-addr=0.0.0.0:4001 --mysql-addr=0.0.0.0:4002 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```

The `datanode.example.toml` configuration file comes from the `config` directory of the `[GreptimeDB](https://github.com/GreptimeTeam/greptimedb/)` repository. You can find more example configuration files there. The `-c` option specifies the configuration file, for more information check [Configuration](/user-guide/deployments-administration/configuration.md).

## objbench

The `objbench` subcommand is a benchmarking tool for measuring read/write performance of specific files on object storage. This is useful for diagnosing performance issues and testing storage layer performance.

### Options

| Option                | Description                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `--config <FILE>`     | Path to the datanode configuration file (TOML format)                                                              |
| `--source <PATH>`     | Source SST file path in object storage (e.g., `data/greptime/public/1024/1024_0000000000/metadata/<uuid>.parquet`) |
| `-v`/`--verbose`      | Enable verbose output                                                                                              |
| `--pprof-file <FILE>` | Output file path for pprof flamegraph (enables profiling). Generates an SVG flamegraph file                        |

### Examples

#### Basic benchmark

Measure the read/write performance of a specific file:

```sh
greptime datanode objbench --config ./datanode.toml --source data/greptime/public/1024/1024_0000000000/metadata/8fb41bc7-a106-4b9e-879b-392da799f958.parquet
```

#### Benchmark with profiling

Measure performance and generate a flamegraph for performance analysis:

```sh
greptime datanode objbench --config ./datanode.toml --source data/greptime/public/1024/1024_0000000000/metadata/8fb41bc7-a106-4b9e-879b-392da799f958.parquet --pprof-file=./flamegraph.svg
```

This will generate a flamegraph in SVG format that can be opened in a web browser for performance analysis.

## scanbench

The `scanbench` subcommand benchmarks region scans directly from storage.

### Options

| Option                               | Description                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `--config <FILE>`                    | Path to the datanode/standalone configuration file (TOML format).                                                        |
| `--region-id <REGION_ID>`            | Region ID in one of: `<u64>` (for example, `4398046511104`) or `<table_id>:<region_number>` (for example, `1024:0`).     |
| `--table-dir <TABLE_DIR>`            | Table directory used in open request (for example, `greptime/public/1024`).                                              |
| `--scanner <seq\|unordered\|series>` | Scan strategy. Defaults to `seq`.                                                                                        |
| `--scan-config <FILE>`               | JSON file used to tune the scan request.                                                                                 |
| `--parallelism <N>`                  | Simulated scan parallelism. Defaults to `1`.                                                                             |
| `--iterations <N>`                   | Benchmark iterations. Defaults to `1`.                                                                                   |
| `--path-type <bare\|data\|metadata>` | Region path type. Defaults to `bare`.                                                                                    |
| `--enable-wal`                       | Enable WAL replay when opening the region. Disabled by default.                                                          |
| `--pprof-file <FILE>`                | Output file path for pprof flamegraph (Unix only).                                                                       |
| `--pprof-after-warmup`               | Start pprof after the first iteration (use the first iteration as warmup). Requires `--pprof-file`. Disabled by default. |
| `-v`/`--verbose`                     | Enable verbose output.                                                                                                   |

### `scan-config` JSON

```json
{
  "projection_names": ["host", "cpu"],
  "filters": ["host = 'web-1'", "cpu > 80"],
  "series_row_selector": "last_row"
}
```

Notes:

- All fields are optional.
- Use either `projection` (indexes) or `projection_names` (column names), not both.
- `projection_names` uses exact (case-sensitive) column name matching.
- `filters` should be SQL expressions (not full SQL statements).
- `series_row_selector` currently supports only `last_row`.

### Examples

#### Default sequential scan

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir greptime/public/1024
```

#### Unordered scan with parallelism

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir greptime/public/1024 --scanner unordered --parallelism 8 --iterations 5
```

#### Series scan on metric engine data directory

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir data/greptime/public/1024 --parallelism 16 --scan-config ./scanconfig.json --scanner series --path-type data --iterations 10
```

Example `scanconfig.json`:

```json
{
  "projection_names": ["greptime_timestamp", "greptime_value", "az", "hostname", "region", "__tsid"],
  "filters": [
    "mode = 'idle'",
    "region = 'us-west-2'",
    "greptime_timestamp >= 1742550540001",
    "greptime_timestamp <= 1742552400000",
    "__table_id = 1182"
  ]
}
```

#### Profile after warmup iteration

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir greptime/public/1024 --iterations 5 --pprof-file ./scanbench.svg --pprof-after-warmup
```
