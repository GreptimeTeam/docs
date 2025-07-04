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
