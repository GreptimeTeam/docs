---
keywords: [SQL EXPLAIN 语句, 执行计划, 查询优化, ANALYZE 子句, SQL 示例]
description: EXPLAIN 用于提供语句的执行计划，ANALYZE 子句将执行语句并测量每个计划节点的时间和输出行数。
---

# EXPLAIN

`EXPLAIN` 用于提供语句的执行计划。

## Syntax

```sql
EXPLAIN [ANALYZE] [VERBOSE] SELECT ...
```

`ANALYZE` 子句将执行语句并测量每个计划节点花费的时间以及输出的总行数等。

`VERBOSE` 子句可以进一步提供执行计划时详细的信息。

## 示例

Explain 以下的查询：

```sql
EXPLAIN SELECT * FROM monitor where host='host1'\G
```

样例输出：

```sql
*************************** 1. row ***************************
plan_type: logical_plan
     plan: MergeScan [is_placeholder=false]
*************************** 2. row ***************************
plan_type: physical_plan
     plan: MergeScanExec: peers=[4612794875904(1074, 0), ]
```

`plan_type` 列指示了是 `logical_plan` 还是 `physical_plan`，`plan` 列详细说明了执行计划。

`MergeScan` 计划负责合并多个 region 的查询结果。物理计划 `MergeScanExec` 中的 `peers` 数组包含了将要扫描的 region 的 ID。

使用 `ANALYZE` 解释执行计划：

```sql
EXPLAIN ANALYZE SELECT * FROM monitor where host='host1'\G
```

样例输出：

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

`EXPLAIN ANALYZE` 语句提供了每个执行阶段的指标。`SeqScan` 计划会扫描一个 region 的数据。

获取查询执行更详细的信息：

```sql
EXPLAIN ANALYZE VERBOSE SELECT * FROM monitor where host='host1';
```

样例输出：

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

`EXPLAIN ANALYZE VERBOSE` 语句会展示计划执行阶段更详细的指标信息。

## Scanner Metrics

扫描器节点，包括 `SeqScan`、`SeriesScan` 和 `UnorderedScan`，可以在
`EXPLAIN ANALYZE` 和 `EXPLAIN ANALYZE VERBOSE` 输出中打印扫描器相关指标。
这些指标可用于诊断读路径行为，例如分区、SST 剪枝、索引使用、缓存行为和扫描器耗时。

verbose 模式下的扫描器指标是诊断文本，不是稳定的公开 API。可选的零值字段通常会被省略。

### 输出结构

一行扫描器输出包含三层信息：

- 末尾 `metrics=[...]` 之前的扫描器展示字段。
- `metrics_per_partition`，只在 verbose 模式下打印，分别保留每个分区的
  `PartitionMetrics` 快照。
- 末尾 `metrics=[...]` 中的 DataFusion 聚合指标。

在 `metrics_per_partition` 中，partition 指 DataFusion 执行计划的输出分区。
它不是 GreptimeDB 的 region，也不是通过 `PARTITION ON COLUMNS(...)` 创建的表分区。
一个扫描器指标分区可能覆盖一个或多个 GreptimeDB 扫描范围。

普通模式结构：

```text
<Scanner>: region=<region>, <scanner display fields> metrics=[<aggregate metrics>]
```

verbose 模式结构：

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

### 聚合指标

末尾的 `metrics=[...]` 部分是扫描器计划节点的 DataFusion 聚合输出。
扫描器分区会通过 `ExecutionPlanMetricsSet` 记录这些值，计划输出会跨分区聚合它们。

具体的聚合字段可能随版本和执行路径变化。输出中也可能包含其他运行时字段，
例如 `mem_used`、`elapsed_poll` 和 `elapsed_await`。

| 指标 | 含义 |
| --- | --- |
| `output_rows` | 扫描器计划节点返回的行数。 |
| `elapsed_compute` | DataFusion 上报的扫描器聚合计算耗时。 |
| `build_parts_cost` | 构建 SST 文件范围的聚合耗时。 |
| `build_reader_cost` | 构建 reader 或 merge reader 的聚合耗时。 |
| `convert_cost` | 将 batch 转换为 Arrow record batch 的聚合耗时。 |
| `scan_cost` | 扫描输入数据的聚合耗时。 |
| `yield_cost` | 向下游输出 batch 后等待的聚合耗时。 |

