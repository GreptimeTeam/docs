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
| `--scan-configs <FILE>` | 带名称的扫描请求 JSON 数组，每个请求执行一次。与 `--scan-config` 互斥。 |
| `--parallelism <N>`                  | 模拟扫描并行度，默认 `1`。                                                                                |
| `--iterations <N>` | 单请求模式的迭代次数，默认 `1`；使用 `--scan-configs` 时必须保持为 `1`。 |
| `--path-type <bare\|data\|metadata>` | Region 路径类型，默认 `bare`。                                                                            |
| `--enable-wal`                       | 打开 region 时启用 WAL 回放，默认关闭。                                                                   |
| `--pprof-file <FILE>`                | pprof 火焰图输出路径（仅 Unix）。                                                                         |
| `--result-file <FILE>` | 在所有扫描成功后，将结构化基准测试结果写入 JSON 文件，并收集详细 scanner 指标。 |
| `--pprof-after-warmup`               | 在首轮迭代（warmup）后再开始 pprof。需要与 `--pprof-file` 一起使用，默认关闭。                            |
| `-v`/`--verbose` | 输出详细 scanner 指标、各分区统计和分区间的数据倾斜情况。 |

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

### 使用 `scan-configs` 执行查询集

使用 `--scan-configs` 执行 JSON 数组中的多个扫描请求。每个元素支持与 `scan-config` 相同的字段，还可以通过可选的 `name` 字段指定名称：

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

将其保存为 `scan-configs.json`，并根据目标 region 调整列名和过滤条件：

```sh
greptime datanode scanbench \
  --config ./datanode.toml \
  --region-id 1024:0 \
  --table-dir greptime/public/1024 \
  --scan-configs ./scan-configs.json \
  --result-file ./scanbench-results.json \
  --verbose
```

查询集规则：

- `--scan-configs` 与 `--scan-config` 互斥。
- 数组必须包含至少一个请求。每个请求按文件中的顺序执行一次，执行次数由数组长度决定。`--iterations` 必须保持为 `1`。
- 未指定名称时，按元素在数组中的位置生成 `query-001`、`query-002` 等名称。显式指定的名称会去除首尾空白。所有名称（包括自动生成的名称）都必须非空且唯一。
- Scanbench 会在开始基准测试前校验所有请求，并输出总体平均值和每个查询的汇总信息。
- 同时使用 `--pprof-file` 和 `--pprof-after-warmup` 时，第一个请求用于预热，在第二个请求开始前启动性能分析。此时需要至少两个请求。预热请求仍计入输出的统计信息。

不使用 `--scan-configs` 时，仍按现有的单请求模式，根据 `--iterations` 重复执行扫描请求。

### 结构化 JSON 结果

单请求和查询集模式都可以使用 `--result-file <FILE>` 保存基准测试结果。所有扫描成功完成后才会写入结果文件，并覆盖该路径下的已有文件。如果配置校验或任意扫描失败，则不会写入结果文件。即使没有指定 `--verbose`，该选项也会收集详细的 scanner 指标。

JSON 文档包含以下字段：

| 字段 | 描述 |
| --- | --- |
| `format_version` | 结果格式版本，当前为 `1`。 |
| `started_at_unix_ms` | 基准测试开始时间，以 Unix epoch 起算的毫秒数表示。 |
| `benchmark` | Scanner、region 标识、表目录、路径类型、并行度、WAL 设置、`config_mode`（`single` 或 `suite`）和执行次数。 |
| `runs` | 按执行顺序记录的结果，包括查询名称、规范化配置、行数和 batch 数、准备/扫描/总耗时、内存大小、分区统计和详细的 `scanner_explain` 输出。 |
| `summary` | 总执行次数、总行数和总耗时、平均行数和平均耗时，以及 `queries` 中各查询的汇总信息。 |

规范化配置的 `projection` 使用解析后的列索引，即使输入使用的是 `projection_names`。耗时字段以 `_ns` 结尾，单位为纳秒；大小字段以 `_bytes` 结尾。每个分区包含行数和 batch 数、内存大小、耗时以及 `first_batch_elapsed_ns`；如果该分区没有产生 batch，后者为 `null`。

启用详细终端输出时，还会显示每个分区的行数、首个 batch 延迟、耗时以及分区间的数据倾斜情况。

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

