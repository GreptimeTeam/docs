---
keywords: [性能调优, 查询性能, 缓存配置, 写入优化, 表结构设计, 指标监控, 对象存储, 批量写入, append-only 表]
description: 提供 GreptimeDB 性能调优的技巧，包括查询性能指标、缓存配置、写入优化和表结构设计建议。
---

# 性能调优技巧

GreptimeDB 实例的默认配置可能不适合所有场景。因此根据场景调整数据库配置和使用方式相当重要。

GreptimeDB 提供了各种指标来帮助监控和排查性能问题。官方仓库里提供了用于独立模式和集群模式的 [Grafana dashboard 模版](https://github.com/GreptimeTeam/greptimedb/tree/main/grafana)。

## 查询

### 分析查询性能

要排查慢查询，请使用 `EXPLAIN ANALYZE VERBOSE` 重新运行查询：

```sql
EXPLAIN ANALYZE VERBOSE <SQL>;
```

`EXPLAIN ANALYZE` 会执行查询并采集各执行阶段的运行时指标。`VERBOSE` 选项会增加 scan 级别的指标，有助于判断查询变慢的原因以及可以如何优化。输出中各项指标的含义请参阅 [EXPLAIN](/reference/sql/explain.md)。

比较多次运行结果时，请注意缓存状态可能影响第二次运行的耗时和结果。如果想避免测量完全命中缓存的重复查询，可以在保持查询形态等价的前提下稍微修改查询条件，例如平移时间范围。

如果仍无法判断原因，请在创建 issue 时附上完整的 `EXPLAIN ANALYZE VERBOSE` 输出。

常见发现：

- **需要搜索大量小文件**：`num_file_ranges` 较高，尤其是许多文件不足一个完整 row group 时，通常表示扫描需要打开大量小 SST 文件。这往往来自对大量不同时间窗口的回填，或 compaction 压力较高。可以考虑调整 `compaction.twcs.time_window`，检查写入或回填模式，让行更自然地填满时间窗口，并检查 compaction 状态。如果文件数量不多，小文件不一定会影响性能。
- **扫描后过滤了大量行**：如果 `scan_cost` 较高且 `rows_precise_filtered` 也较高，说明扫描读取了大量候选行，然后又通过精确过滤移除了它们。可以考虑为选择性较高的过滤列添加合适的[索引](/user-guide/manage-data/data-index.md)。索引变更会作用于新 flush 的数据，不会立即重写所有已有 SST 文件。
- **数据读取时本地缓存未命中**：如果 `fetch_metrics.cache_miss`、`fetch_metrics.pages_to_fetch_store` 或 `fetch_metrics.store_fetch_elapsed` 较高，说明 GreptimeDB 正在从对象存储读取 page 数据，而不是从本地缓存读取。请检查下文的缓存指标，并考虑增大 `write_cache_size` 或 `page_cache_size`。
- **扫描准备成本较高**：`build_parts_cost` 或 `build_reader_cost` 较高，表示 GreptimeDB 花了较多时间构建扫描范围或 reader。请结合 `num_file_ranges`、元数据缓存未命中以及缓存压力一起分析。
- **元数据加载时间较高**：如果 `metadata_cache_metrics.metadata_load_cost` 或 `metadata_cache_metrics.cache_miss` 较高，可能是 SST 元数据缓存过小。请检查 `greptime_mito_cache_bytes{type="sst_meta"}`，并考虑增大 `sst_meta_cache_size`。

### 指标

以下指标可用于诊断查询性能问题：

| 指标 | 类型 | 描述 |
|---|---|---|
| greptime_mito_read_stage_elapsed_bucket | histogram | 存储引擎中查询不同阶段的耗时。 |
| greptime_mito_cache_bytes | gauge | 缓存内容的大小。`type` 标签表示缓存类型。 |
| greptime_mito_cache_hit | counter | 缓存命中总数。`type` 标签表示缓存类型。 |
| greptime_mito_cache_miss | counter | 缓存未命中总数。`type` 标签表示缓存类型。 |
| greptime_mito_cache_eviction | counter | 缓存淘汰总数。`type` 标签表示缓存类型。 |

### 增大缓存大小

将 `greptime_mito_cache_bytes{type="..."}` 作为判断缓存压力的主要信号。如果该指标经常接近对应缓存的配置容量，可以考虑增大该缓存。如果该指标长期远低于容量，可以考虑减小该缓存，为其他缓存释放内存或磁盘空间。使用 `greptime_mito_cache_hit`、`greptime_mito_cache_miss` 和 `greptime_mito_cache_eviction` 作为辅助信号，判断调整某个缓存是否有价值。

以下示例列出了主要的缓存大小配置。部分缓存的默认大小会根据系统内存自动调整。各选项的默认值请参阅[配置](/user-guide/deployments-administration/configuration.md#region-engine-options)。

```toml
[[region_engine]]
[region_engine.mito]
# 写入缓存的大小。数据文件对应的 `type` 标签值为 `file`。
write_cache_size = "10G"
# 分配给索引（puffin）文件的写入缓存容量百分比。
# 此缓存的 `type` 标签值为 `index`。
index_cache_percent = 20
# SST 元数据的缓存大小。此缓存的 `type` 标签值为 `sst_meta`。
sst_meta_cache_size = "128MB"
# 向量和 Arrow array 的缓存大小。此缓存的 `type` 标签值为 `vector`。
vector_cache_size = "512MB"
# SST 行组页面的缓存大小。此缓存的 `type` 标签值为 `page`。
page_cache_size = "512MB"
# 时间序列 selector（例如 `last_value()`）结果缓存大小。此缓存的 `type` 标签值为 `selector_result`。
selector_result_cache_size = "512MB"
# Flat range scan 结果缓存大小。此缓存的 `type` 标签值为 `range_result`。
range_result_cache_size = "512MB"
# Prefilter 结果缓存大小。此缓存的 `type` 标签值为 `prefilter_result`。
prefilter_result_cache_size = "128MB"
# Manifest 文件缓存大小。此缓存的 `type` 标签值为 `manifest`。
manifest_cache_size = "256MB"

[region_engine.mito.index]
# 索引元数据缓存大小。此缓存的 `type` 标签值为 `index_metadata`。
metadata_cache_size = "64MiB"
# 索引内容缓存大小。此缓存的 `type` 标签值为 `index_content`。
content_cache_size = "128MiB"
# 索引内容缓存的页大小。
content_cache_page_size = "64KiB"
# 索引查询结果缓存大小。此缓存的 `type` 标签值为 `index_result`。
result_cache_size = "128MiB"
# 索引暂存目录的最大容量。此缓存的 `type` 标签值为 `index_staging`。
staging_size = "2GB"
```

一些建议：

- 至少将写入缓存设置为磁盘空间的 1/10。使用对象存储时，建议使用较大的写入缓存。
- 写入缓存通过 `index_cache_percent` 在数据文件和索引（puffin）文件之间拆分。如果 `greptime_mito_cache_bytes{type="index"}` 已满，而 `greptime_mito_cache_bytes{type="file"}` 未满，可以考虑增大 `index_cache_percent`。
- 如果某个缓存相比其配置容量长期较小，可以减小该缓存，并把资源分配给压力更高的缓存。
- 如果数据库内存使用率低于 20%，则可以至少将 `page_cache_size` 设置为总内存大小的 1/4。
- 如果缓存命中率低于 50%，则可以将缓存大小翻倍。
- 只有当索引搜索工作负载中 `greptime_mito_cache_bytes{type="index_staging"}` 接近容量，或暂存目录未命中和淘汰显示存在压力时，才需要调大 `index.staging_size`。并非每个部署都需要增大该设置。

### SST 格式

GreptimeDB 默认使用 `flat` 格式将数据存储在 SST 文件中。它适用于所有主键基数，包括 `trace_id` 或 `uuid` 等高基数主键，因此通常不需要手动设置 `sst_format` 选项。对于具有高基数主键的表，还可以考虑使用 [append-only](/reference/sql/create.md#创建-append-only-表) 表来进一步提升性能。

唯一需要设置 `sst_format` 的场景是从默认使用遗留 `primary_key` 格式的旧版本 GreptimeDB 升级。在这种情况下，可以将这些表切换为 `flat`。如何修改已有表的格式，请参考 [SST 格式](/user-guide/deployments-administration/performance-tuning/design-table.md#sst-格式)指南；参考信息请见 [SST 格式](/reference/sql/create.md#创建指定-sst-格式的表)。

### 尽可能使用 append-only 表

一般来说，append-only 表具有更高的扫描性能，因为存储引擎可以跳过合并和去重操作。此外，如果表是 append-only 表，查询引擎可以使用统计信息来加速某些查询。

如果表不需要去重或性能优先于去重，我们建议为表启用 [append_mode](/reference/sql/create.md#创建-append-only-表)。例如，日志表应该是 append-only 表，因为日志消息可能具有相同的时间戳。

### 禁用预写式日志(WAL)

如果您是从 Kafka 等可以重放的数据源消费并写入到 GreptimeDB，可以通过禁用 WAL 来进一步提升写入吞吐量。

请注意，当 WAL 被禁用后，未刷新到磁盘或对象存储的数据将无法恢复，需要从原始数据源重新恢复，比如重新从 Kafka 读取或重新抓取日志。

通过设置表选项 `skip_wal='true'` 来禁用 WAL：

```sql
CREATE TABLE logs(
  message STRING,
  ts TIMESTAMP TIME INDEX
) WITH (skip_wal = 'true');
```

## 写入

### 批量写入行

批量写入是指通过同一个请求将多行数据发送到数据库。这可以显著提高写入吞吐量。建议的起始值是每批 1000 行。如果延迟和资源使用仍然可以接受，可以扩大攒批大小。

### 按时间窗口写入

虽然 GreptimeDB 可以处理乱序数据，但乱序数据仍然会影响性能。GreptimeDB 从写入的数据中推断出时间窗口的大小，并根据时间戳将数据划分为多个时间窗口。如果写入的行不在同一个时间窗口内，GreptimeDB 需要将它们拆分，这会影响写入性能。

通常，实时数据不会出现上述问题，因为它们始终使用最新的时间戳。如果需要将具有较长时间范围的数据导入数据库，我们建议提前创建表并[指定 compaction.twcs.time_window 选项](/reference/sql/create.md#创建自定义-compaction-参数的表)。

### 指标

以下指标有助于诊断写入问题。大多数指标可在官方 Grafana dashboard 中找到。需要自定义 PromQL 或深入排查时，可以使用下列指标名。

| 指标 | 类型 | 描述 |
|---|---|---|
| greptime_table_operator_ingest_rows | counter | table operator 摄入的行数。可使用该指标的 rate 追踪总写入负载。 |
| greptime_servers_http_requests_elapsed_bucket | histogram | HTTP 请求延迟。可使用 `path`、`method` 和 `code` 等标签定位写入相关延迟。 |
| greptime_servers_grpc_requests_elapsed_bucket | histogram | gRPC 请求延迟。可使用 `path` 和 `code` 等标签定位写入相关延迟。 |
| greptime_mito_handle_request_elapsed_bucket | histogram | Datanode 上处理存储引擎请求的耗时。 |
| greptime_mito_write_stage_elapsed_bucket | histogram | 存储引擎中处理写入请求的不同阶段的耗时。 |
| greptime_mito_write_buffer_bytes | gauge | 当前为写入缓冲区（memtables）分配的字节数（估算）。 |
| greptime_mito_write_rows_total | counter | 写入存储引擎的行数。可用于比较不同 datanode 的写入负载。 |
| greptime_mito_write_stalling_count | gauge | 每个 worker 中当前被阻塞的写入请求数。 |
| greptime_mito_write_stall_total | counter | 由于高内存压力或临时 region 状态而被阻塞的写入请求总数。 |
| greptime_mito_write_reject_total | counter | 由于内存压力过高而被拒绝的写入请求数。 |
| raft_engine_sync_log_duration_seconds_bucket | histogram | 将 WAL 刷入磁盘的耗时。 |
| greptime_mito_flush_requests_total | counter | 已调度的 flush 请求数。 |
| greptime_mito_flush_elapsed | histogram | 刷入 SST 文件的耗时。 |
| greptime_mito_flush_bytes_total | counter | flush 到 SST 文件的字节数。 |
| greptime_mito_flush_file_total | counter | flush job 生成的 SST 文件数。 |

### 检查写入吞吐和请求延迟

使用 `rate(greptime_table_operator_ingest_rows[$__rate_interval])` 观察总摄入速率。协议层延迟请检查 `greptime_servers_http_requests_elapsed_bucket` 和 `greptime_servers_grpc_requests_elapsed_bucket`。可按 `path`、`method` 和 `code` 等标签过滤，将写入请求与健康检查、指标抓取和查询请求区分开。

如果 frontend 协议延迟较高，请将它与 datanode 侧指标对比，例如 `greptime_mito_handle_request_elapsed_bucket` 和 `greptime_mito_write_stage_elapsed_bucket`。这有助于判断瓶颈是在进入存储引擎之前的请求处理阶段，还是在 datanode 写入路径内部。

### 诊断 datanode 写入压力

当 datanode 写入变慢或摄入延迟较高时，首先检查写入缓冲区是否存在压力：

- `greptime_mito_write_buffer_bytes`
- `greptime_mito_write_stall_total`
- `greptime_mito_write_stalling_count`
- `greptime_mito_write_reject_total`

写入阻塞表示 GreptimeDB 正在施加背压，而不是立即接受写入。当全局写入缓冲区达到 `global_write_buffer_size`、region 达到其有效的单 region 阻塞阈值，或 region 在内部状态变化期间暂时不可写时，可能出现阻塞。如果客户端收到类似 `Engine write buffer is full, rejecting write requests` 的错误，表示 datanode 已达到由 `global_write_buffer_reject_size` 控制的全局拒绝阈值，或达到由 `write_buffer_size` / `default_region_write_buffer_size` 控制的单 region 拒绝阈值。

当 datanode 存在写入压力时，在调大写入缓冲区之前，请先检查 flush 性能和写入分布。增大写入缓冲区只会给 datanode 更多内存余量，并不能修复缓慢的 flush，也不能修复把大部分写入发送到单个 region 的不均衡表。

### 检查 flush 性能

如果写入缓冲区持续增长或写入频繁阻塞，请检查 flush 是否是瓶颈。使用 `greptime_mito_flush_elapsed` 查看 flush 延迟，并使用 `greptime_mito_flush_requests_total`、`greptime_mito_flush_bytes_total` 和 `greptime_mito_flush_file_total` 了解 flush 频率和吞吐。

Datanode 日志也有助于识别慢 flush 和热点 region。搜索 `Successfully flush memtables`。该日志行包含 region、flush 原因、SST 文件、`total_rows`、`total_bytes`、`cost`、编码 part 数以及 flush metrics。可以用 `total_rows` 或 `total_bytes` 除以 `cost` 来估算 flush 吞吐。

如果 flush 耗时较高，例如达到 30 秒或更久，或者 flush 吞吐低于摄入速度，增大写入缓冲区通常只会延后阻塞或拒绝。在这种情况下，请检查表分区和 region 分布，让 flush 工作可以分散到更多 region 和 datanode。

如果 flush job 很快，通常几秒内完成，但 flush 请求速率较高且写入缓冲区压力经常出现，增大写入缓冲区可以帮助降低 flush 频率。

### 检查写入分布

对于分区表，请检查写入是否均匀分布在 datanode 和 region 之间。使用 `greptime_mito_write_rows_total` 比较 datanode 级别的写入行数，并使用 `greptime_mito_handle_request_elapsed_bucket` 比较 datanode 请求延迟。

也可以查询 [`REGION_STATISTICS`](/reference/sql/information-schema/region-statistics.md)，查看 `written_bytes_since_open` 和 `memtable_size` 等 region 级统计信息。如果某个 datanode 或某个 region 接收了大部分写入负载，请先调整表分区，让负载分散到更多 region 和 datanode，再考虑增大写入缓冲区。

### 调整写入缓冲区大小

如果阻塞或拒绝是由写入缓冲区压力导致的，并且 flush 性能和写入分布都正常，可以考虑增大 `region_engine.mito.global_write_buffer_size`。这对日志或链路追踪等大行工作负载最有用。默认情况下，`global_write_buffer_size` 会自动设置为操作系统内存的 1/8，最大 1GB。请逐步增大，例如调为 2 到 4 倍，并观察 datanode 内存使用情况。

多数情况下，请保持 `region_engine.mito.global_write_buffer_reject_size` 未设置，让 GreptimeDB 使用默认的拒绝阈值，即 `global_write_buffer_size` 的 2 倍。如果希望在内存压力下更早失败，可以根据可用 datanode 内存以及希望多早拒绝请求，手动设置一个有意保留的边界，通常为 `global_write_buffer_size` 的 1.5 到 2 倍。该值必须大于 `global_write_buffer_size`；否则 GreptimeDB 会将其修正回 2 倍。

如需保护热点 region，可以配置表级 `write_buffer_size`，或设置 `region_engine.mito.default_region_write_buffer_size` 作为集群默认值。生效值是写入阻塞阈值：mutable memtable 内存用量达到该值的一半时，GreptimeDB 会调度 flush；达到该值时会阻塞写入，达到该值的 2 倍时会拒绝写入，而同一 worker 上的其他 region 可以继续接受写入。表级 `write_buffer_size` 优先于引擎默认值。表级选项显式设置为 `0` 会禁用单 region 限制，取消设置则会回退到引擎默认值。`default_region_write_buffer_size` 的默认值为 `0`，表示禁用默认单 region 限制。

示例：

```toml
[[region_engine]]
[region_engine.mito]
global_write_buffer_size = "2GB"
# 可选。除非需要自定义拒绝边界，否则保持未设置。
global_write_buffer_reject_size = "3GB"
# 可选。使用 0 禁用默认单 region 限制。
default_region_write_buffer_size = "512MB"
```

如需覆盖特定表的 region 限制：

```sql
ALTER TABLE monitor SET 'write_buffer_size'='1GB';
```

## 表结构

### 使用多值

在设计架构时，我们建议将可以一起收集的相关指标放在同一个表中。这也可以提高写入吞吐量和压缩率。

例如，以下三个表收集了 CPU 的使用率指标。

```sql
CREATE TABLE IF NOT EXISTS cpu_usage_user (
  hostname STRING NULL,
  usage_value BIGINT NULL,
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
  PRIMARY KEY (hostname)
);
CREATE TABLE IF NOT EXISTS cpu_usage_system (
  hostname STRING NULL,
  usage_value BIGINT NULL,
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
  PRIMARY KEY (hostname)
);
CREATE TABLE IF NOT EXISTS cpu_usage_idle (
  hostname STRING NULL,
  usage_value BIGINT NULL,
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
  PRIMARY KEY (hostname)
);
```

我们可以将它们合并为一个具有三个字段的表。

```sql
CREATE TABLE IF NOT EXISTS cpu (
  hostname STRING NULL,
  usage_user BIGINT NULL,
  usage_system BIGINT NULL,
  usage_idle BIGINT NULL,
  ts TIMESTAMP(9) NOT NULL,
  TIME INDEX (ts),
  PRIMARY KEY (hostname)
);
```

## 采集性能分析数据

当 GreptimeDB CPU 或内存使用率较高且原因不明时，请从受影响节点采集性能分析数据，并提供给开发者进一步分析。

性能分析与平台相关，在某些平台或构建中可能不可用。CPU profiling 在大多数 Unix 平台上可用。Memory profiling 在 Linux 上可用，但在 macOS 或 Windows 上不可用。生成火焰图会消耗额外内存，因为 GreptimeDB 需要在进程内解析 profile 并符号化栈信息。从接近内存限制的节点采集火焰图时请格外谨慎。

性能分析是节点本地的。请将以下示例中的 `127.0.0.1:4000` 替换为 CPU 或内存使用率较高的 GreptimeDB 节点的 HTTP 地址。

### CPU profiling

在 CPU 使用率较高时采集 10 秒 CPU 火焰图：

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/cpu?seconds=10&output=flamegraph' > greptime-cpu.svg
```

### Memory profiling

Memory profiling 需要启用 heap profiling。官方 Docker 镜像默认启用 heap profiling。对于自行构建或非 Docker 部署，建议默认以启用 heap profiling 的方式启动 GreptimeDB：

```bash
MALLOC_CONF=prof:true ./greptime standalone start
```

当内存使用率较高时采集内存火焰图，尤其是在内存仍在增长或达到新峰值时：

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=flamegraph' > greptime-mem.svg
```

也可以在不同时间采集两份内存 profile 并进行对比，以识别新增分配：

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=proto' > greptime-mem-before.pprof
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=proto' > greptime-mem-after.pprof
```

端点参考请参阅[性能分析工具](/reference/http-endpoints.md#性能分析工具)。

报告问题时，请包含：

- GreptimeDB 版本和部署模式。
- 受影响的组件或节点。
- CPU 火焰图或内存火焰图/profile 文件。
- 问题发生的大致时间范围和工作负载。
- 可用的相关指标和日志。
