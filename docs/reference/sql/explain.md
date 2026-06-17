---
keywords: [SQL EXPLAIN, SQL execution plan, SQL ANALYZE, SQL query optimization, SQL examples]
description: Provides information on the SQL EXPLAIN statement to obtain the execution plan of a query, including the optional ANALYZE clause to measure execution time and output rows, with examples.
---

# EXPLAIN

`EXPLAIN` is used to provide the execution plan of a statement.

## Syntax

```sql
EXPLAIN [ANALYZE] [VERBOSE] SELECT ...
```

The `ANALYZE` clause will execute the statement and measure time spent at each plan node and the total rows of the output etc.

The `VERBOSE` clause will provide more detailed information about the execution plan.

## Examples

Explains the following query:

```sql
EXPLAIN SELECT * FROM monitor where host='host1'\G
```

Example:

```sql
*************************** 1. row ***************************
plan_type: logical_plan
     plan: MergeScan [is_placeholder=false]
*************************** 2. row ***************************
plan_type: physical_plan
     plan: MergeScanExec: peers=[4612794875904(1074, 0), ]
```

The column `plan_type` indicates whether it's a`logical_plan` or `physical_plan`. And the column `plan` explains the plan in detail.

The `MergeScan` plan merges the results from multiple regions. The `peers` array in the `MergeScanExec` physical plan contains the IDs of the regions that the plan will scan.

Explains the execution of the plan by `ANALYZE`:

```sql
EXPLAIN ANALYZE SELECT * FROM monitor where host='host1'\G
```

Example:

```sql
*************************** 1. row ***************************
stage: 0
 node: 0
 plan:  MergeScanExec: peers=[4612794875904(1074, 0), ] metrics=[output_rows: 0, greptime_exec_read_cost: 0, finish_time: 3301415, first_consume_time: 3299166, ready_time: 3104209, ]

*************************** 2. row ***************************
stage: 1
 node: 0
 plan:  SeqScan: region=4612794875904(1074, 0), partition_count=0 (0 memtable ranges, 0 file 0 ranges) metrics=[output_rows: 0, mem_used: 0, build_parts_cost: 1, build_reader_cost: 1, elapsed_await: 1, elapsed_poll: 21250, scan_cost: 1, yield_cost: 1, ]

*************************** 3. row ***************************
stage: NULL
 node: NULL
 plan: Total rows: 0
```

The `EXPLAIN ANALYZE` command provides metrics about the execution of each stage. The `SeqScan` plan scans the data from a single region.

Explains the verbose information of the plan execution:
```sql
EXPLAIN ANALYZE VERBOSE SELECT * FROM monitor where host='host1';
```

Example:

```sql
*************************** 1. row ***************************
stage: 0
 node: 0
 plan:  MergeScanExec: peers=[4612794875904(1074, 0), ] metrics=[output_rows: 0, greptime_exec_read_cost: 0, finish_time: 3479084, first_consume_time: 3476000, ready_time: 3209041, ]

*************************** 2. row ***************************
stage: 1
 node: 0
 plan:  SeqScan: region=4612794875904(1074, 0), partition_count=0 (0 memtable ranges, 0 file 0 ranges), projection=["host", "ts", "cpu", "memory"], filters=[host = Utf8("host1")], metrics_per_partition: [[partition=0, {prepare_scan_cost=579.75µs, build_reader_cost=0ns, scan_cost=0ns, convert_cost=0ns, yield_cost=0ns, total_cost=789.708µs, num_rows=0, num_batches=0, num_mem_ranges=0, num_file_ranges=0, build_parts_cost=0ns, rg_total=0, rg_fulltext_filtered=0, rg_inverted_filtered=0, rg_minmax_filtered=0, rg_bloom_filtered=0, rows_before_filter=0, rows_fulltext_filtered=0, rows_inverted_filtered=0, rows_bloom_filtered=0, rows_precise_filtered=0, num_sst_record_batches=0, num_sst_batches=0, num_sst_rows=0, first_poll=785.041µs}]] metrics=[output_rows: 0, mem_used: 0, build_parts_cost: 1, build_reader_cost: 1, elapsed_await: 1, elapsed_poll: 17208, scan_cost: 1, yield_cost: 1, ]

*************************** 3. row ***************************
stage: NULL
 node: NULL
 plan: Total rows: 0
```

