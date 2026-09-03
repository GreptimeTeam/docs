---
keywords: [GreptimeDB datanode, 命令行界面, datanode 配置, datanode 启动, datanode 选项, datanode 示例]
description: GreptimeDB datanode 的启动与诊断命令行选项和示例。
---

# Datanode

`greptime datanode` 命令提供了用于管理和基准测试 datanode 实例的子命令。

## start

启动 datanode 服务。

### 选项

运行以下命令查看当前二进制支持的选项：

```
greptime datanode start --help
```

| 选项                                  | 描述                                                                                                                                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `-c`/`--config-file <CONFIG_FILE>`    | Datanode 的配置文件                                                                                                                             |
| `--data-home <DATA_HOME>`             | 数据库存储 home 目录                                                                                                                            |
| `--env-prefix <ENV_PREFIX>`           | 配置的环境变量前缀，默认为`GREPTIMEDB_DATANODE`                                                                                                 |
| `--http-addr <HTTP_ADDR>`             | HTTP 服务器地址                                                                                                                                 |
| `--http-timeout <HTTP_TIMEOUT>`       | HTTP 超时设置，单位秒                                                                                                                           |
| `--log-dir <LOG_DIR>`                 | 日志目录                                                                                                                                        |
| `--log-level <LOG_LEVEL>`             | 日志级别                                                                                                                                        |
| `--metasrv-addrs <METASRV_ADDRS>...`  | Metasrv 服务器列表                                                                                                                              |
| `--node-id <NODE_ID>`                 | 节点 ID                                                                                                                                         |
| `--grpc-bind-addr <GRPC_BIND_ADDR>`     | gRPC 服务绑定地址                                                                                                                               |
| `--grpc-server-addr <GRPC_SERVER_ADDR>` | 该地址用于来自主机外部的连接和通信。如果留空或未设置，服务器将自动使用主机上第一个网络接口的 IP 地址，其端口号与 `grpc_bind_addr` 中指定的相同； |
| `--wal-dir <WAL_DIR>`                 | 使用 Raft Engine 作为 WAL 后端时覆盖 WAL 目录                                                                                                    |

所有的 `addr` 类选项都是 `ip:port` 形式的字符串。

### 示例

#### 使用配置启动服务

使用配置文件启动 Datanode 实例：

```sh
greptime datanode start -c config/datanode.example.toml
```

使用命令行参数启动 Datanode，并指定 gRPC 服务地址、Metasrv 地址和 Datanode ID：

```sh
greptime datanode start --grpc-bind-addr=0.0.0.0:4001 --metasrv-addrs=0.0.0.0:3002 --node-id=1
```

[`datanode.example.toml`](https://github.com/GreptimeTeam/greptimedb/blob/main/config/datanode.example.toml) 位于 GreptimeDB 仓库中。`-c` 选项用于选择配置文件，详见[配置](/user-guide/deployments-administration/configuration.md)。

## objbench

`objbench` 子命令是一个用于测量对象存储上特定文件读写性能的基准测试工具。这对于诊断性能问题和测试存储层性能非常有用。

### 选项

| 选项                  | 描述                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `--config <FILE>`     | datanode 配置文件路径（TOML 格式）                                                                      |
| `--source <PATH>`     | 对象存储中的源 SST 文件路径（例如 `data/greptime/public/1024/1024_0000000000/metadata/<uuid>.parquet`） |
| `-v`/`--verbose`      | 启用详细输出                                                                                            |
| `--pprof-file <FILE>` | pprof 火焰图的输出文件路径（启用性能分析）。生成 SVG 格式的火焰图文件                                   |

### 示例

#### 基础基准测试

测量特定文件的读写性能：

```sh
greptime datanode objbench --config ./datanode.toml --source data/greptime/public/1024/1024_0000000000/metadata/8fb41bc7-a106-4b9e-879b-392da799f958.parquet
```

#### 带性能分析的基准测试

测量性能并生成用于性能分析的火焰图：

```sh
greptime datanode objbench --config ./datanode.toml --source data/greptime/public/1024/1024_0000000000/metadata/8fb41bc7-a106-4b9e-879b-392da799f958.parquet --pprof-file=./flamegraph.svg
```

该命令生成可在浏览器中打开的 SVG 火焰图，用于性能分析。

## scanbench

`scanbench` 子命令用于直接从存储层对 region 扫描进行基准测试。

### 选项

| 选项                                 | 描述                                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `--config <FILE>`                    | datanode/standalone 配置文件路径（TOML 格式）。                                                           |
| `--region-id <REGION_ID>`            | Region ID 支持两种格式：`<u64>`（例如 `4398046511104`）或 `<table_id>:<region_number>`（例如 `1024:0`）。 |
| `--table-dir <TABLE_DIR>`            | 打开 region 时使用的表目录（例如 `greptime/public/1024`）。                                               |
| `--scanner <seq\|unordered\|series>` | 扫描策略，默认 `seq`。                                                                                    |
| `--scan-config <FILE>`               | 用于微调扫描请求的 JSON 文件。                                                                            |
| `--parallelism <N>`                  | 模拟扫描并行度，默认 `1`。                                                                                |
| `--iterations <N>`                   | 基准测试迭代次数，默认 `1`。                                                                              |
| `--path-type <bare\|data\|metadata>` | Region 路径类型，默认 `bare`。                                                                            |
| `--enable-wal`                       | 打开 region 时启用 WAL 回放，默认关闭。                                                                   |
| `--pprof-file <FILE>`                | pprof 火焰图输出路径（仅 Unix）。                                                                         |
| `--pprof-after-warmup`               | 在首轮迭代（warmup）后再开始 pprof。需要与 `--pprof-file` 一起使用，默认关闭。                            |
| `-v`/`--verbose`                     | 启用详细输出。                                                                                            |

### `scan-config` JSON

```json
{
  "projection_names": ["host", "cpu"],
  "filters": ["host = 'web-1'", "cpu > 80"],
  "series_row_selector": "last_row"
}
```

说明：

- 所有字段均为可选。
- `projection`（列索引）与 `projection_names`（列名）二选一。
- `projection_names` 采用精确匹配（区分大小写）。
- `filters` 应为 SQL 表达式（而非完整 SQL 语句）。
- `series_row_selector` 当前仅支持 `last_row`。

### 示例

#### 默认顺序扫描

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir greptime/public/1024
```

#### 使用并行度的无序扫描

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir greptime/public/1024 --scanner unordered --parallelism 8 --iterations 5
```

#### 扫描 metric engine 数据目录的 series 扫描

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir data/greptime/public/1024 --parallelism 16 --scan-config ./scanconfig.json --scanner series --path-type data --iterations 10
```

`scanconfig.json` 示例：

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

#### warmup 后开始性能分析

```sh
greptime datanode scanbench --config ./datanode.toml --region-id 1024:0 --table-dir greptime/public/1024 --iterations 5 --pprof-file ./scanbench.svg --pprof-after-warmup
```