## parquetbench

`parquetbench` 子命令用于对单个 GreptimeDB Parquet SST 文件的读取性能进行基准测试，支持本地文件和 datanode 或 standalone 配置中指定的对象存储。

文件必须包含 GreptimeDB region 元数据。不含这些元数据的普通 Parquet 文件无法使用此命令进行基准测试。

### 选项

查看当前二进制支持的选项：

```sh
greptime datanode parquetbench --help
```

| 选项 | 描述 |
| --- | --- |
| `--file-path <FILE>` | 本地 GreptimeDB SST 文件。仅支持 `direct` reader。 |
| `--config <FILE>` | 用于访问对象存储的 datanode/standalone TOML 配置文件。region 模式下必填。 |
| `--region-id <REGION_ID>` | Region ID，支持打包后的无符号整数或 `<table_id>:<region_number>` 格式，例如 `1024:0`。region 模式下必填。 |
| `--table-dir <TABLE_DIR>` | 相对于 data home 的表目录，例如 `data/greptime/public/1024`。region 模式下必填。 |
| `--file-id <FILE_ID>` | SST 文件的 UUID。region 模式下必填。 |
| `--reader <direct\|flat-prune>` | Reader 实现，默认为 `direct`。`flat-prune` 使用存储引擎的 flat pruning reader，仅支持 region 模式。 |
| `--path-type <bare\|data\|metadata>` | region 模式下的路径类型，默认为 `bare`。 |
| `--scan-config <FILE>` | 用于选择列和行组的 JSON 文件。 |
| `--iterations <N>` | 基准测试迭代次数，默认为 `1`。 |
| `--batch-size <ROWS>` | `direct` reader 每个 record batch 的行数，必须大于零，默认为 `8192`。 |
| `--pk-as-binary` | 使用 `direct` reader 时，将 `__primary_key` 读取为二进制数组而非字典数组。默认关闭。 |
| `--pprof-file <FILE>` | SVG 火焰图的输出路径（仅 Unix）。 |
| `--pprof-after-warmup` | 在第一次迭代后开始性能分析。需配合 `--pprof-file` 使用，且迭代次数至少为 2。默认关闭。 |
| `-v`/`--verbose` | 启用详细输出。 |

本地文件模式不能与 `--config`、`--region-id`、`--table-dir` 或 `--file-id` 同时使用。不指定 `--file-path` 时，必须提供这四个 region 模式参数。

### 对本地 SST 进行基准测试

```sh
greptime datanode parquetbench \
  --file-path /tmp/source.parquet \
  --reader direct \
  --iterations 5 \
  --batch-size 8192
```

命令会输出每次迭代的行数、record batch 数、耗时和吞吐量。执行多次迭代时，还会输出平均值。

### 对对象存储中的 SST 进行基准测试

```sh
greptime datanode parquetbench \
  --config ./datanode.toml \
  --region-id 1024:0 \
  --table-dir data/greptime/public/1024 \
  --file-id 00020380-009c-426d-953e-b4e34c15af34 \
  --path-type bare \
  --reader flat-prune \
  --iterations 5
```

请使用与目标 SST 对应的配置文件、Region ID、表目录、文件 ID 和路径类型。

### 选择列和行组

将以下内容保存为 `parquet-scan.json`，并根据 SST 的实际内容调整列名和行组索引：

```json
{
  "projection_names": ["host", "value", "ts"],
  "row_groups": [0, 2]
}
```

两个字段都是可选的。不设置 `projection_names` 时读取所有列，不设置 `row_groups` 时读取所有行组。行组索引从 0 开始，且必须在文件中存在。列名区分大小写。使用 `direct` reader 时，列名对应 SST schema 中的列；使用 `flat-prune` 时，列名对应 region 中的列，内部列名会被忽略。

```sh
greptime datanode parquetbench \
  --file-path /tmp/source.parquet \
  --scan-config ./parquet-scan.json \
  --iterations 5
```

### 预热后进行性能分析

在 Unix 上生成火焰图，并跳过第一次迭代的性能分析：

```sh
greptime datanode parquetbench \
  --file-path /tmp/source.parquet \
  --iterations 5 \
  --pprof-file ./parquetbench.svg \
  --pprof-after-warmup
```

第一次迭代仍计入输出的平均值。
