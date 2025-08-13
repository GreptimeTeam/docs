---
keywords: [performance tuning, GreptimeDB performance, GreptimeDB optimization, GreptimeDB query performance, GreptimeDB write performance]
description: GreptimeDB performance tuning guide, including optimization recommendations for query and write performance.
---

# Performance Tuning

The default configuration of GreptimeDB instances may not be suitable for all scenarios.
Therefore, it's important to adjust database configuration and usage patterns according to your specific use case.

## Query

### ANALYZE QUERY

GreptimeDB supports query analysis functionality.
Using the `EXPLAIN ANALYZE [VERBOSE] <SQL>` statement, you can view step-by-step query execution times.
The enterprise edition dashboard also provides a corresponding visual analysis tool that can help identify query bottlenecks.

### Metrics

The following metrics are useful for diagnosing query performance issues:

| Metric | Type | Description |
| --- | --- | --- |
| `greptime_mito_read_stage_elapsed_bucket` | histogram | Time spent in different stages of queries within the storage engine. |
| `greptime_mito_cache_bytes` | gauge | Size of cached content |
| `greptime_mito_cache_hit` | counter | Total cache hits |
| `greptime_mito_cache_miss` | counter | Total cache misses |

### Increasing Cache Size

Monitor the `greptime_mito_cache_bytes` and `greptime_mito_cache_miss` metrics to determine if cache size needs to be increased. 
The `type` label in these metrics indicates the cache type.

If the `greptime_mito_cache_miss` metric remains consistently high and continues to increase,
or if the `greptime_mito_cache_bytes` metric reaches cache capacity,
you may need to adjust the storage engine's cache size configuration.

Here's an example configuration:

```toml
[[region_engine]]
[region_engine.mito]
# Cache size for write cache. The type label value for this cache is "file".
write_cache_size = "10G"
# Cache size for SST metadata. The type label value for this cache is "sst_meta".
sst_meta_cache_size = "128MB"
# Cache size for vectors and arrow arrays. The type label value for this cache is "vector".
vector_cache_size = "512MB"
# Cache size for SST row group pages. The type label value for this cache is "page".
page_cache_size = "512MB"
# Cache size for time series query results (e.g., last_value()). The type label value for this cache is "selector_result".
selector_result_cache_size = "512MB"

[region_engine.mito.index]
# Maximum capacity of the index staging directory.
staging_size = "10GB"
```

Recommendations:
- Set `write_cache_size` to at least 1/10 of disk space
- If database memory usage is below 20%, set `page_cache_size` to at least 1/4 of total memory
- If cache hit rate is below 50%, consider doubling the cache size
- If using full-text indexing, set `staging_size` to at least 1/10 of disk space

### Avoid High-Cardinality Columns in Primary Keys

Including high-cardinality columns such as `trace_id` and `uuid` in primary keys can degrade both write and query performance.
We recommend using [append-only tables](/reference/sql/create.md#create-append-only-table) and setting these high-cardinality columns as fields.
If indexing on high-cardinality columns is necessary, prefer using SKIPPING INDEX over INVERTED INDEX.

### Use Append-Only Tables When Possible

Generally, append-only tables provide better scan performance because the storage engine can skip merge and deduplication operations.
Additionally, if a table is append-only, the query engine can leverage statistics to accelerate certain queries.

If your table doesn't require deduplication or if performance takes priority over deduplication,
we recommend enabling [append_mode](/reference/sql/create.md#create-append-only-table).
For example, log tables should be append-only since log messages may have identical timestamps.

## Write

### Metrics

The following metrics are helpful for diagnosing write issues:

| Metric | Type | Description |
| --- | --- | --- |
| `greptime_mito_write_stage_elapsed_bucket` | histogram | Time spent in different stages of processing write requests within the storage engine |
| `greptime_mito_write_buffer_bytes` | gauge | Currently allocated bytes for write buffers (memtables) - estimated |
| `greptime_mito_write_rows_total` | counter | Number of rows written to the storage engine |
| `greptime_mito_write_stall_total` | gauge | Number of rows currently blocked due to high memory pressure |
| `greptime_mito_write_reject_total` | counter | Number of rows rejected due to high memory pressure |
| `greptime_mito_flush_elapsed` | histogram | Time spent flushing to SST files |

### Batch Write Rows

Batch writing refers to sending multiple rows of data to the database in a single request.
This can significantly improve write throughput. The recommended starting point is 1000 rows per batch.
If latency and resource usage remain acceptable,
you can increase the batch size.

### Write in Time Windows

While GreptimeDB can handle out-of-order data, such data still impacts performance.
GreptimeDB infers time window sizes from the written data and partitions data into multiple time windows based on timestamps.
If written rows don't fall within the same time window,
GreptimeDB needs to split them, which affects write performance.
Typically, real-time data doesn't encounter this issue since it consistently uses the latest timestamps.

### Use Multi-Value Table Structure

When designing schemas,
we recommend placing related metrics that can be collected together in the same table.
This can also improve write throughput and compression ratios.

For example, the following three tables collect CPU usage metrics:

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

We can consolidate them into a single table with three fields:

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