使用合成值的示例：

```text
SeqScan: region=0(1, 0), "partition_count":{"count":2, "mem_ranges":1, "files":1, "file_ranges":1} metrics=[output_rows: 128, elapsed_compute: 12ms, build_parts_cost: 1.2ms, build_reader_cost: 2.1ms, convert_cost: 300µs, scan_cost: 8.4ms, yield_cost: 900µs, ]
```

### 扫描器展示字段

扫描器展示字段描述扫描器将读取什么，以及附加了哪些谓词或投影。
`EXPLAIN ANALYZE` 只打印非 verbose 字段。`EXPLAIN ANALYZE VERBOSE`
会增加详细的扫描器输入和分区级指标。

| 字段 | 模式 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| Scanner name | 全部 | 物理扫描器，例如 `SeqScan`、`SeriesScan` 或 `UnorderedScan`。 | 总是出现。 |
| `region` | 全部 | 此计划节点扫描的 region ID。 | 总是出现。 |
| `partition_count.count` | 全部 | 扫描器中的分区范围数量。 | 总是出现。 |
| `partition_count.mem_ranges` | 全部 | 所有分区范围中的 memtable range 数量。 | 总是出现。 |
| `partition_count.files` | 全部 | 范围展开前扫描输入中的 SST 文件数量。 | 总是出现。 |
| `partition_count.file_ranges` | 全部 | 所有分区范围中的 SST 文件范围数量。 | 总是出现。 |
| `partition_count.other_ranges` | 全部 | extension 或非 memtable、非 SST 范围数量。 | 非零时出现。 |
| `selector` | 全部 | 附加到扫描的 series row selector。 | 存在 series row selector 时。 |
| `distribution` | 全部 | 附加到扫描的分布信息。 | 存在 distribution 时。 |
| `projection` | Verbose | 投影剪枝后的输出列名。 | 输出 schema 非空时。 |
| `filters` | Verbose | 下推到扫描器的静态物理谓词表达式。这些谓词可能驱动 row group 剪枝、索引应用和精确过滤。 | 存在静态谓词时。 |
| `dyn_filters` | Verbose | 计划创建后附加的动态过滤表达式。上游算子产生过滤值时，这些表达式可能变化。 | 存在动态过滤器时。 |
| `vector_index_k` | Verbose | 向量索引搜索使用的 top-k 值。 | 启用向量索引功能且扫描使用向量索引搜索时。 |
| `files` | Verbose | 扫描输入中 SST 文件的元数据。 | 存在 SST 文件时。 |
| `flat_format` | Verbose | 扫描输入是否预期使用 flat format。 | verbose 模式下总是出现。 |
| `extension_ranges` | Verbose | 附加到扫描的企业版 extension ranges。 | 仅企业版构建且存在 extension ranges 时。 |
| `metrics_per_partition` | Verbose | `PartitionMetrics` 收集的分区级扫描器指标。 | verbose 模式下分区有指标后。 |

每个 `files` 项包含：

| 字段 | 含义 |
| --- | --- |
| `file_id` | SST 文件的 region file ID。 |
| `time_range_start` | 文件时间范围的闭区间起点，格式为 `value::unit`。 |
| `time_range_end` | 文件时间范围的闭区间终点，格式为 `value::unit`。 |
| `rows` | 文件元数据记录的行数。 |
| `size` | SST 文件大小，单位为字节。 |
| `index_size` | 文件记录的总索引大小，单位为字节。 |

使用合成值的 verbose 扫描器展示示例：

```text
UnorderedScan: region=0(1, 0), {"partition_count":{"count":4, "mem_ranges":1, "files":2, "file_ranges":3}, "projection": ["host", "ts", "value"], "filters": ["host = Utf8(\"demo\")"], "dyn_filters": ["ts@1 < @runtime_filter"], "files": [{"file_id":"0(1, 0)/00000000-0000-0000-0000-000000000001","time_range_start":"1000::Millisecond","time_range_end":"2000::Millisecond","rows":1024,"size":65536,"index_size":4096}], "flat_format": true, "metrics_per_partition": [...]}
```