The `EXPLAIN ANALYZE VERBOSE` command provides the detail metrics about the execution of scan plans.

## Scanner Metrics

Scanner nodes, including `SeqScan`, `SeriesScan`, and `UnorderedScan`, can print
scanner-specific metrics in `EXPLAIN ANALYZE` and `EXPLAIN ANALYZE VERBOSE`
output. These metrics help diagnose read-path behavior such as partitioning, SST
pruning, index usage, cache behavior, and scanner timing.

Verbose scanner metrics are diagnostic text, not a stable public API. Optional
zero-valued fields are usually omitted.

### Output Layout

A scanner line can contain three layers of information:

- Scanner display fields before the trailing `metrics=[...]` section.
- `metrics_per_partition`, which is printed only in verbose mode and keeps each
  partition's `PartitionMetrics` snapshot separate.
- DataFusion aggregate metrics in the trailing `metrics=[...]` section.

In `metrics_per_partition`, partition means a DataFusion execution-plan output
partition. It is not a GreptimeDB region and not a table partition created by
`PARTITION BY COLUMNS()`. One scanner metric partition may cover one or more
GreptimeDB scan ranges.

Normal mode layout:

```text
<Scanner>: region=<region>, <scanner display fields> metrics=[<aggregate metrics>]
```

Verbose mode layout:

```text
<Scanner>: region=<region>, {
  "partition_count": {...},
  "projection": [...],
  "filters": [...],
  "dyn_filters": [...],
  "files": [...],
  "flat_format": true,
  "metrics_per_partition": [
    {
      "partition": <partition>,
      "metrics": {
        <per-partition metrics>,
        "fetch_metrics": {...},
        "metadata_cache_metrics": {...},
        "top_file_metrics": {...}
      }
    }
  ]
} metrics=[<aggregate metrics>]
```

### Aggregate Metrics

The trailing `metrics=[...]` section is DataFusion's aggregate output for the
scanner plan node. Scanner partitions record these values through
`ExecutionPlanMetricsSet`, and the plan output aggregates them across
partitions.

The exact aggregate fields can vary by version and execution path. The output
may include additional runtime fields such as `mem_used`, `elapsed_poll`, and
`elapsed_await`.

| Metric | Meaning |
| --- | --- |
| `output_rows` | Rows returned by the scanner plan node. |
| `elapsed_compute` | Aggregate scanner compute time reported to DataFusion. |
| `build_parts_cost` | Aggregate time spent building SST file ranges. |
| `build_reader_cost` | Aggregate time spent building readers or merge readers. |
| `convert_cost` | Aggregate time spent converting batches into Arrow record batches. |
| `scan_cost` | Aggregate time spent scanning data from scanner inputs. |
| `yield_cost` | Aggregate time spent waiting while yielding batches downstream. |

Example with synthetic values:

```text
SeqScan: region=0(1, 0), "partition_count":{"count":2, "mem_ranges":1, "files":1, "file_ranges":1} metrics=[output_rows: 128, elapsed_compute: 12ms, build_parts_cost: 1.2ms, build_reader_cost: 2.1ms, convert_cost: 300µs, scan_cost: 8.4ms, yield_cost: 900µs, ]
```

### Scanner Display Fields

The scanner display fields describe what the scanner will read and which
predicates or projections are attached to it. `EXPLAIN ANALYZE` prints only the
non-verbose fields. `EXPLAIN ANALYZE VERBOSE` adds detailed scanner input and
per-partition metrics.

