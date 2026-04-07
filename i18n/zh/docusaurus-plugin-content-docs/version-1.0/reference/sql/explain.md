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
