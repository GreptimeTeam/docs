---
keywords: [SQL EXPLAIN, SQL execution plan, SQL ANALYZE, SQL query optimization, SQL examples]
description: Provides information on the SQL EXPLAIN statement to obtain the execution plan of a query, including the optional ANALYZE clause to measure execution time and output rows, with examples.
---

# EXPLAIN

`EXPLAIN` is used to provide the execution plan of a statement.

## Syntax

```sql
EXPLAIN [ANALYZE] SELECT ...
```

The `ANALYZE` clause will execute the statement and measure time spent at each plan node and the total rows of the output etc.

## Examples

Explains the following query:

```sql
EXPLAIN SELECT * FROM monitor where host='host1';
```

```sql
| plan_type     | plan                                                                                                                                                                                                                                                         
| logical_plan  | Projection: monitor.host, monitor.ts, monitor.cpu, monitor.memory
  Filter: monitor.host = Utf8("host1")
    TableScan: monitor projection=[host, ts, cpu, memory], partial_filters=[monitor.host = Utf8("host1")]                                           |
| physical_plan | ProjectionExec: expr=[host@0 as host, ts@1 as ts, cpu@2 as cpu, memory@3 as memory]
  CoalesceBatchesExec: target_batch_size=4096
    FilterExec: host@0 = host1
      RepartitionExec: partitioning=RoundRobinBatch(10)
        ExecutionPlan(PlaceHolder)
```

The column `plan_type` indicates whether it's a`logical_plan` or `physical_plan`. And the column `plan` explains the plan in detail.

Explains the execution of the plan by `ANALYZE`:

```sql
EXPLAIN ANALYZE SELECT * FROM monitor where host='host1';
```

```sql
| plan_type         | plan
| Plan with Metrics | CoalescePartitionsExec, metrics=[output_rows=1, elapsed_compute=79.167µs, spill_count=0, spilled_bytes=0, mem_used=0]
  ProjectionExec: expr=[host@0 as host, ts@1 as ts, cpu@2 as cpu, memory@3 as memory], metrics=[output_rows=1, elapsed_compute=17.176µs, spill_count=0, spilled_bytes=0, mem_used=0]
    CoalesceBatchesExec: target_batch_size=4096, metrics=[output_rows=1, elapsed_compute=14.248µs, spill_count=0, spilled_bytes=0, mem_used=0]
      CoalesceBatchesExec: target_batch_size=4096, metrics=[output_rows=1, elapsed_compute=17.21µs, spill_count=0, spilled_bytes=0, mem_used=0]
        FilterExec: host@0 = host1, metrics=[output_rows=1, elapsed_compute=541.801µs, spill_count=0, spilled_bytes=0, mem_used=0]
          CoalesceBatchesExec: target_batch_size=4096, metrics=[output_rows=3, elapsed_compute=43.004µs, spill_count=0, spilled_bytes=0, mem_used=0]
            RepartitionExec: partitioning=RoundRobinBatch(10), metrics=[fetch_time=5.832958ms, repart_time=10ns, send_time=2.467µs]
              RepartitionExec: partitioning=RoundRobinBatch(10), metrics=[fetch_time=386.585µs, repart_time=1ns, send_time=7.833µs]
                ExecutionPlan(PlaceHolder), metrics=[]
                
```

TODO: explains the output of `ANALYZE`.
