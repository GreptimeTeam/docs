---
keywords: [features, metrics, logs, traces, updates, deletion, TTL, compression, high cardinality, Flow, object storage, disaster recovery, geospatial, JSON]
description: Answers common technical questions about GreptimeDB data semantics, storage, performance, recovery, geospatial functions, and JSON support.
---

# Common Questions

## How does GreptimeDB handle metrics, logs, and traces?

GreptimeDB uses the same columnar engine and the same Tag, Timestamp, and Field column semantics for metrics, logs, and traces. The signals can use separate physical tables with different schemas, indexes, TTL settings, and ingestion paths.

All three signal types can be queried with SQL. Metrics also support PromQL, while traces have a separate Jaeger-compatible query API. Flow can continuously derive and materialize aggregates from source tables. See the [Data Model](./data-model.md), [Logs](/user-guide/logs/overview.md), and [Traces](/user-guide/traces/overview.md).

## Does GreptimeDB support updates?

Partially. For a table that uses deduplication, writing another row with the same primary key and time index updates Field values according to the table's `merge_mode`. The primary key and time index identify the row and are not updated in place.

For tables created with SQL, the default `last_row` mode keeps the latest row. The `last_non_null` mode keeps the latest non-null value for each Field. Auto-created tables can use protocol-specific defaults. Deduplication applies within a Region, so partition columns for a deduplicating table must be a subset of its primary-key columns.

Append-only tables disable deduplication, so repeated keys and timestamps create additional rows rather than updates. See [Update Data](/user-guide/manage-data/overview.md#update-data) and the [`merge_mode` reference](/reference/sql/create.md#create-a-table-with-merge-mode).

## Does GreptimeDB support deletion?

Yes, for tables that allow deletion. You can delete matching rows with SQL, truncate a table, or expire data with TTL. Append-only tables do not support row deletion. See [Delete Data](/user-guide/manage-data/overview.md#delete-data).

## Can I set TTL or retention policy for different tables or measurements?

Yes. TTL can be set at database or table level, and a table-level setting takes precedence. See [Manage Data Retention with TTL Policies](/user-guide/manage-data/overview.md#manage-data-retention-with-ttl-policies).

## What are the compression rates of GreptimeDB?

There is no single compression ratio. Results depend on schema width, value distribution, primary-key cardinality, repetition, SST format, indexes, and workload. Indexes can improve filtering while increasing storage and write cost. Measure with representative data and retention settings rather than applying a general ratio.

For schema and index trade-offs, see the [Schema Design Guide](/user-guide/deployments-administration/performance-tuning/design-table.md) and [Data Indexes](/user-guide/manage-data/data-index.md).

## How does GreptimeDB address the high cardinality issue?

High cardinality still has a cost: more distinct primary-key values can increase metadata, index, memory, and query work. GreptimeDB provides several controls:

- The `flat` SST format reduces per-series overhead and is the default for new tables. It is recommended for high-cardinality primary keys.
- Inverted, full-text, and skipping indexes can be added where their selectivity and storage cost fit the query workload. Indexing every column is usually unnecessary.
- Append-only tables skip deduplication work when records are immutable and do not need updates or deletes.
- Table partitioning distributes Regions across Datanodes in a cluster, but partition design and load distribution still matter.
- Schema design should keep identifiers in the primary key only when they are used for grouping, deduplication, or filtering.

There is no universal cardinality limit that applies to every schema and deployment. Test expected series counts, write rates, query predicates, and retention together. See [`sst_format`](/reference/sql/create.md#create-a-table-with-sst-format), [Data Indexes](/user-guide/manage-data/data-index.md), and the [Schema Design Guide](/user-guide/deployments-administration/performance-tuning/design-table.md).

## Does GreptimeDB support continuous aggregate or downsampling?

Yes. [Flow](/user-guide/flow-computation/overview.md) continuously computes query results from source-table changes and materializes them in a sink table. It can implement fixed-window aggregation and downsampling while retaining the source data under its own TTL.

## Can I store data in object storage in the cloud?

Yes. Persistent data files can be stored in Amazon S3, Google Cloud Storage, Azure Blob Storage, Alibaba Cloud OSS, and supported S3-compatible services. Object storage is separate from WAL, metadata, and local cache; each has its own durability and recovery role. See [Storage Location](./storage-location.md) and [Storage Options](/user-guide/deployments-administration/configuration.md#storage-options).

## How is GreptimeDB's performance compared to other solutions?

Performance depends on workload, schema, indexes, retention, hardware, object storage, cache, concurrency, and query shape. Use benchmark results only with their test conditions and compare them with your own expected workload.

Published reports include:

- [GreptimeDB vs. InfluxDB](https://greptime.com/blogs/2024-08-07-performance-benchmark)
- [GreptimeDB vs. TimescaleDB](https://greptime.com/blogs/2025-12-09-greptimedb-vs-timescaledb-benchmark)
- [GreptimeDB vs. Grafana Mimir](https://greptime.com/blogs/2024-08-02-datanode-benchmark)
- [Log workload: GreptimeDB, ClickHouse, and Elasticsearch](https://greptime.com/blogs/2025-03-10-log-benchmark-greptimedb)
- [GreptimeDB vs. Loki](https://greptime.com/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report)

## Does GreptimeDB have disaster recovery solutions?

GreptimeDB provides the components needed to build a recovery plan, but object storage alone is not a complete solution. Persistent data files, WAL, Metasrv metadata, Region placement and failover, and deployment configuration each affect recovery point and recovery time objectives.

Cluster failover also depends on a correctly configured topology and healthy replacement Datanodes. Back up and test metadata and WAL recovery alongside object-store policies. See [Disaster Recovery](/user-guide/deployments-administration/disaster-recovery/overview.md), [WAL Overview](/user-guide/deployments-administration/wal/overview.md), and [Storage Location](./storage-location.md).

<AnchorAlias id="does-greptimedb-have-geospatial-index" />

## Does GreptimeDB support geospatial computation?

Yes. GreptimeDB provides SQL functions for WKT values, Geohash, H3, S2, spatial relationships, distance, and area. These functions do not create or imply a separate database spatial index. See [Geospatial Functions](/reference/sql/functions/geo.md).

## Any JSON support?

GreptimeDB has an experimental `JSON` column type and [JSON functions](/reference/sql/functions/json.md) for extracting and inspecting values. The JSON type may change in future releases. GreptimeDB does not currently expose a dedicated JSON-path index; put frequently filtered attributes in typed columns when they need the documented inverted, full-text, or skipping indexes. See [JSON Type](/reference/sql/data-types.md#json-type-experimental) and [Data Indexes](/user-guide/manage-data/data-index.md).

## More Questions?

For deployment, migration, operations, and schema questions, see the full [FAQ](/faq-and-others/faq.md).
