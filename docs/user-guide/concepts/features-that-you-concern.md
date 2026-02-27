---
keywords: [features, logs, events, traces, updates, deletions, TTL policies, compression rates, high cardinality, continuous aggregation, cloud storage, performance, disaster recovery, geospatial indexing, JSON support]
description: Answers common questions about GreptimeDB's features, including how it handles metrics, logs, and traces; updates, deletions, TTL policies, compression rates, high cardinality, continuous aggregation, cloud storage, performance, disaster recovery, geospatial indexing, and JSON support.
---

# Common Questions

## How does GreptimeDB handle metrics, logs, and traces?

GreptimeDB treats all observability data — metrics, logs, and traces — as timestamped events with context, stored in a unified columnar engine. You can query all three signal types with SQL, use PromQL for metrics, and run continuous aggregations with Flow.

Please read the [log user guide](/user-guide/logs/overview.md) and [traces user guide](/user-guide/traces/overview.md).

## Does GreptimeDB support updates?

Partially supported. See [update data](/user-guide/manage-data/overview.md#update-data) for more information.

## Does GreptimeDB support deletion?

Yes, it does. Please refer to the [delete data](/user-guide/manage-data/overview.md#delete-data) for more information.

## Can I set TTL or retention policy for different tables or measurements?

Of course. Please refer to the document [on managing data retention with TTL policies](/user-guide/manage-data/overview.md#manage-data-retention-with-ttl-policies).

## What are the compression rates of GreptimeDB?

The answer is it depends.
GreptimeDB uses the columnar storage layout, and compresses data by best-in-class algorithms.
And it will select the most suitable compression algorithm based on the column data's statistics and distribution.
GreptimeDB will provide rollups that can compress data more compactly but lose accuracy.

Therefore, the data compression rate of GreptimeDB may be between 2 and several hundred times, depending on the characteristics of your data and whether you can accept accuracy loss.

## How does GreptimeDB address the high cardinality issue?

GreptimeDB resolves high cardinality challenges through a multi-layered approach:

**At the architecture level:**
- **Sharding**: Data and indexes are distributed across region servers, preventing any single node from becoming a bottleneck. Read more about GreptimeDB's [architecture](./architecture.md).

**At the storage level:**
- **Flat format for extreme cardinality**: For workloads with millions of unique series (e.g., request IDs, trace IDs, user tokens as tags), GreptimeDB 1.0+ offers a redesigned storage layout. Traditional time-series databases allocate separate buffers per series, causing memory bloat and degraded performance at scale. Flat format introduces BulkMemtable and multi-series merge paths that eliminate per-series overhead, delivering **4x better write throughput and up to 10x faster queries** in high-cardinality scenarios. Learn more in [Scaling Time Series to Millions of Cardinalities](https://greptime.com/blogs/2025-12-22-flat-format).

**At the indexing level:**
- **Flexible Indexing**: GreptimeDB supports on-demand manual index creation. You can create various index types (inverted, full-text, skipping) for both tag and field columns as needed, rather than automatically indexing every column. This allows you to optimize query performance while minimizing index overhead. Learn more in the [index documentation](/user-guide/manage-data/data-index.md).

**At the query level:**
- **MPP (Massively Parallel Processing)**: The query engine uses vectorized execution and distributed parallel processing to handle high-cardinality queries efficiently across the cluster.

**The result:** GreptimeDB does not hit the same cardinality ceiling as Prometheus, where high-cardinality labels can cause memory exhaustion and query timeouts. Systems can handle millions of series without architectural rewrites.

## Does GreptimeDB support continuous aggregate or downsampling?

Since 0.8, GreptimeDB added a new function called `Flow`, which is used for continuous aggregation.  Please read the [user guide](/user-guide/flow-computation/overview.md).

## Can I store data in object storage in the cloud?

Yes, GreptimeDB's data access layer is based on [OpenDAL](https://github.com/apache/incubator-opendal), which supports most kinds of object storage services.
The data can be stored in cost-effective cloud storage services such as AWS S3 or Azure Blob Storage, please refer to storage configuration guide [here](/user-guide/deployments-administration/configuration.md#storage-options).

## How is GreptimeDB's performance compared to other solutions?

[GreptimeDB achieves 1 billion cold run #1 in JSONBench!](https://greptime.com/blogs/2025-03-18-jsonbench-greptimedb-performance)

Please read the performance benchmark reports:

* [GreptimeDB vs. InfluxDB](https://greptime.com/blogs/2024-08-07-performance-benchmark)
* [GreptimeDB vs. TimescaleDB](https://greptime.com/blogs/2025-12-09-greptimedb-vs-timescaledb-benchmark)
* [GreptimeDB vs. Grafana Mimir](https://greptime.com/blogs/2024-08-02-datanode-benchmark)
* [GreptimeDB vs. ClickHouse vs. Elasticsearch](https://greptime.com/blogs/2025-03-10-log-benchmark-greptimedb)
* [GreptimeDB vs. SQLite](https://greptime.com/blogs/2024-08-30-sqlite)

## Does GreptimeDB have disaster recovery solutions?

Yes. Please refer to [disaster recovery](/user-guide/deployments-administration/disaster-recovery/overview.md).

## Does GreptimeDB have geospatial index?

Yes. We offer [built-in functions](/reference/sql/functions/geo.md) for Geohash, H3 and S2 index.

## Any JSON support?

See [JSON functions](/reference/sql/functions/overview.md#json-functions).

## More Questions?

For more comprehensive answers to frequently asked questions about GreptimeDB, including deployment options, migration guides, performance comparisons, and best practices, please visit our [FAQ page](/faq-and-others/faq.md).