### 分区级指标

`metrics_per_partition` 是只在 verbose 模式下出现的列表。每一项包含分区编号和该分区的指标快照。
即使指标名称重叠，这些值也不属于聚合 `metrics=[...]` 输出层。

使用合成值的示例：

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

三个扫描器都使用相同的 `PartitionMetrics` 和 `ScanMetricsSet` 结构输出 verbose 分区级指标。

#### 耗时和输出

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `prepare_scan_cost` | 全部 | 从查询开始到创建分区指标的耗时。 | 总是出现。 |
| `build_reader_cost` | 全部 | 在此分区中构建 reader 或 merge reader 的耗时。 | 总是出现。 |
| `scan_cost` | 全部 | 在此分区中轮询扫描器输入的耗时。 | 总是出现。 |
| `yield_cost` | 全部 | 向下游算子输出 batch 后的耗时。 | 总是出现。 |
| `convert_cost` | 全部 | 在此分区中将 batch 转换为 Arrow record batch 的耗时。 | 记录转换耗时时。 |
| `total_cost` | 全部 | 从查询开始到分区结束，或到指标对象被 drop 的耗时。 | 总是出现。 |
| `first_poll` | 全部 | 从查询开始到分区 stream 首次被 poll 的耗时。 | 总是出现。 |
| `num_rows` | 全部 | 此分区返回的行数。 | 总是出现。 |
| `num_batches` | 全部 | 此分区返回的 batch 数量。 | 总是出现。 |
| `num_distributor_rows` | SeriesScan | series distributor 扫描的行数。 | 非零时出现。 |
| `num_distributor_batches` | SeriesScan | series distributor 扫描的 batch 数量。 | 非零时出现。 |
| `distributor_scan_cost` | SeriesScan | series distributor 扫描输入的耗时。 | 非零时出现。 |
| `distributor_yield_cost` | SeriesScan | series distributor 向分区 channel 发送 batch 的耗时。 | 非零时出现。 |
| `distributor_divider_cost` | SeriesScan | 将 flat batch 拆分为 series batch 的耗时。 | 非零时出现。 |

#### Ranges 和 SST

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `num_mem_ranges` | 全部 | 此分区扫描的 memtable ranges 数量。 | 总是出现。 |
| `num_file_ranges` | 全部 | 此分区扫描的 SST 文件范围数量。 | 总是出现。 |
| `build_parts_cost` | 全部 | 在此分区中构建 SST 文件范围的耗时。 | 总是出现。 |
| `sst_scan_cost` | 全部 | 扫描 SST readers 的耗时。 | 总是出现。 |
| `rg_total` | 全部 | 剪枝前考虑的 row groups 数量。 | 总是出现。 |
| `num_sst_record_batches` | 全部 | 从 SST readers 读取的 Arrow record batch 数量。 | 总是出现。 |
| `num_sst_batches` | 全部 | 从 SST readers 解码出的 batch 数量。 | 总是出现。 |
| `num_sst_rows` | 全部 | 从 SST readers 解码出的行数。 | 总是出现。 |

#### 过滤和剪枝

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `rg_fulltext_filtered` | 全部 | 被全文索引过滤的 row groups 数量。 | 非零时出现。 |
| `rg_inverted_filtered` | 全部 | 被倒排索引过滤的 row groups 数量。 | 非零时出现。 |
| `rg_minmax_filtered` | 全部 | 被 min-max 剪枝过滤的 row groups 数量。 | 非零时出现。 |
| `rg_bloom_filtered` | 全部 | 被 bloom filter 索引过滤的 row groups 数量。 | 非零时出现。 |
| `rg_vector_filtered` | 全部 | 被向量索引过滤的 row groups 数量。 | 非零时出现。 |
| `rows_before_filter` | 全部 | 行级过滤前候选 row groups 中的行数。 | 总是出现。 |
| `rows_fulltext_filtered` | 全部 | 被全文索引过滤的行数。 | 非零时出现。 |
| `rows_inverted_filtered` | 全部 | 被倒排索引过滤的行数。 | 非零时出现。 |
| `rows_bloom_filtered` | 全部 | 被 bloom filter 索引过滤的行数。 | 非零时出现。 |
| `rows_vector_filtered` | 全部 | 被向量索引过滤的行数。 | 非零时出现。 |
| `rows_vector_selected` | 全部 | 被向量索引搜索选中的行数。 | 非零时出现。 |
| `rows_precise_filtered` | 全部 | 被精确行级过滤器过滤的行数。 | 非零时出现。 |
| `pruner_cache_hit` | 全部 | 构建文件范围时的 pruner builder 缓存命中次数。 | 非零时出现。 |
| `pruner_cache_miss` | 全部 | 构建文件范围时的 pruner builder 缓存未命中次数。 | 非零时出现。 |
| `pruner_prune_cost` | 全部 | 等待 pruner 构建文件范围的耗时。 | 非零时出现。 |