| Field | Mode | Meaning | When present |
| --- | --- | --- | --- |
| Scanner name | All | The physical scanner, such as `SeqScan`, `SeriesScan`, or `UnorderedScan`. | Always. |
| `region` | All | Region ID scanned by this plan node. | Always. |
| `partition_count.count` | All | Number of partition ranges in the scanner. | Always. |
| `partition_count.mem_ranges` | All | Number of memtable ranges in all partition ranges. | Always. |
| `partition_count.files` | All | Number of SST files in the scan input before range expansion. | Always. |
| `partition_count.file_ranges` | All | Number of SST file ranges in all partition ranges. | Always. |
| `partition_count.other_ranges` | All | Number of extension or non-memtable, non-SST ranges. | Nonzero only. |
| `selector` | All | Series row selector attached to the scan. | When a series row selector is attached. |
| `distribution` | All | Distribution information attached to the scan. | When distribution is attached. |
| `projection` | Verbose | Output column names after projection pruning. | When the output schema is not empty. |
| `filters` | Verbose | Static physical predicate expressions pushed into the scanner. These predicates may drive row-group pruning, index application, and precise filtering. | When static predicates exist. |
| `dyn_filters` | Verbose | Dynamic filter expressions attached after plan creation. These can change during execution as upstream operators produce filter values. | When dynamic filters exist. |
| `vector_index_k` | Verbose | Vector index top-k value used by vector search. | When the vector index feature is enabled and the scan uses vector index search. |
| `files` | Verbose | SST file metadata for files in the scan input. | When SST files are present. |
| `flat_format` | Verbose | Whether the scan input is expected to use flat format. | Always in verbose mode. |
| `extension_ranges` | Verbose | Enterprise extension ranges attached to the scan. | Enterprise builds only, when extension ranges exist. |
| `metrics_per_partition` | Verbose | Per-partition scanner metrics collected by `PartitionMetrics`. | Verbose mode after partitions have metrics. |

Each `files` entry contains:

| Field | Meaning |
| --- | --- |
| `file_id` | Region file ID of the SST file. |
| `time_range_start` | Inclusive start of the file time range, formatted as `value::unit`. |
| `time_range_end` | Inclusive end of the file time range, formatted as `value::unit`. |
| `rows` | Number of rows recorded in the file metadata. |
| `size` | SST file size in bytes. |
| `index_size` | Total index size in bytes recorded for the file. |

Example verbose scanner display with synthetic values:

```text
UnorderedScan: region=0(1, 0), {"partition_count":{"count":4, "mem_ranges":1, "files":2, "file_ranges":3}, "projection": ["host", "ts", "value"], "filters": ["host = Utf8(\"demo\")"], "dyn_filters": ["ts@1 < @runtime_filter"], "files": [{"file_id":"0(1, 0)/00000000-0000-0000-0000-000000000001","time_range_start":"1000::Millisecond","time_range_end":"2000::Millisecond","rows":1024,"size":65536,"index_size":4096}], "flat_format": true, "metrics_per_partition": [...]}
```

### Per-Partition Metrics

`metrics_per_partition` is a verbose-only list. Each item contains a partition
number and that partition's metric snapshot. These values are not the same
output layer as the aggregate `metrics=[...]` section, even when metric names
overlap.

Example with synthetic values:

```json
{
  "metrics_per_partition": [
    {
      "partition": 0,
      "metrics": {
        "prepare_scan_cost": "500µs",
        "build_reader_cost": "2ms",
        "scan_cost": "8ms",
        "yield_cost": "1ms",
        "total_cost": "12ms",
        "num_rows": 128,
        "num_batches": 4,
        "num_mem_ranges": 1,
        "num_file_ranges": 1,
        "build_parts_cost": "1ms",
        "sst_scan_cost": "6ms",
        "rg_total": 3,
        "rows_before_filter": 4096,
        "num_sst_record_batches": 2,
        "num_sst_batches": 2,
        "num_sst_rows": 96,
        "first_poll": "600µs",
        "convert_cost": "300µs",
        "rg_bloom_filtered": 1,
        "rows_bloom_filtered": 1024,
        "fetch_metrics": {
          "total_fetch_elapsed": "2ms",
          "page_cache_hit": 2,
          "cache_miss": 1
        },
        "metadata_cache_metrics": {
          "metadata_load_cost": "100µs",
          "mem_cache_hit": 1
        },
        "build_ranges_peak_mem_size": 2048,
        "num_peak_range_builders": 1,
        "stream_eof": true
      }
    }
  ]
}
```

All three scanners use the same `PartitionMetrics` and `ScanMetricsSet`
structure for verbose per-partition metrics.

