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

| Metric | Type | Description |
|---|---|---|
| greptime_mito_read_stage_elapsed_bucket | histogram | The elapsed time of different phases of a query in the storage engine. |
| greptime_mito_cache_bytes | gauge | Size of cached contents. The `type` label indicates the cache type. |
| greptime_mito_cache_hit | counter | Total count of cache hit. The `type` label indicates the cache type. |
| greptime_mito_cache_miss | counter | Total count of cache miss. The `type` label indicates the cache type. |
| greptime_mito_cache_eviction | counter | Total count of cache eviction. The `type` label indicates the cache type. |


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

### Metrics

The following metrics help diagnose ingestion issues:

| Metric                                       | Type      | Description                                                                              |
| -------------------------------------------- | --------- | ---------------------------------------------------------------------------------------- |
| greptime_mito_write_stage_elapsed_bucket     | histogram | The elapsed time of different phases of processing a write request in the storage engine |
| greptime_mito_write_buffer_bytes             | gauge     | The current estimated bytes allocated for the write buffer (memtables).                  |
| greptime_mito_write_rows_total               | counter   | The number of rows written to the storage engine                                         |
| greptime_mito_write_stall_total              | gauge     | The number of rows currently stalled due to high memory pressure                         |
| greptime_mito_write_reject_total             | counter   | The number of rows rejected due to high memory pressure                                  |
| raft_engine_sync_log_duration_seconds_bucket | histogram | The elapsed time of flushing the WAL to the disk                                         |
| greptime_mito_flush_elapsed                  | histogram | The elapsed time of flushing the SST files                                               |

### Batching rows

Batching means sending multiple rows to the database over the same request. This can significantly improve ingestion throughput. A recommended starting point is 1000 rows per batch. You can enlarge the batch size if latency and resource usage are still acceptable.

### Writing by time window

Although GreptimeDB can handle out-of-order data, it still affects performance. GreptimeDB infers a time window size from ingested data and partitions the data into multiple time windows according to their timestamps. If the written rows are not within the same time window, GreptimeDB needs to split them, which affects write performance.

Generally, real-time data doesn't have the issues mentioned above as they always use the latest timestamp. If you need to import data with a long time range into the database, we recommend creating the table in advance and [specifying the compaction.twcs.time_window option](/reference/sql/create.md#create-a-table-with-custom-compaction-options).

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