#### 索引结果缓存

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `fulltext_index_cache_hit` | 全部 | 全文索引结果缓存命中次数。 | 非零时出现。 |
| `fulltext_index_cache_miss` | 全部 | 全文索引结果缓存未命中次数。 | 非零时出现。 |
| `inverted_index_cache_hit` | 全部 | 倒排索引结果缓存命中次数。 | 非零时出现。 |
| `inverted_index_cache_miss` | 全部 | 倒排索引结果缓存未命中次数。 | 非零时出现。 |
| `bloom_filter_cache_hit` | 全部 | bloom filter 索引结果缓存命中次数。 | 非零时出现。 |
| `bloom_filter_cache_miss` | 全部 | bloom filter 索引结果缓存未命中次数。 | 非零时出现。 |
| `minmax_cache_hit` | 全部 | min-max 剪枝缓存命中次数。 | 非零时出现。 |
| `minmax_cache_miss` | 全部 | min-max 剪枝缓存未命中次数。 | 非零时出现。 |

#### Memtables

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `mem_scan_cost` | 全部 | 扫描 memtables 的耗时。 | 非零时出现。 |
| `mem_rows` | 全部 | 从 memtables 读取的行数。 | 非零时出现。 |
| `mem_batches` | 全部 | 从 memtables 读取的 batch 数量。 | 非零时出现。 |
| `mem_series` | 全部 | 从时序 memtables 读取的 series 数量。 | 非零时出现。 |
| `mem_prefilter_cost` | 全部 | 应用 memtable 预过滤器的耗时。 | 非零时出现。 |
| `mem_prefilter_rows_filtered` | 全部 | 被 memtable 预过滤器过滤的行数。 | 非零时出现。 |

#### SeriesScan Distributor

| 指标 | 含义 | 何时出现 |
| --- | --- | --- |
| `num_series_send_timeout` | distributor 向分区 channel 发送超时的次数。 | 非零时出现。 |
| `num_series_send_full` | 非阻塞发送发现分区 channel 已满的次数。 | 非零时出现。 |

#### Range Cache 和生命周期

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `range_cache_size` | 全部 | 扫描期间加入 range cache 的字节数。 | 非零时出现。 |
| `range_cache_hit` | 全部 | range cache 查询命中次数。 | 非零时出现。 |
| `range_cache_miss` | 全部 | range cache 查询未命中次数。 | 非零时出现。 |
| `build_ranges_peak_mem_size` | 全部 | 构建文件范围时跟踪到的峰值内存。 | 总是出现。 |
| `num_peak_range_builders` | 全部 | 活跃文件范围 builder 的峰值数量。 | 总是出现。 |
| `stream_eof` | 全部 | 分区 stream 是否正常到达 EOF。 | 总是出现。 |

### 嵌套指标

verbose 分区级输出在记录了相关工作时会包含嵌套指标对象。

