---
keywords: [GreptimeDB performance tuning, query optimization, caching, primary keys, append-only tables, metrics]
description: Tips for tuning GreptimeDB performance, including query optimization, caching, enlarging cache size, primary keys, and using append-only tables. Also covers metrics for diagnosing query and ingestion issues.
---

# Performance Tuning Tips

A GreptimeDB instance's default configuration may not fit all use cases. It's important to tune the database configurations and usage according to the scenario.

GreptimeDB provides various metrics to help monitor and troubleshoot performance issues. The official repository provides [Grafana dashboard templates](https://github.com/GreptimeTeam/greptimedb/tree/main/grafana) for both standalone and cluster modes.

## Query

### Analyze query performance

To debug a slow query, run it with `EXPLAIN ANALYZE VERBOSE`:

```sql
EXPLAIN ANALYZE VERBOSE <SQL>;
```

`EXPLAIN ANALYZE` executes the query and collects runtime metrics from each execution stage. The `VERBOSE` option adds scan-level metrics that are useful for identifying why the query is slow and what can improve it. See [EXPLAIN](/reference/sql/explain.md) for the meaning of the metrics in the output.

When comparing repeated runs, remember that cache state may affect the timing and result of the second run. If you want to avoid measuring a fully cached repeat, change the query condition slightly while keeping the query shape equivalent, for example by shifting the time range.

If the cause is still unclear, include the full `EXPLAIN ANALYZE VERBOSE` output when creating an issue.

Common findings:

- **Many small files to search**: A high `num_file_ranges` value, especially when many files contain less than one full row group, can mean the scan has to open many small SST files. This often comes from backfilling many different time windows or from high compaction pressure. Consider adjusting `compaction.twcs.time_window`, reviewing the write or backfill pattern so rows fill time windows more naturally, and checking compaction status. Small files do not always hurt performance if the number of files is not large.
- **Many rows filtered after scanning**: If `scan_cost` is high and `rows_precise_filtered` is also high, the scan reads many candidate rows and then removes them with exact filters. Consider adding an appropriate [index](/user-guide/manage-data/data-index.md) for selective filter columns. Index changes apply to newly flushed data; they do not immediately rewrite all existing SST files.
- **Local cache misses during data fetch**: If `fetch_metrics.cache_miss`, `fetch_metrics.pages_to_fetch_store`, or `fetch_metrics.store_fetch_elapsed` is high, GreptimeDB is reading page data from object storage instead of local caches. Check the cache metrics below and consider increasing `write_cache_size` or `page_cache_size`.
- **High scan preparation cost**: High `build_parts_cost` or `build_reader_cost` means GreptimeDB spends significant time building scan ranges or readers. Correlate this with `num_file_ranges`, metadata cache misses, and cache pressure.
- **High metadata load time**: If `metadata_cache_metrics.metadata_load_cost` or `metadata_cache_metrics.cache_miss` is high, the SST metadata cache may be too small. Check `greptime_mito_cache_bytes{type="sst_meta"}` and consider increasing `sst_meta_cache_size`.

### Metrics

The following metrics help diagnose query performance issues:

| Metric                                  | Type      | Description                                                               |
| --------------------------------------- | --------- | ------------------------------------------------------------------------- |
| greptime_mito_read_stage_elapsed_bucket | histogram | The elapsed time of different phases of a query in the storage engine.    |
| greptime_mito_cache_bytes               | gauge     | Size of cached contents. The `type` label indicates the cache type.       |
| greptime_mito_cache_hit                 | counter   | Total count of cache hit. The `type` label indicates the cache type.      |
| greptime_mito_cache_miss                | counter   | Total count of cache miss. The `type` label indicates the cache type.     |
| greptime_mito_cache_eviction            | counter   | Total count of cache eviction. The `type` label indicates the cache type. |

### Enlarging cache size

Use `greptime_mito_cache_bytes{type="..."}` as the primary signal for cache pressure. If the metric is often close to the configured capacity of the corresponding cache, consider increasing that cache size. If the metric stays far below capacity, consider reducing that cache size to free memory or disk space for other caches. Use `greptime_mito_cache_hit`, `greptime_mito_cache_miss`, and `greptime_mito_cache_eviction` as supporting signals to judge whether resizing a cache is useful.

The following example lists the main cache size configurations. Some default cache sizes are adjusted according to system memory. See [Configuration](/user-guide/deployments-administration/configuration.md#region-engine-options) for the default values of these options.

```toml
[[region_engine]]
[region_engine.mito]
# Cache size for the write cache. The `type` label value is `file` for data files.
write_cache_size = "10G"
# Percentage of write cache capacity allocated to index (puffin) files.
# The `type` label value for this cache is `index`.
index_cache_percent = 20
# Cache size for SST metadata. The `type` label value for this cache is `sst_meta`.
sst_meta_cache_size = "128MB"
# Cache size for vectors and arrow arrays. The `type` label value for this cache is `vector`.
vector_cache_size = "512MB"
# Cache size for pages of SST row groups. The `type` label value for this cache is `page`.
page_cache_size = "512MB"
# Cache size for time series selector (e.g. `last_value()`). The `type` label value for this cache is `selector_result`.
selector_result_cache_size = "512MB"
# Cache size for flat range scan results. The `type` label value for this cache is `range_result`.
range_result_cache_size = "512MB"
# Cache size for prefilter results. The `type` label value for this cache is `prefilter_result`.
prefilter_result_cache_size = "128MB"
# Cache size for manifest files. The `type` label value for this cache is `manifest`.
manifest_cache_size = "256MB"

[region_engine.mito.index]
# Cache size for index metadata. The `type` label value for this cache is `index_metadata`.
metadata_cache_size = "64MiB"
# Cache size for index content. The `type` label value for this cache is `index_content`.
content_cache_size = "128MiB"
# Page size for the index content cache.
content_cache_page_size = "64KiB"
# Cache size for index query results. The `type` label value for this cache is `index_result`.
result_cache_size = "128MiB"
# The max capacity of the index staging directory. The `type` label value is `index_staging`.
staging_size = "2GB"
```

Some tips:

- 1/10 of disk space for the write cache at least. It's recommended to use a large write cache when using object storage.
- The write cache is split between data files and index (puffin) files by `index_cache_percent`. If `greptime_mito_cache_bytes{type="index"}` is full but `greptime_mito_cache_bytes{type="file"}` is not, consider increasing `index_cache_percent`.
- If a cache is consistently small compared with its configured capacity, reduce that cache size and allocate the resource to caches with higher pressure.
- 1/4 of total memory for the `page_cache_size` at least if the memory usage is under 20%
- Double the cache size if the cache hit ratio is less than 50%
- Tune `index.staging_size` only for index search workloads where `greptime_mito_cache_bytes{type="index_staging"}` approaches capacity, or staging misses and evictions show pressure. It is not necessary to enlarge this setting for every deployment.

### SST format

GreptimeDB stores data in SST files using the `flat` format by default. It works well across all primary key cardinalities, including high cardinality ones such as `trace_id` or `uuid`, so you are not expected to set the `sst_format` option manually. For tables with high cardinality primary keys, also consider using an [append-only table](/reference/sql/create.md#create-an-append-only-table) to further improve performance.

The only reason to set `sst_format` is when upgrading from an old version of GreptimeDB, whose default was a legacy `primary_key` format. In that case, switch such tables to `flat`. See the [SST format](/user-guide/deployments-administration/performance-tuning/design-table.md#sst-format) guide for how to switch the format on existing tables, and [SST formats](/reference/sql/create.md#create-a-table-with-sst-format) for the reference.

### Using append-only table if possible

In general, append-only tables have a higher scan performance as the storage engine can skip merging and deduplication. What's more, the query engine can use statistics to speed up some queries if the table is append-only.

We recommend enabling the [append_mode](/reference/sql/create.md#create-an-append-only-table) for the table if it doesn't require deduplication or performance is prioritized over deduplication. For example, a log table should be append-only as log messages may have the same timestamp.

### Disable Write-Ahead-Log(WAL)

If you are consuming and writing to GreptimeDB from replayable data sources such as Kafka, you can further improve write throughput by disabling WAL.

Please note that when WAL is disabled, unflushed data to disk or object storage will not be recoverable and will need to be restored from the original data source, such as re-reading from Kafka or re-fetching logs.

Disable WAL by setting the table option `skip_wal='true'`:

```sql
CREATE TABLE logs(
  message STRING,
  ts TIMESTAMP TIME INDEX
) WITH (skip_wal = 'true');
```

## Ingestion

### Batching rows

Batching means sending multiple rows to the database over the same request. This can significantly improve ingestion throughput. A recommended starting point is 1000 rows per batch. You can enlarge the batch size if latency and resource usage are still acceptable.

### Writing by time window

Although GreptimeDB can handle out-of-order data, it still affects performance. GreptimeDB infers a time window size from ingested data and partitions the data into multiple time windows according to their timestamps. If the written rows are not within the same time window, GreptimeDB needs to split them, which affects write performance.

Generally, real-time data doesn't have the issues mentioned above as they always use the latest timestamp. If you need to import data with a long time range into the database, we recommend creating the table in advance and [specifying the compaction.twcs.time_window option](/reference/sql/create.md#create-a-table-with-custom-compaction-options).

### Metrics

The following metrics help diagnose ingestion issues. Most of these metrics are available in the official Grafana dashboards. Use the metric names below when you need custom PromQL or deeper investigation.

| Metric                                        | Type      | Description                                                                                               |
| --------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| greptime_table_operator_ingest_rows           | counter   | The number of rows ingested by the table operator. Use the rate of this metric to track total write load. |
| greptime_servers_http_requests_elapsed_bucket | histogram | HTTP request latency. Use labels such as `path`, `method`, and `code` to find write-related latency.      |
| greptime_servers_grpc_requests_elapsed_bucket | histogram | gRPC request latency. Use labels such as `path` and `code` to find write-related latency.                 |
| greptime_mito_handle_request_elapsed_bucket   | histogram | The elapsed time of handling storage engine requests on datanodes.                                        |
| greptime_mito_write_stage_elapsed_bucket      | histogram | The elapsed time of different phases of processing a write request in the storage engine.                 |
| greptime_mito_write_buffer_bytes              | gauge     | The current estimated bytes allocated for the write buffer (memtables).                                   |
| greptime_mito_write_rows_total                | counter   | The number of rows written to the storage engine. Use it to compare write load across datanodes.          |
| greptime_mito_write_stalling_count            | gauge     | The number of write requests currently stalled in each worker.                                            |
| greptime_mito_write_stall_total               | counter   | The total number of write requests stalled due to high memory pressure or transient region states.        |
| greptime_mito_write_reject_total              | counter   | The number of write requests rejected due to high memory pressure.                                        |
| raft_engine_sync_log_duration_seconds_bucket  | histogram | The elapsed time of flushing the WAL to the disk.                                                         |
| greptime_mito_flush_requests_total            | counter   | The number of scheduled flush requests.                                                                   |
| greptime_mito_flush_elapsed                   | histogram | The elapsed time of flushing SST files.                                                                   |
| greptime_mito_flush_bytes_total               | counter   | The number of bytes flushed to SST files.                                                                 |
| greptime_mito_flush_file_total                | counter   | The number of SST files produced by flush jobs.                                                           |

### Check ingestion throughput and request latency

Use `rate(greptime_table_operator_ingest_rows[$__rate_interval])` to observe the total ingestion rate. For protocol-level latency, check `greptime_servers_http_requests_elapsed_bucket` and `greptime_servers_grpc_requests_elapsed_bucket`. Filter by labels such as `path`, `method`, and `code` to separate write requests from health checks, metrics scraping, and query requests.

If frontend protocol latency is high, compare it with datanode-side metrics such as `greptime_mito_handle_request_elapsed_bucket` and `greptime_mito_write_stage_elapsed_bucket`. This helps determine whether the bottleneck is in request handling before the storage engine or inside the datanode write path.

### Diagnose datanode write pressure

When datanode writes are slow or ingestion latency is high, first check whether the write buffer is under pressure:

- `greptime_mito_write_buffer_bytes`
- `greptime_mito_write_stall_total`
- `greptime_mito_write_stalling_count`
- `greptime_mito_write_reject_total`

Write stalls mean GreptimeDB is applying backpressure instead of accepting writes immediately. Stalls can happen when the global write buffer reaches `global_write_buffer_size`, when a region reaches its effective per-region limit, or when a region is temporarily not writable during internal state changes. If clients receive an error like `Engine write buffer is full, rejecting write requests`, the datanode has reached either the global reject threshold controlled by `global_write_buffer_reject_size` or the per-region reject threshold controlled by `write_buffer_size` or `default_region_write_buffer_size`.

When a datanode is under write pressure, check flush performance and write distribution before tuning the write buffer size. Increasing the write buffer only gives the datanode more memory headroom. It does not fix slow flushes or an unbalanced table that sends most writes to one region.

### Check flush performance

If the write buffer keeps growing or writes stall frequently, check whether flush is the bottleneck. Use `greptime_mito_flush_elapsed` to inspect flush latency, and use `greptime_mito_flush_requests_total`, `greptime_mito_flush_bytes_total`, and `greptime_mito_flush_file_total` to understand flush frequency and throughput.

Datanode logs also help identify slow flushes and hot regions. Search for `Successfully flush memtables`. The log line includes the region, flush reason, SST files, `total_rows`, `total_bytes`, `cost`, encoded part count, and flush metrics. You can estimate flush throughput by dividing `total_rows` or `total_bytes` by `cost`.

If flush elapsed time is high, for example 30 seconds or more, or the flush throughput is lower than the ingestion speed, increasing the write buffer size usually only delays stalls or rejects. In this case, review the table partitioning and region distribution so flush work can be spread across more regions and datanodes.

If flush jobs are fast, usually finishing in several seconds, but the flush request rate is high and write buffer pressure appears often, increasing the write buffer size can help reduce flush frequency.

### Check write distribution

For partitioned tables, check whether writes are evenly distributed across datanodes and regions. Use `greptime_mito_write_rows_total` to compare datanode-level write rows, and `greptime_mito_handle_request_elapsed_bucket` to compare datanode request latency.

You can also query [`REGION_STATISTICS`](/reference/sql/information-schema/region-statistics.md) to inspect region-level statistics such as `written_bytes_since_open` and `memtable_size`. If one datanode or one region receives most of the write load, adjust the table partitioning so the workload is spread across more regions and datanodes before increasing the write buffer size.

### Tune write buffer size

If stalls or rejects are caused by write buffer pressure, and flush performance and write distribution are healthy, consider increasing `region_engine.mito.global_write_buffer_size`. This is most useful for workloads with large rows, such as logs or traces. By default, `global_write_buffer_size` is auto-sized to 1/8 of OS memory with a maximum of 1GB. Increase it gradually, for example by 2x to 4x, and watch datanode memory usage.

In most cases, leave `region_engine.mito.global_write_buffer_reject_size` unset so GreptimeDB uses the default reject threshold of 2x `global_write_buffer_size`. If you need writes to fail earlier under memory pressure, set it manually to a deliberate margin, commonly 1.5x to 2x `global_write_buffer_size`, based on available datanode memory and how early you want requests to be rejected. The value must be greater than `global_write_buffer_size`; otherwise, GreptimeDB sanitizes it back to 2x.

For hot-region protection, configure a per-table `write_buffer_size` or set `region_engine.mito.default_region_write_buffer_size` as the cluster default. A per-table `write_buffer_size` takes precedence over the engine default. Each affected region flushes when it reaches the configured size and rejects writes at twice that size, while other regions on the same worker can continue accepting writes. The default value of `default_region_write_buffer_size` is `0`, which disables default per-region limits.

Example:

```toml
[[region_engine]]
[region_engine.mito]
global_write_buffer_size = "2GB"
# Optional. Leave unset unless you need a custom reject margin.
global_write_buffer_reject_size = "3GB"
# Optional. Use 0 to disable the default per-region limit.
default_region_write_buffer_size = "512MB"
```

To override the region limit for a specific table:

```sql
ALTER TABLE monitor SET 'write_buffer_size'='1GB';
```

## Schema

### Using multiple fields

While designing the schema, we recommend putting related metrics that can be collected together in the same table. This can also improve the write throughput and compression ratio.

For example, the following three tables collect the CPU usage metrics.

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

We can merge them into one table with three fields.

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

## Collect profiling data

When GreptimeDB has high CPU or memory usage and the cause is unclear, collect profiling data from the affected node and provide it to developers for further analysis.

Profiling is platform-specific and may be unavailable on some platforms or builds. CPU profiling is available on most Unix platforms. Memory profiling is available on Linux, but not available on macOS or Windows. Generating flamegraphs can consume extra memory because GreptimeDB needs to parse the profile and symbolize stack information in process. Be careful when collecting flamegraphs from nodes that are close to their memory limit.

Profiling is node-local. Replace `127.0.0.1:4000` in the following examples with the HTTP address of the GreptimeDB node that has high CPU or memory usage.

### CPU profiling

Collect a 10-second CPU flamegraph while CPU usage is high:

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/cpu?seconds=10&output=flamegraph' > greptime-cpu.svg
```

### Memory profiling

Memory profiling requires heap profiling to be enabled. Official Docker images enable heap profiling by default. For self-built or non-Docker deployments, we recommend starting GreptimeDB with heap profiling enabled by default:

```bash
MALLOC_CONF=prof:true ./greptime standalone start
```

Collect a memory flamegraph whenever memory usage is high, especially if it is still increasing or has reached a new peak:

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=flamegraph' > greptime-mem.svg
```

You can also collect two memory profiles at different times and compare them to identify increased allocations:

```bash
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=proto' > greptime-mem-before.pprof
curl -X POST -s 'http://127.0.0.1:4000/debug/prof/mem?output=proto' > greptime-mem-after.pprof
```

See [Profiling Tools](/reference/http-endpoints.md#profiling-tools) for the endpoint reference.

When reporting the issue, include:

- GreptimeDB version and deployment mode.
- Affected component or node.
- CPU flamegraph or memory flamegraph/profile files.
- Approximate time range and workload when the issue happened.
- Relevant metrics and logs if available.
