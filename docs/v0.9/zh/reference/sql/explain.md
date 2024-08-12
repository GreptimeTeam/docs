# EXPLAIN

`EXPLAIN` 用于提供语句的执行计划。

## Syntax

```sql
EXPLAIN [ANALYZE] SELECT ...
```

`ANALYZE` 子句将执行语句并测量每个计划节点花费的时间以及输出的总行数等。

## 示例

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

`plan_type` 列指示了是 `logical_plan` 还是 `physical_plan`，`plan` 列详细说明了执行计划。

使用 `ANALYZE` 解释执行计划：

```sql
EXPLAIN ANALYZE SELECT * FROM monitor where host='host1'\G
```

```sql
*************************** 1. row ***************************
stage: 0
 node: 0
 plan:  MergeScanExec: peers=[5471788335104(1274, 0), 5471788335105(1274, 1), ] metrics=[output_rows: 0, greptime_exec_read_cost: 0, finish_time: 1496211, ready_time: 846828, first_consume_time: 1491941, ]

*************************** 2. row ***************************
stage: 1
 node: 0
 plan:  CoalesceBatchesExec: target_batch_size=8192 metrics=[output_rows: 0, elapsed_compute: 4147, ]
  FilterExec: host@2 = host1 metrics=[output_rows: 0, elapsed_compute: 32, ]
    RepartitionExec: partitioning=RoundRobinBatch(32), input_partitions=8 metrics=[repart_time: 8, fetch_time: 230515, send_time: 256, ]
      SeqScan: region=5471788335105(1274, 1), partition_count=0 (0 memtable ranges, 0 file ranges) metrics=[output_rows: 0, mem_used: 0, ]

*************************** 3. row ***************************
stage: 1
 node: 1
 plan:  CoalesceBatchesExec: target_batch_size=8192 metrics=[output_rows: 0, elapsed_compute: 3660, ]
  FilterExec: host@2 = host1 metrics=[output_rows: 0, elapsed_compute: 32, ]
    RepartitionExec: partitioning=RoundRobinBatch(32), input_partitions=8 metrics=[repart_time: 8, fetch_time: 113774, send_time: 256, ]
      SeqScan: region=5471788335104(1274, 0), partition_count=0 (0 memtable ranges, 0 file ranges) metrics=[output_rows: 0, mem_used: 0, ]

*************************** 4. row ***************************
stage: NULL
 node: NULL
 plan: Total rows: 0
4 rows in set (0.002 sec)       
```

在上面的例子中，我们得到了 4 行输出。除了最后一行给出了总体摘要，每一行都代表了执行计划的一个阶段节点。`stage` 列表示阶段编号，`node` 列表示节点编号。`plan` 列详细说明了计划和相关指标。

## Stage 和 node

这个例子基于一个有两个 region 的分布式分区表。我们使用 stage 编号在分布式执行计划中标记不同的 stage，从 0 开始。在每个 stage 中，我们可能有多个 node 并行执行计划。node 编号在每个 stage 中也从 0 开始。以下是有 2 个 stage 和 3 个 node 的示例：

![stage and node](/explain-stage-and-node.png)