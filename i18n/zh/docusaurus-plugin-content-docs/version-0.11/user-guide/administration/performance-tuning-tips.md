---
keywords: [性能调优, 查询性能, 缓存配置, 写入优化, 表结构设计, 指标监控, 对象存储, 批量写入, append-only 表]
description: 提供 GreptimeDB 性能调优的技巧，包括查询性能指标、缓存配置、写入优化和表结构设计建议。
---

# 性能调优技巧

GreptimeDB 实例的默认配置可能不适合所有场景。因此根据场景调整数据库配置和使用方式相当重要。

GreptimeDB 提供了各种指标来帮助监控和排查性能问题。官方仓库里提供了用于独立模式和集群模式的 [Grafana dashboard 模版](https://github.com/GreptimeTeam/greptimedb/tree/main/grafana)。

## 查询

### 指标

以下指标可用于诊断查询性能问题：
| 指标 | 类型 | 描述 |
|---|---|---|
| greptime_mito_read_stage_elapsed_bucket | histogram | 存储引擎中查询不同阶段的耗时。 |
| greptime_mito_cache_bytes | gauge | 缓存内容的大小 |
| greptime_mito_cache_hit | counter | 缓存命中总数 |
| greptime_mito_cache_miss | counter | 缓存未命中总数 |


### 为对象存储开启缓存

我们推荐在使用对象存储时启用读取缓存和写入缓存。这可以将查询耗时缩短 10 倍以上。

> 提示: 从 v0.11 版本开始，在使用远程对象存储服务时，系统会默认启用本地缓存（包括读取和写入）。通常情况下，您只需要根据需求调整缓存容量即可。

读取缓存将对象或一段范围的数据存储在本地磁盘上，以避免再次从远程读取相同的数据。以下示例展示了如何为 S3 启用读取缓存。
- `cache_path` 是存储缓存对象的目录，从 v0.11 版本开始不再需要手动设置。
- `cache_capacity` 是缓存的容量。从 0.11 版本开始，默认初始值为 `5GiB`，建议至少留出总磁盘空间的 1/10 用于缓存。

```toml
[storage]
type = "S3"
bucket = "ap-southeast-1-test-bucket"
root = "your-root"
access_key_id = "****"
secret_access_key = "****"
endpoint = "https://s3.amazonaws.com/"
region = "your-region"
# 在 v0.11 前需要设置该路径
# cache_path = "/path/to/s3cache"
cache_capacity = "10G"
```

写入缓存起到 write-through 缓存的作用，在将文件上传到对象存储之前，会先将它们存储在本地磁盘上。这可以减少第一次查询的延迟。


以下示例展示了在 `v0.12` 版本之前如何启用写入缓存。
- `enable_experimental_write_cache` 开关可用来启用写入缓存。从 `v0.11` 版本开始，当配置对象存储服务的时候，该值将默认设置为 `true`，即启用。
- `experimental_write_cache_size` 用来设置缓存的容量。从 0.11 版本开始，默认初始值为 `5GiB`。
- `experimental_write_cache_path` 用来设置存储缓存文件的路径。默认情况下它位于数据主目录下。
- `experimental_write_cache_ttl` 用来设置缓存文件的 TTL。


```toml
[[region_engine]]
[region_engine.mito]
enable_experimental_write_cache = true
experimental_write_cache_size = "10G"
experimental_write_cache_ttl = "8h"
# experimental_write_cache_path = "/path/to/write/cache"
```

### 增大缓存大小

可以监控 `greptime_mito_cache_bytes` 和 `greptime_mito_cache_miss` 指标来确定是否需要增加缓存大小。这些指标中的 `type` 标签表示缓存的类型。

如果 `greptime_mito_cache_miss` 指标一直很高并不断增加，或者 `greptime_mito_cache_bytes` 指标达到缓存容量，可能需要调整存储引擎的缓存大小配置。

以下是一个例子：

```toml
[[region_engine]]
[region_engine.mito]
# 写入缓存的缓存大小。此缓存的 `type` 标签值为 `file`。
write_cache_size = "10G"
# SST 元数据的缓存大小。此缓存的 `type` 标签值为 `sst_meta`。
sst_meta_cache_size = "128MB"
# 向量和箭头数组的缓存大小。此缓存的 `type` 标签值为 `vector`。
vector_cache_size = "512MB"
# SST 行组页面的缓存大小。此缓存的 `type` 标签值为 `page`。
page_cache_size = "512MB"
# 时间序列查询结果（例如 `last_value()`）的缓存大小。此缓存的 `type` 标签值为 `selector_result`。
selector_result_cache_size = "512MB"

[region_engine.mito.index]
## 索引暂存目录的最大容量。
staging_size = "10GB"
```



对于 `v0.12` 之前的版本

```toml
[[region_engine]]
[region_engine.mito]
# 如果使用对象存储则取消该参数的注释
# enable_experimental_write_cache = true
# 写入缓存的缓存大小。此缓存的 `type` 标签值为 `file`。
experimental_write_cache_size = "10G"
# SST 元数据的缓存大小。此缓存的 `type` 标签值为 `sst_meta`。
sst_meta_cache_size = "128MB"
# 向量和箭头数组的缓存大小。此缓存的 `type` 标签值为 `vector`。
vector_cache_size = "512MB"
# SST 行组页面的缓存大小。此缓存的 `type` 标签值为 `page`。
page_cache_size = "512MB"
# 时间序列查询结果（例如 `last_value()`）的缓存大小。此缓存的 `type` 标签值为 `selector_result`。
selector_result_cache_size = "512MB"

[region_engine.mito.index]
## 索引暂存目录的最大容量。
staging_size = "10GB"
```

一些建议：
- 至少将写入缓存设置为磁盘空间的 1/10
- 如果数据库内存使用率低于 20%，则可以至少将 `page_cache_size` 设置为总内存大小的 1/4
- 如果缓存命中率低于 50%，则可以将缓存大小翻倍
- 如果使用全文索引，至少将 `staging_size` 设置为磁盘空间的 1/10


### 避免将高基数的列放到主键中

将高基数的列，如 `trace_id` 和 `uuid` 等列设置为主键会降低写入和查询的性能。建议建表时使用 [append-only](/reference/sql/create.md#创建-append-only-表) 表并将这些高基数的列设置为 fields。


### 尽可能使用 append-only 表

一般来说，append-only 表具有更高的扫描性能，因为存储引擎可以跳过合并和去重操作。此外，如果表是 append-only 表，查询引擎可以使用统计信息来加速某些查询。

如果表不需要去重或性能优先于去重，我们建议为表启用 [append_mode](/reference/sql/create.md#创建-append-only-表)。例如，日志表应该是 append-only 表，因为日志消息可能具有相同的时间戳。


## 写入

### 指标

以下指标有助于诊断写入问题：

| 指标 | 类型 | 描述 |
|---|---|---|
| greptime_mito_write_stage_elapsed_bucket | histogram | 存储引擎中处理写入请求的不同阶段的耗时 |
| greptime_mito_write_buffer_bytes | gauge | 当前为写入缓冲区（memtables）分配的字节数（估算） |
| greptime_mito_write_rows_total | counter | 写入存储引擎的行数 |
| greptime_mito_write_stall_total | gauge | 当前由于内存压力过高而被阻塞的行数 |
| greptime_mito_write_reject_total | counter | 由于内存压力过高而被拒绝的行数 |
| raft_engine_sync_log_duration_seconds_bucket | histogram | 将 WAL 刷入磁盘的耗时 |
| greptime_mito_flush_elapsed | histogram | 刷入 SST 文件的耗时 |


### 批量写入行

批量写入是指通过同一个请求将多行数据发送到数据库。这可以显著提高写入吞吐量。建议的起始值是每批 1000 行。如果延迟和资源使用仍然可以接受，可以扩大攒批大小。

### 按时间窗口写入
虽然 GreptimeDB 可以处理乱序数据，但乱序数据仍然会影响性能。GreptimeDB 从写入的数据中推断出时间窗口的大小，并根据时间戳将数据划分为多个时间窗口。如果写入的行不在同一个时间窗口内，GreptimeDB 需要将它们拆分，这会影响写入性能。

通常，实时数据不会出现上述问题，因为它们始终使用最新的时间戳。如果需要将具有较长时间范围的数据导入数据库，我们建议提前创建表并 [指定 compaction.twcs.time_window 选项](/reference/sql/create.md#创建自定义-compaction-参数的表)。


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
