---
keywords: [GreptimeDB capacity planning, CPU requirements, memory requirements, storage requirements, data retention policy]
description: Plan GreptimeDB compute, memory, and storage capacity from a representative workload and measured resource use.
---

# Capacity Planning

There is no fixed mapping from rows per second or queries per second to CPU, memory, and storage. Row width, tag cardinality, query range, aggregation cost, index configuration, compaction, and workload bursts can change resource requirements substantially. Size a production deployment with a representative benchmark, then validate it with production metrics.

## Describe the workload

Record at least the following inputs before running a benchmark:

- Average and peak write rows per second, average row size, and burst duration
- Number of tables and regions, tag cardinality, and schema changes
- Concurrent queries, scanned time ranges, filters, aggregations, and result sizes
- Retention period and expected growth
- Availability target and the amount of capacity that must remain after a node or failure domain is lost

Use production-shaped data. Uniform synthetic rows often compress differently and exercise fewer indexes than real data.

## Size compute and memory

Different components have different bottlenecks:

- Frontend nodes use CPU and network capacity to accept requests, plan distributed queries, and merge results.
- Datanodes handle writes, queries, compaction, indexing, and caches. Their CPU and memory requirements depend on the mix of these operations.
- Metasrv resource use depends mainly on cluster metadata and control-plane activity rather than data volume alone.

Do not reserve a fixed percentage of CPU for reads or writes, or assume a fixed CPU-to-memory ratio. Run write and query workloads together, including peak concurrency, and observe CPU saturation, memory use, request latency, compaction backlog, and cache behavior. See [Performance tuning](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md) for the relevant settings and metrics.

## Size storage

Estimate the uncompressed logical volume first:

```text
daily logical bytes = average rows/second × average bytes/row × 86,400
retained logical bytes = daily logical bytes × retention days
```

This is not the required physical capacity. Compression, compaction, indexes, and object-store implementation affect the actual size. Measure the physical size produced by representative data rather than applying a universal compression ratio.

Account for each storage layer separately:

- Object storage or local data storage for SST and index files
- Local WAL capacity when using local WAL
- Kafka capacity and retention when using Remote WAL
- Local cache and index staging capacity
- Temporary headroom for compaction and operational growth
- Backup storage, if backups are part of the recovery plan

Set table TTLs to bound retained data where appropriate. See [Manage data retention with TTL](/user-guide/manage-data/overview.md#manage-data-retention-with-ttl-policies).

## Validate the plan

Test the deployment with the same schema, indexes, and storage backend planned for production. The test should cover:

1. Steady-state ingestion and the expected query mix.
2. Peak writes, peak query concurrency, and their overlap.
3. Compaction and index creation while traffic continues.
4. A node failure or maintenance event if the capacity plan includes failure tolerance.
5. Enough runtime to expose cache churn and background-work backlogs.

Use [GreptimeDB monitoring](/user-guide/deployments-administration/monitoring/overview.md) together with infrastructure metrics. Keep headroom for workload variance and failure recovery, and repeat the benchmark after material changes to schemas, indexes, queries, retention, or hardware.