| 指标 | 扫描器 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `fetch_metrics` | 全部 | Parquet readers 的 page 和 row-group 拉取指标。 | 记录 fetch 或 prefilter 工作时。 |
| `metadata_cache_metrics` | 全部 | Parquet 元数据缓存指标。 | 记录元数据加载耗时时。 |
| `inverted_index_apply_metrics` | 全部 | 倒排索引 applier 的耗时和缓存/读取指标。 | 应用倒排索引时。 |
| `bloom_filter_apply_metrics` | 全部 | bloom filter 索引 applier 的耗时和缓存/读取指标。 | 应用 bloom filter 索引时。 |
| `fulltext_index_apply_metrics` | 全部 | 全文索引 applier 的耗时和缓存/读取指标。 | 应用全文索引时。 |
| `merge_metrics` | SeqScan, SeriesScan | Merge reader 指标。 | 记录 merge scan 耗时时。 |
| `dedup_metrics` | SeqScan, SeriesScan | 去重指标。 | 记录 dedup 耗时时。 |
| `top_file_metrics` | 全部 | 累计 `build_part_cost + build_reader_cost + scan_cost` 最大的前十个文件。 | verbose 模式下收集 per-file 指标时。 |

`fetch_metrics` 字段：

| 字段 | 含义 | 何时出现 |
| --- | --- | --- |
| `total_fetch_elapsed` | 拉取 row groups 的总耗时。 | 打印 `fetch_metrics` 时总是出现。 |
| `page_cache_hit` | Page cache 命中次数。 | 非零时出现。 |
| `write_cache_hit` | Write cache 命中次数。 | 非零时出现。 |
| `cache_miss` | 缓存未命中次数。 | 非零时出现。 |
| `pages_to_fetch_mem` | 需要从内存缓存拉取的 pages 数量。 | 非零时出现。 |
| `page_size_to_fetch_mem` | 需要从内存缓存拉取的字节数。 | 非零时出现。 |
| `pages_to_fetch_write_cache` | 需要从 write cache 拉取的 pages 数量。 | 非零时出现。 |
| `page_size_to_fetch_write_cache` | 需要从 write cache 拉取的字节数。 | 非零时出现。 |
| `pages_to_fetch_store` | 需要从 object store 拉取的 pages 数量。 | 非零时出现。 |
| `page_size_to_fetch_store` | 需要从 object store 拉取的字节数。 | 非零时出现。 |
| `page_size_needed` | 读取实际需要的字节数。 | 非零时出现。 |
| `write_cache_fetch_elapsed` | 从 write cache 拉取的耗时。 | 非零时出现。 |
| `store_fetch_elapsed` | 从 object store 拉取的耗时。 | 非零时出现。 |
| `prefilter_cost` | 运行 row-group 预过滤器的耗时。 | 非零时出现。 |
| `prefilter_filtered_rows` | 被 row-group 预过滤器过滤的行数。 | 非零时出现。 |

`metadata_cache_metrics` 字段：

| 字段 | 含义 | 何时出现 |
| --- | --- | --- |
| `metadata_load_cost` | 加载 Parquet 元数据的耗时。 | 打印 `metadata_cache_metrics` 时总是出现。 |
| `mem_cache_hit` | Parquet 元数据内存缓存命中次数。 | 非零时出现。 |
| `file_cache_hit` | Parquet 元数据文件缓存命中次数。 | 非零时出现。 |
| `cache_miss` | Parquet 元数据缓存未命中次数。 | 非零时出现。 |
| `num_reads` | 元数据读取操作次数。 | 非零时出现。 |
| `bytes_read` | 从存储读取的元数据字节数。 | 非零时出现。 |

索引 apply 指标字段：

