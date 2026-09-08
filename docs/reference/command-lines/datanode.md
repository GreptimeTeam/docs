---
keywords: [GreptimeDB datanode, command-line interface, datanode configuration, datanode startup, datanode options, datanode examples]
description: Command-line options and examples for starting and inspecting GreptimeDB datanode instances.
---

# Datanode

The `greptime datanode` command provides subcommands for managing and benchmarking datanode instances.

## start

Start the datanode service.

### Options

Print the options supported by the current binary:

```
greptime datanode start --help
```

| Option                                | Description                                                                                                                                                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | The configuration file for datanode                                                                                                                                                                                                                                           |
| `--data-home <DATA_HOME>`             | Database storage root directory                                                                                                                                                                                                                                               |
| `--env-prefix <ENV_PREFIX>`           | The prefix of environment variables, default is `GREPTIMEDB_DATANODE`                                                                                                                                                                                                         |
| `--http-addr <HTTP_ADDR>`             | HTTP server address                                                                                                                                                                                                                                                           |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP request timeout in seconds                                                                                                                                                                                                                                               |
| `--log-dir <LOG_DIR>`                 | Log directory                                                                                                                                                                                                                                                                 |
| `--log-level <LOG_LEVEL>`             | Log level                                                                                                                                                                                                                                                                     |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv address list                                                                                                                                                                                                                                                          |
| `--node-id <NODE_ID>`                 | The datanode ID                                                                                                                                                                                                                                                               |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | The address to bind the gRPC server                                                                                                                                                                                                                                           |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | The address advertised to the metasrv, and used for connections from outside the host. If left empty or unset, the server will automatically use the IP address of the first network interface on the host, with the same port number as the one specified in `grpc_bind_addr` |
| `--wal-dir <WAL_DIR>`                 | Overrides the WAL directory when using the Raft Engine WAL backend                                                                                                                                                                                                            |

All the `addr` options are in the form of `ip:port`.

### Examples

#### Start service with configurations

Start a Datanode instance from a configuration file:

```sh
greptime datanode start -c config/datanode.example.toml
```

Start a Datanode instance and specify its gRPC address, Metasrv address, and node ID on the command line:

```sh
greptime datanode start --grpc-bind-addr=0.0.0.0:4001 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```

The [`datanode.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/main/config/datanode.example.toml) file is in the GreptimeDB repository. The `-c` option selects the configuration file; see [Configuration](/user-guide/deployments-administration/configuration.md) for details.

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

This generates an SVG flamegraph that can be opened in a web browser for performance analysis.

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
| `--scan-configs <FILE>` | JSON array of named scan requests, each executed once. Conflicts with `--scan-config`. |
| `--parallelism <N>`                  | Simulated scan parallelism. Defaults to `1`.                                                                             |
| `--iterations <N>` | Single-request benchmark iterations. Defaults to `1`; must remain `1` with `--scan-configs`. |
| `--path-type <bare\|data\|metadata>` | Region path type. Defaults to `bare`.                                                                                    |
| `--enable-wal`                       | Enable WAL replay when opening the region. Disabled by default.                                                          |
| `--pprof-file <FILE>`                | Output file path for pprof flamegraph (Unix only).                                                                       |
| `--result-file <FILE>` | Write structured benchmark results as JSON after all scans succeed. Collects verbose scanner metrics. |
| `--pprof-after-warmup`               | Start pprof after the first iteration (use the first iteration as warmup). Requires `--pprof-file`. Disabled by default. |
| `-v`/`--verbose` | Print verbose scanner metrics, per-partition statistics, and partition skew. |

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

### Query suites with `scan-configs`

Use `--scan-configs` to run a JSON array of scan requests. Each entry supports the same fields as `scan-config`, plus an optional `name`:

```json
[
  {
    "name": "cold",
    "projection_names": ["host", "cpu"],
    "filters": ["host = 'web-1'"]
  },
  {
    "name": "hot-001",
    "projection_names": ["host", "cpu"],
    "filters": ["host = 'web-2'"]
  }
]
```

Save this as `scan-configs.json`, adjusting the columns and filters to match your region:

```sh
greptime datanode scanbench \
  --config ./datanode.toml \
  --region-id 1024:0 \
  --table-dir greptime/public/1024 \
  --scan-configs ./scan-configs.json \
  --result-file ./scanbench-results.json \
  --verbose
```

Suite rules:

- `--scan-configs` and `--scan-config` are mutually exclusive.
- The array must contain at least one request. Each request runs exactly once in file order; the array length determines the run count. `--iterations` must remain `1`.
- Omitted names become `query-001`, `query-002`, and so on, based on their position in the array. Explicit names are trimmed of surrounding whitespace. All names, including generated names, must be non-empty and unique.
- Scanbench validates every request before starting the benchmark and reports both overall averages and per-query summaries.
- With `--pprof-file` and `--pprof-after-warmup`, the first request is the warmup and profiling starts before the second request. Use at least two requests. The warmup still contributes to the reported statistics.

Without `--scan-configs`, the existing single-request mode continues to repeat the request according to `--iterations`.

### Structured JSON results

Use `--result-file <FILE>` with either a single request or a query suite to save benchmark results. The file is written after all scans complete successfully, replacing an existing file at that path. If configuration validation or any scan fails, the result file is not written. The option collects verbose scanner metrics even without `--verbose`.

The JSON document contains:

| Field | Description |
| --- | --- |
| `format_version` | Result format version, currently `1`. |
| `started_at_unix_ms` | Benchmark start time in milliseconds since the Unix epoch. |
| `benchmark` | Scanner, region identifiers, table directory, path type, parallelism, WAL setting, `config_mode` (`single` or `suite`), and run count. |
| `runs` | Results in execution order, including query names, normalized configs, row and batch counts, setup/scan/total timing, memory sizes, partition statistics, and verbose `scanner_explain` output. |
| `summary` | Overall run count, total rows and elapsed time, mean rows and elapsed time, and per-query summaries in `queries`. |

Normalized configs use resolved column indexes in `projection`, including when the input uses `projection_names`. Duration fields end in `_ns` and use nanoseconds; size fields end in `_bytes`. Each partition includes row and batch counts, memory sizes, elapsed time, and `first_batch_elapsed_ns`, which is `null` if it produced no batch.

Verbose terminal output also reports per-partition row counts, first-batch latency, elapsed time, and partition skew.

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
