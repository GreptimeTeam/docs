---
keywords: [GreptimeDB performance tuning, query optimization, caching, primary keys, append-only tables, metrics]
description: Tips for tuning GreptimeDB performance, including query optimization, caching, enlarging cache size, primary keys, and using append-only tables. Also covers metrics for diagnosing query and ingestion issues.
---

# Performance Tuning Tips

A GreptimeDB instance's default configuration may not fit all use cases. It's important to tune the database configurations and usage according to the scenario.

GreptimeDB provides various metrics to help monitor and troubleshoot performance issues. The official repository provides [Grafana dashboard templates](https://github.com/GreptimeTeam/greptimedb/tree/main/grafana) for both standalone and cluster modes.

## Query

### Metrics

The following metrics help diagnose query performance issues:
| Metric | Type | Description |
|---|---|---|
| greptime_mito_read_stage_elapsed_bucket | histogram | The elapsed time of different phases of a query in the storage engine. |
| greptime_mito_cache_bytes | gauge | Size of cached contents |
| greptime_mito_cache_hit | counter | Total count of cache hit |
| greptime_mito_cache_miss | counter | Total count of cache miss |


### Using cache for object stores

It's highly recommended to enable the object store read cache and the write cache in the storage engine. This could reduce query time by more than 10 times.

The read cache stores objects or ranges on the local disk to avoid fetching the same range from the remote again. The following example shows how to enable the read cache for S3.
- The `cache_path` is the directory to store cached objects.
- The `cache_capacity` is the capacity of the cache. It's recommended to leave at least 1/10 of the total disk space for it.

```toml
[storage]
type = "S3"
bucket = "your-bucket-name"
root = "your-root"
access_key_id = "****"
secret_access_key = "****"
endpoint = "https://s3.amazonaws.com/"
region = "your-region"
cache_path = "/path/to/s3cache"
cache_capacity = "10G"
```

The write cache acts as a write-through cache that stores files on the local disk before uploading them to the object store. This reduces the first query latency. The following example shows how to enable the write cache.
- The `enable_experimental_write_cache` flag enables the write cache
- The `experimental_write_cache_size` sets the capacity of the cache
- The `experimental_write_cache_path` sets the path to store cached files. It is under the data home by default.
- The `experimental_write_cache_ttl` sets the TTL of the cached files.


```toml
[[region_engine]]
[region_engine.mito]
enable_experimental_write_cache = true
experimental_write_cache_size = "10G"
experimental_write_cache_ttl = "8h"
# experimental_write_cache_path = "/path/to/write/cache"
```

### Enlarging cache size

You can monitor the `greptime_mito_cache_bytes` and `greptime_mito_cache_miss` metrics to determine if you need to increase the cache size. The `type` label in these metrics indicates the type of cache.

If the `greptime_mito_cache_miss` metric is consistently high and increasing, or if the `greptime_mito_cache_bytes` metric reaches the cache capacity, you may need to adjust the cache size configurations of the storage engine.

Here's an example:

```toml
[[region_engine]]
[region_engine.mito]
# Uncomment this option if using object stores.
# enable_experimental_write_cache = true
# Cache size for the write cache. The `type` label value for this cache is `file`.
experimental_write_cache_size = "10G"
# Cache size for SST metadata. The `type` label value for this cache is `sst_meta`.
sst_meta_cache_size = "128MB"
# Cache size for vectors and arrow arrays. The `type` label value for this cache is `vector`.
vector_cache_size = "512MB"
# Cache size for pages of SST row groups. The `type` label value for this cache is `page`.
page_cache_size = "512MB"
# Cache size for time series selector (e.g. `last_value()`). The `type` label value for this cache is `selector_result`.
selector_result_cache_size = "512MB"

[region_engine.mito.index]
## The max capacity of the index staging directory.
staging_size = "10GB"
```

Some tips:
- 1/10 of disk space for the `experimental_write_cache_size` at least
- 1/4 of total memory for the `page_cache_size` at least if the memory usage is under 20%
- Double the cache size if the cache hit ratio is less than 50%
- If using full-text index, leave 1/10 of disk space for the `staging_size` at least


### Enlarging scan parallelism

The storage engine limits the number of concurrent scan tasks to 1/4 of CPU cores for each query. Enlarging the parallelism can reduce the query latency if the machine's workload is relatively low.

```toml
[[region_engine]]
[region_engine.mito]
scan_parallelism = 8
```

### Using append-only table if possible

In general, append-only tables have a higher scan performance as the storage engine can skip merging and deduplication. What's more, the query engine can use statistics to speed up some queries if the table is append-only.

We recommend enabling the [append_mode](/reference/sql/create.md##create-an-append-only-table) for the table if it doesn't require deduplication or performance is prioritized over deduplication. For example, a log table should be append-only as log messages may have the same timestamp.

## Ingestion

### Metrics

The following metrics help diagnose ingestion issues:

| Metric | Type | Description |
|---|---|---|
| greptime_mito_write_stage_elapsed_bucket | histogram | The elapsed time of different phases of processing a write request in the storage engine |
| greptime_mito_write_buffer_bytes | gauge | The current estimated bytes allocated for the write buffer (memtables). |
| greptime_mito_write_rows_total | counter | The number of rows written to the storage engine |
| greptime_mito_write_stall_total | gauge | The number of rows currently stalled due to high memory pressure |
| greptime_mito_write_reject_total | counter | The number of rows rejected due to high memory pressure |
| raft_engine_sync_log_duration_seconds_bucket | histogram | The elapsed time of flushing the WAL to the disk |
| greptime_mito_flush_elapsed | histogram | The elapsed time of flushing the SST files |


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