| 父指标 | 字段 | 含义 | 何时出现 |
| --- | --- | --- | --- |
| `inverted_index_apply_metrics` | `apply_elapsed` | 应用倒排索引的耗时。 | 打印父指标时总是出现。 |
| `inverted_index_apply_metrics` | `blob_cache_miss` | 索引 blob 缓存未命中次数。 | 非零时出现。 |
| `inverted_index_apply_metrics` | `blob_read_bytes` | 读取索引 blob 的字节数。 | 非零时出现。 |
| `inverted_index_apply_metrics` | `inverted_index_read_metrics` | 嵌套的倒排索引读取指标。 | 打印父指标时总是出现。 |
| `bloom_filter_apply_metrics` | `apply_elapsed` | 应用 bloom filter 索引的耗时。 | 打印父指标时总是出现。 |
| `bloom_filter_apply_metrics` | `blob_cache_miss` | 索引 blob 缓存未命中次数。 | 非零时出现。 |
| `bloom_filter_apply_metrics` | `blob_read_bytes` | 读取索引 blob 的字节数。 | 非零时出现。 |
| `bloom_filter_apply_metrics` | `read_metrics` | 嵌套的 bloom filter 读取指标。 | 打印父指标时总是出现。 |
| `fulltext_index_apply_metrics` | `apply_elapsed` | 应用全文索引的耗时。 | 打印父指标时总是出现。 |
| `fulltext_index_apply_metrics` | `blob_cache_miss` | 全文索引 blob 缓存未命中次数。 | 非零时出现。 |
| `fulltext_index_apply_metrics` | `dir_cache_hit` | 全文索引目录缓存命中次数。 | 非零时出现。 |
| `fulltext_index_apply_metrics` | `dir_cache_miss` | 全文索引目录缓存未命中次数。 | 非零时出现。 |
| `fulltext_index_apply_metrics` | `dir_init_elapsed` | 初始化全文索引目录数据的耗时。 | 非零时出现。 |
| `fulltext_index_apply_metrics` | `bloom_filter_read_metrics` | 全文路径使用的嵌套 bloom filter 读取指标。 | 打印父指标时总是出现。 |

`inverted_index_read_metrics`、`read_metrics` 和 `bloom_filter_read_metrics`
使用的索引读取指标字段：

| 字段 | 含义 | 何时出现 |
| --- | --- | --- |
| `total_bytes` | 读取索引数据的字节数。 | 非零时出现。 |
| `cache_hit` | 索引数据缓存命中次数。 | 非零时出现。 |
| `total_ranges` | 读取索引数据的 ranges 数量。 | 非零时出现。 |
| `fetch_elapsed` | 拉取索引数据的耗时。 | 非零时出现。 |
| `cache_miss` | 索引数据缓存未命中次数。 | 非零时出现。 |

`merge_metrics` 字段：

| 字段 | 含义 | 何时出现 |
| --- | --- | --- |
| `scan_cost` | merge reader 的总扫描耗时。 | 打印 `merge_metrics` 时总是出现。 |
| `init_cost` | 初始化 merge reader 的耗时。 | 非零时出现。 |
| `num_fetch_by_batches` | 按 batch 从源拉取的次数。 | 非零时出现。 |
| `num_fetch_by_rows` | 按行从源拉取的次数。 | 非零时出现。 |
| `fetch_cost` | 从源拉取 batch 的耗时。 | 非零时出现。 |

`dedup_metrics` 字段：

| 字段 | 含义 | 何时出现 |
| --- | --- | --- |
| `dedup_cost` | 行去重耗时。 | 打印 `dedup_metrics` 时总是出现。 |
| `num_unselected_rows` | 被去重或 delete 过滤移除的行数。 | 非零时出现。 |
| `num_deleted_rows` | 去重期间移除的已删除行数。 | 非零时出现。 |

每个 `top_file_metrics` 项以文件 ID 为 key，可能包含：

| 字段 | 含义 | 何时出现 |
| --- | --- | --- |
| `build_part_cost` | 构建此文件 ranges 或 parts 的耗时。 | 每个打印的文件项总是出现。 |
| `num_ranges` | 从此文件读取的 ranges 数量。 | 非零时出现。 |
| `num_rows` | 从此文件读取的行数。 | 非零时出现。 |
| `build_reader_cost` | 为此文件构建 reader 的耗时。 | 非零时出现。 |
| `scan_cost` | 扫描此文件的耗时。 | 非零时出现。 |

### 扫描器差异

`SeqScan` 扫描 ranges，并保留读路径所需的顺序。使用 merge readers 时，
它可能上报 `merge_metrics`；当去重移除旧版本或已删除行时，可能上报 `dedup_metrics`。

`UnorderedScan` 不保证输出顺序。它使用与 `SeqScan` 相同的分区级指标结构，
但当查询需要有序输出时，下游计划节点可能会增加 sort 算子。

`SeriesScan` 返回按 series 分组的行。它使用与其他扫描器相同的分区级指标结构，
也可以上报来自 series distributor 分区的 distributor 指标。