#### Timing and Output

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `prepare_scan_cost` | All | Elapsed time between query start and partition metric creation. | Always. |
| `build_reader_cost` | All | Time spent building readers or merge readers in this partition. | Always. |
| `scan_cost` | All | Time spent polling scanner inputs in this partition. | Always. |
| `yield_cost` | All | Time spent after yielding batches to downstream operators in this partition. | Always. |
| `convert_cost` | All | Time spent converting batches to Arrow record batches in this partition. | When conversion time is recorded. |
| `total_cost` | All | Elapsed time from query start until the partition finishes, or until the metrics object is dropped. | Always. |
| `first_poll` | All | Elapsed time from query start until the partition stream is first polled. | Always. |
| `num_rows` | All | Rows returned by this partition. | Always. |
| `num_batches` | All | Batches returned by this partition. | Always. |
| `num_distributor_rows` | SeriesScan | Rows scanned by the series distributor. | Nonzero only. |
| `num_distributor_batches` | SeriesScan | Batches scanned by the series distributor. | Nonzero only. |
| `distributor_scan_cost` | SeriesScan | Time spent by the series distributor scanning input. | Nonzero only. |
| `distributor_yield_cost` | SeriesScan | Time spent by the series distributor sending batches to partition channels. | Nonzero only. |
| `distributor_divider_cost` | SeriesScan | Time spent splitting flat batches into series batches. | Nonzero only. |

#### Ranges and SST

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `num_mem_ranges` | All | Memtable ranges scanned by this partition. | Always. |
| `num_file_ranges` | All | SST file ranges scanned by this partition. | Always. |
| `build_parts_cost` | All | Time spent building SST file ranges in this partition. | Always. |
| `sst_scan_cost` | All | Time spent scanning SST readers. | Always. |
| `rg_total` | All | Row groups considered before pruning. | Always. |
| `num_sst_record_batches` | All | Arrow record batches read from SST readers. | Always. |
| `num_sst_batches` | All | Batches decoded from SST readers. | Always. |
| `num_sst_rows` | All | Rows decoded from SST readers. | Always. |

#### Filters and Pruning

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `rg_fulltext_filtered` | All | Row groups filtered by fulltext index. | Nonzero only. |
| `rg_inverted_filtered` | All | Row groups filtered by inverted index. | Nonzero only. |
| `rg_minmax_filtered` | All | Row groups filtered by min-max pruning. | Nonzero only. |
| `rg_bloom_filtered` | All | Row groups filtered by bloom filter index. | Nonzero only. |
| `rg_vector_filtered` | All | Row groups filtered by vector index. | Nonzero only. |
| `rows_before_filter` | All | Rows in candidate row groups before row-level filtering. | Always. |
| `rows_fulltext_filtered` | All | Rows filtered by fulltext index. | Nonzero only. |
| `rows_inverted_filtered` | All | Rows filtered by inverted index. | Nonzero only. |
| `rows_bloom_filtered` | All | Rows filtered by bloom filter index. | Nonzero only. |
| `rows_vector_filtered` | All | Rows filtered by vector index. | Nonzero only. |
| `rows_vector_selected` | All | Rows selected by vector index search. | Nonzero only. |
| `rows_precise_filtered` | All | Rows filtered by precise row-level filters. | Nonzero only. |
| `pruner_cache_hit` | All | Pruner builder cache hits while building file ranges. | Nonzero only. |
| `pruner_cache_miss` | All | Pruner builder cache misses while building file ranges. | Nonzero only. |
| `pruner_prune_cost` | All | Time spent waiting for pruners to build file ranges. | Nonzero only. |

#### Index Result Caches

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `fulltext_index_cache_hit` | All | Fulltext index result cache hits. | Nonzero only. |
| `fulltext_index_cache_miss` | All | Fulltext index result cache misses. | Nonzero only. |
| `inverted_index_cache_hit` | All | Inverted index result cache hits. | Nonzero only. |
| `inverted_index_cache_miss` | All | Inverted index result cache misses. | Nonzero only. |
| `bloom_filter_cache_hit` | All | Bloom filter index result cache hits. | Nonzero only. |
| `bloom_filter_cache_miss` | All | Bloom filter index result cache misses. | Nonzero only. |
| `minmax_cache_hit` | All | Min-max pruning cache hits. | Nonzero only. |
| `minmax_cache_miss` | All | Min-max pruning cache misses. | Nonzero only. |

#### Memtables

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `mem_scan_cost` | All | Time spent scanning memtables. | Nonzero only. |
| `mem_rows` | All | Rows read from memtables. | Nonzero only. |
| `mem_batches` | All | Batches read from memtables. | Nonzero only. |
| `mem_series` | All | Series read from time-series memtables. | Nonzero only. |
| `mem_prefilter_cost` | All | Time spent applying memtable prefilters. | Nonzero only. |
| `mem_prefilter_rows_filtered` | All | Rows filtered by memtable prefilters. | Nonzero only. |

