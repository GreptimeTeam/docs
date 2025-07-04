---
keywords: [性能调优, GreptimeDB 性能, GreptimeDB 优化, GreptimeDB 查询性能, GreptimeDB 写入性能]
description: GreptimeDB 性能调优指南，包括查询性能和写入性能的优化建议。
---

# 性能调优

GreptimeDB 实例的默认配置可能不适合所有场景。因此根据场景调整数据库配置和使用方式相当重要。

## 查询

### ANALYZE QUERY

GreptimeDB 支持查询分析功能，通过 `EXPLAIN ANALYZE [VERBOSE] <SQL>` 语句可以看到逐步的查询耗时。在企业版 dashboard 中也提供了对应的白屏化分析工具，可以初步判断查询是慢在什么地方。

### 指标

以下指标可用于诊断查询性能问题：

| 指标 | 类型 | 描述 |
| --- | --- | --- |
| `greptime_mito_read_stage_elapsed_bucket` | histogram | 存储引擎中查询不同阶段的耗时。 |
| `greptime_mito_cache_bytes` | gauge | 缓存内容的大小 |
| `greptime_mito_cache_hit` | counter | 缓存命中总数 |
| `greptime_mito_cache_miss` | counter | 缓存未命中总数 |

### 增大缓存大小

可以监控 `greptime_mito_cache_bytes` 和 `greptime_mito_cache_miss` 指标来确定是否需要增加缓存大小。这些指标中的 `type` 标签表示缓存的类型。

如果 `greptime_mito_cache_miss` 指标一直很高并不断增加，或者 `greptime_mito_cache_bytes` 指标达到缓存容量，可能需要调整存储引擎的缓存大小配置。 

以下是一个例子：

```toml
[[region_engine]]
[region_engine.mito]
# 写入缓存的缓存大小。此缓存的 type 标签值为 file。
write_cache_size = "10G"
# SST 元数据的缓存大小。此缓存的 type 标签值为 sst_meta。
sst_meta_cache_size = "128MB"
# 向量和箭头数组的缓存大小。此缓存的 type 标签值为 vector。
vector_cache_size = "512MB"
# SST 行组页面的缓存大小。此缓存的 type 标签值为 page。
page_cache_size = "512MB"
# 时间序列查询结果（例如 last_value()）的缓存大小。此缓存的 type 标签值为 selector_result。
selector_result_cache_size = "512MB"

[region_engine.mito.index]
# 索引暂存目录的最大容量。
staging_size = "10GB"
```

一些建议：
- 至少将 `write_cache_size` 设置为磁盘空间的 `1/10`
- 如果数据库内存使用率低于 20%，则可以至少将 `page_cache_size` 设置为总内存大小的 1/4
- 如果缓存命中率低于 50%，则可以将缓存大小翻倍
- 如果使用全文索引，至少将 `staging_size` 设置为磁盘空间的 1/10

### 避免将高基数的列放到主键中

将高基数的列，如 `trace_id` 和 `uuid` 等列设置为主键会降低写入和查询的性能。建议建表时使用 [append-only 表](/reference/sql/create.md#创建-append-only-表)并将这些高基数的列设置为 fields。
如果需要对高基数列进行索引，也倾向于使用 SKIPPING INDEX 而不是 INVERTED INDEX。

### 尽可能使用 append-only 表

一般来说，append-only 表具有更高的扫描性能，因为存储引擎可以跳过合并和去重操作。此外，如果表是 append-only 表，查询引擎可以使用统计信息来加速某些查询。

如果表不需要去重或性能优先于去重，我们建议为表启用 [append_mode](/reference/sql/create.md#创建-append-only-表)。例如，日志表应该是 append-only 表，因为日志消息可能具有相同的时间戳。

## 写入

### 指标

以下指标有助于诊断写入问题：

| 指标 | 类型 | 描述 |
| --- | --- | --- |
| `greptime_mito_write_stage_elapsed_bucket` | histogram | 存储引擎中处理写入请求的不同阶段的耗时 |
| `greptime_mito_write_buffer_bytes` | gauge | 当前为写入缓冲区（memtables）分配的字节数（估算） |
| `greptime_mito_write_rows_total` | counter | 写入存储引擎的行数 |
| `greptime_mito_write_stall_total` | gauge | 当前由于内存压力过高而被阻塞的行数 |
| `greptime_mito_write_reject_total` | counter | 由于内存压力过高而被拒绝的行数 |
| `greptime_mito_flush_elapsed` | histogram | 刷入 SST 文件的耗时 |

### 批量写入行

批量写入是指通过同一个请求将多行数据发送到数据库。这可以显著提高写入吞吐量。建议的起始值是每批 1000 行。如果延迟和资源使用仍然可以接受，可以扩大攒批大小。

### 按时间窗口写入

虽然 GreptimeDB 可以处理乱序数据，但乱序数据仍然会影响性能。GreptimeDB 从写入的数据中推断出时间窗口的大小，并根据时间戳将数据划分为多个时间窗口。如果写入的行不在同一个时间窗口内，GreptimeDB 需要将它们拆分，这会影响写入性能。
通常，实时数据不会出现上述问题，因为它们始终使用最新的时间戳。

### 使用多值表结构

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