#### SeriesScan Distributor

| Metric | Meaning | When present |
| --- | --- | --- |
| `num_series_send_timeout` | Times the distributor timed out sending to a partition channel. | Nonzero only. |
| `num_series_send_full` | Times a non-blocking send found a full partition channel. | Nonzero only. |

#### Range Cache and Lifecycle

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `range_cache_size` | All | Bytes added to the range cache during the scan. | Nonzero only. |
| `range_cache_hit` | All | Range cache lookup hits. | Nonzero only. |
| `range_cache_miss` | All | Range cache lookup misses. | Nonzero only. |
| `build_ranges_peak_mem_size` | All | Peak memory tracked while building file ranges. | Always. |
| `num_peak_range_builders` | All | Peak number of active file range builders. | Always. |
| `stream_eof` | All | Whether the partition stream reached EOF normally. | Always. |

### Nested Metrics

Verbose per-partition output can include nested metric objects when the related
work is recorded.

| Metric | Scanner | Meaning | When present |
| --- | --- | --- | --- |
| `fetch_metrics` | All | Page and row-group fetch metrics from Parquet readers. | When fetch or prefilter work is recorded. |
| `metadata_cache_metrics` | All | Parquet metadata cache metrics. | When metadata load time is recorded. |
| `inverted_index_apply_metrics` | All | Elapsed time and cache/read metrics for inverted index appliers. | When inverted indexes are applied. |
| `bloom_filter_apply_metrics` | All | Elapsed time and cache/read metrics for bloom filter index appliers. | When bloom filter indexes are applied. |
| `fulltext_index_apply_metrics` | All | Elapsed time and cache/read metrics for fulltext index appliers. | When fulltext indexes are applied. |
| `merge_metrics` | SeqScan, SeriesScan | Merge reader metrics. | When merge scan cost is recorded. |
| `dedup_metrics` | SeqScan, SeriesScan | Deduplication metrics. | When dedup cost is recorded. |
| `top_file_metrics` | All | Up to ten files with the largest accumulated `build_part_cost + build_reader_cost + scan_cost`. | When per-file metrics are collected in verbose mode. |

`fetch_metrics` fields:

| Field | Meaning | When present |
| --- | --- | --- |
| `total_fetch_elapsed` | Total elapsed time for fetching row groups. | Always when `fetch_metrics` is printed. |
| `page_cache_hit` | Page cache hits. | Nonzero only. |
| `write_cache_hit` | Write cache hits. | Nonzero only. |
| `cache_miss` | Cache misses. | Nonzero only. |
| `pages_to_fetch_mem` | Pages to fetch from memory cache. | Nonzero only. |
| `page_size_to_fetch_mem` | Bytes to fetch from memory cache. | Nonzero only. |
| `pages_to_fetch_write_cache` | Pages to fetch from write cache. | Nonzero only. |
| `page_size_to_fetch_write_cache` | Bytes to fetch from write cache. | Nonzero only. |
| `pages_to_fetch_store` | Pages to fetch from object store. | Nonzero only. |
| `page_size_to_fetch_store` | Bytes to fetch from object store. | Nonzero only. |
| `page_size_needed` | Bytes actually needed by the read. | Nonzero only. |
| `write_cache_fetch_elapsed` | Elapsed time fetching from write cache. | Nonzero only. |
| `store_fetch_elapsed` | Elapsed time fetching from object store. | Nonzero only. |
| `prefilter_cost` | Elapsed time running row-group prefilters. | Nonzero only. |
| `prefilter_filtered_rows` | Rows filtered by row-group prefilters. | Nonzero only. |

`metadata_cache_metrics` fields:

| Field | Meaning | When present |
| --- | --- | --- |
| `metadata_load_cost` | Time spent loading Parquet metadata. | Always when `metadata_cache_metrics` is printed. |
| `mem_cache_hit` | Parquet metadata memory cache hits. | Nonzero only. |
| `file_cache_hit` | Parquet metadata file cache hits. | Nonzero only. |
| `cache_miss` | Parquet metadata cache misses. | Nonzero only. |
| `num_reads` | Metadata read operations. | Nonzero only. |
| `bytes_read` | Metadata bytes read from storage. | Nonzero only. |

Index apply metric fields:

| Parent metric | Field | Meaning | When present |
| --- | --- | --- | --- |
| `inverted_index_apply_metrics` | `apply_elapsed` | Time spent applying inverted indexes. | Always when parent is printed. |
| `inverted_index_apply_metrics` | `blob_cache_miss` | Index blob cache misses. | Nonzero only. |
| `inverted_index_apply_metrics` | `blob_read_bytes` | Bytes read for index blobs. | Nonzero only. |
| `inverted_index_apply_metrics` | `inverted_index_read_metrics` | Nested inverted index read metrics. | Always when parent is printed. |
| `bloom_filter_apply_metrics` | `apply_elapsed` | Time spent applying bloom filter indexes. | Always when parent is printed. |
| `bloom_filter_apply_metrics` | `blob_cache_miss` | Index blob cache misses. | Nonzero only. |
| `bloom_filter_apply_metrics` | `blob_read_bytes` | Bytes read for index blobs. | Nonzero only. |
| `bloom_filter_apply_metrics` | `read_metrics` | Nested bloom filter read metrics. | Always when parent is printed. |
| `fulltext_index_apply_metrics` | `apply_elapsed` | Time spent applying fulltext indexes. | Always when parent is printed. |
| `fulltext_index_apply_metrics` | `blob_cache_miss` | Fulltext index blob cache misses. | Nonzero only. |
| `fulltext_index_apply_metrics` | `dir_cache_hit` | Fulltext index directory cache hits. | Nonzero only. |
| `fulltext_index_apply_metrics` | `dir_cache_miss` | Fulltext index directory cache misses. | Nonzero only. |
| `fulltext_index_apply_metrics` | `dir_init_elapsed` | Time spent initializing fulltext index directory data. | Nonzero only. |
| `fulltext_index_apply_metrics` | `bloom_filter_read_metrics` | Nested bloom filter read metrics used by the fulltext path. | Always when parent is printed. |

Index read metric fields used by `inverted_index_read_metrics`, `read_metrics`,
and `bloom_filter_read_metrics`:

| Field | Meaning | When present |
| --- | --- | --- |
| `total_bytes` | Bytes read for index data. | Nonzero only. |
| `cache_hit` | Index data cache hits. | Nonzero only. |
| `total_ranges` | Ranges read for index data. | Nonzero only. |
| `fetch_elapsed` | Elapsed time fetching index data. | Nonzero only. |
| `cache_miss` | Index data cache misses. | Nonzero only. |

`merge_metrics` fields:

| Field | Meaning | When present |
| --- | --- | --- |
| `scan_cost` | Total scan cost of the merge reader. | Always when `merge_metrics` is printed. |
| `init_cost` | Time spent initializing the merge reader. | Nonzero only. |
| `num_fetch_by_batches` | Number of batch-oriented fetches from sources. | Nonzero only. |
| `num_fetch_by_rows` | Number of row-oriented fetches from sources. | Nonzero only. |
| `fetch_cost` | Time spent fetching batches from sources. | Nonzero only. |

`dedup_metrics` fields:

| Field | Meaning | When present |
| --- | --- | --- |
| `dedup_cost` | Time spent deduplicating rows. | Always when `dedup_metrics` is printed. |
| `num_unselected_rows` | Rows removed by deduplication or delete filtering. | Nonzero only. |
| `num_deleted_rows` | Deleted rows removed during deduplication. | Nonzero only. |

Each `top_file_metrics` entry is keyed by file ID and can contain:

| Field | Meaning | When present |
| --- | --- | --- |
| `build_part_cost` | Time spent building this file's ranges or parts. | Always for each printed file entry. |
| `num_ranges` | Ranges read from this file. | Nonzero only. |
| `num_rows` | Rows read from this file. | Nonzero only. |
| `build_reader_cost` | Time spent building readers for this file. | Nonzero only. |
| `scan_cost` | Time spent scanning this file. | Nonzero only. |

### Scanner Differences

`SeqScan` scans ranges while preserving the ordering required by the read path.
It may report `merge_metrics` when merge readers are used and `dedup_metrics`
when deduplication removes older versions or deleted rows.

`UnorderedScan` provides no output ordering guarantee. It uses the same
per-partition metric structure as `SeqScan`, but downstream plan nodes may add
sort operators when a query needs ordered output.

`SeriesScan` returns rows grouped by series. It uses the same per-partition
metric structure as the other scanners and can also report distributor metrics
from the series distributor partition.
