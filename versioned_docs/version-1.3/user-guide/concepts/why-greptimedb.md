---
keywords: [open-source observability database, metrics, logs, traces, object storage, compute-storage separation]
description: Explains why teams evaluate GreptimeDB, how it handles metrics, logs, and traces, and where open-source and Enterprise capabilities differ.
---

# Why GreptimeDB

Teams usually evaluate a new observability backend when separate signal stores, storage expansion, or long-term analysis have become too expensive to operate. GreptimeDB addresses these problems with one columnar engine for metrics, logs, and traces, while keeping the data model and deployment choices explicit.

## What GreptimeDB Is

GreptimeDB is an open-source observability database. It stores and queries metrics, logs, and traces with one columnar engine and a shared SQL layer. It can run as a standalone process on local storage or as a distributed cluster backed by object storage.

GreptimeDB is not a general-purpose transactional database. Its storage, indexing, retention, and query paths are designed for append-heavy, time-indexed workloads such as observability and IoT data.

<AnchorAlias id="the-problem-three-systems-for-three-signals" />
<AnchorAlias id="unified-processing-for-observability-data" />

## Why One Engine for Three Signals

When metrics, logs, and traces live in separate databases, each store brings its own capacity model, lifecycle policy, query path, and failure modes. Correlation also depends on moving data between systems or coordinating several queries during an incident.

GreptimeDB uses the same columnar engine and [Tag, Timestamp, and Field semantics](./data-model.md) across the three signal types. This gives teams:

- one storage and lifecycle-management system for metrics, logs, and traces;
- SQL across all signal tables and PromQL for metrics;
- [Flow](/user-guide/flow-computation/overview.md) for continuous aggregation and materialized derived data;
- SQL correlation through common identifiers when instrumentation records them.

Unification happens at the engine, storage, and query layers. It does not require metrics, logs, and traces to use one table, one schema, or the [wide-event model](./observability-2.md).

## One Columnar Engine, Separate Tables

Reducing the number of systems should not force unlike signals into the same schema. Metric samples, log records, spans, and wide events have different access patterns and retention needs.

GreptimeDB lets each workload use tables suited to its data:

- metrics commonly use primary-key columns for labels and PromQL for queries;
- logs often use append-only tables and text or inverted indexes selected for the workload;
- traces retain trace and span identifiers and can be queried with SQL or the Jaeger-compatible API;
- wide events can retain more context where retrospective analysis justifies the added storage cost.

These tables can have different schemas, indexes, TTL settings, compaction options, and storage providers. See [Data Model](./data-model.md) and [Storage Location](./storage-location.md) for the underlying mechanisms.

## One System for Real-Time Monitoring and Historical Analysis

Incident response needs fast queries over recent data. Trend analysis, capacity work, and investigations may scan weeks or months. Splitting these workloads between a monitoring backend and an analytics database adds another ingestion path, another copy of the data, and another system to operate.

In distributed deployments backed by object storage, GreptimeDB handles both workloads with the same engine, storage system, and query layer. Recent data can be served from memory and local caches, while persistent data remains in object storage for longer-range queries. Historical analysis does not require a separate analytics database and data-copy pipeline.

![In a distributed deployment backed by object storage, real-time monitoring and historical analysis have different workload profiles but share GreptimeDB's engine, storage system, and query layer.](/shared-system-realtime-historical.svg)

<AnchorAlias id="cost-effective-with-object-storage" />
<AnchorAlias id="elastic-scaling-with-kubernetes" />

## Object Storage and Independent Scaling

When persistent files are tied to compute nodes, adding capacity can require moving data, rebalancing local disks, or provisioning storage and compute together. That makes a storage-heavy observability cluster harder to change as retention grows.

In distributed GreptimeDB deployments configured with shared object storage, persistent data files are kept in services such as Amazon S3, Google Cloud Storage, or Azure Blob Storage. Datanodes perform writes, compaction, and queries, while local disks can cache remote data. Compute and object-storage capacity can be adjusted separately without copying every persistent data file between Datanodes. See [Architecture](./architecture.md) and [Storage Location](./storage-location.md).

<AnchorAlias id="easy-to-integrate" />
<AnchorAlias id="flexible-architecture-from-edge-to-cloud" />

## Protocols and Query Boundaries

Replacing collection agents, dashboards, and client code can cost more than deploying a new database. GreptimeDB therefore accepts data through several established protocols:

- Prometheus Remote Write for metrics;
- OpenTelemetry OTLP/HTTP for metrics, logs, and traces;
- Loki Push API for logs;
- Elasticsearch Bulk API for document ingestion;
- InfluxDB Line Protocol, MySQL, PostgreSQL, and the GreptimeDB gRPC and HTTP APIs.

These integrations cover specific ingestion or client interfaces, not every feature of the source system. Loki ingestion does not provide LogQL, and the open-source Elasticsearch integration covers the Bulk API rather than the full Query DSL. Use [SQL](/user-guide/query-data/sql.md) across signal types, [PromQL](/user-guide/query-data/promql.md) for metrics, and the Jaeger-compatible query API for traces. Review each protocol page before planning a migration.

## Open-Source and Enterprise Scope

Edition boundaries matter when evaluating scale, availability, and operating effort. The open-source project includes standalone and cluster deployment, object-storage support, SQL and PromQL, Flow, indexing, and the ingestion interfaces listed above.

[GreptimeDB Enterprise](/enterprise/overview.md) adds separately documented capabilities such as read replicas, workload isolation through Datanode groups, automatic Region balancing and repartitioning, RBAC, LDAP integration, audit logging, and enterprise disaster-recovery options. These capabilities are not implied when this guide describes the open-source cluster.

## Configuration Choices

Using one system changes the controls you operate; it does not make the workloads identical. You can tune each workload through these controls:

- [Table design](/user-guide/deployments-administration/performance-tuning/design-table.md): choose schemas, primary keys, indexes, append-only behavior, and partitioning. Set retention with [TTL policies](/user-guide/manage-data/overview.md#manage-data-retention-with-ttl-policies) and tune [compaction](/user-guide/deployments-administration/manage-data/compaction.md) when the workload needs it.
- [Capacity planning](/user-guide/deployments-administration/capacity-plan.md): size compute, memory, and local cache for the expected ingestion rate and mix of recent and historical queries. Use the [performance tuning guide](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md) to adjust cache and query behavior from runtime evidence.
- [Durability and recovery](/user-guide/deployments-administration/disaster-recovery/overview.md): select a [WAL mode](/user-guide/deployments-administration/wal/overview.md), metadata storage, object-storage policy, and backup and restore process that meet the deployment's RPO and RTO.
- [Region operations](/user-guide/deployments-administration/manage-data/overview.md): plan table sharding, manual Region migration, and failover for distributed deployments. Enterprise deployments can also use [Datanode groups](/enterprise/deployments-administration/deploy-on-kubernetes/configure-datanode-groups.md) for workload isolation and [Region Balancer](/enterprise/autopilot/region-balancer.md) for automatic balancing.

The right settings depend on the workload and deployment mode; they are not a single preset shared by every signal.

<AnchorAlias id="high-performance" />

## What Production Users Report

Published case studies give results for specific workloads and configurations:

- [OceanBase Cloud](https://greptime.com/blogs/2025-07-22-user-case-obcloud-log-management-greptimedb) runs 80+ GreptimeDB clusters with 300 TB of log and SQL audit data under a seven-day retention period. The case study reports around 1 GB/s of sustained writes and 60%+ lower overall log storage cost after moving from Loki.
- [Poizon](https://greptime.com/blogs/2025-05-06-poizon-observability-greptimedb-monitoring-use-case) uses Flow to maintain 10-second, 1-minute, and 10-minute rollups from detailed events. Its case study reports that pre-aggregation reduced P99 query latency from seconds to milliseconds.

Results depend on schema, indexes, retention, hardware, object-storage pricing, cache configuration, and query workload. Use published [benchmark reports](https://greptime.com/blogs/2024-09-09-report-summary) with their test conditions when sizing a deployment.

<AnchorAlias id="how-greptimedb-compares" />

## Compare Against Your Current Stack

The useful comparison is usually against the systems already carrying the workload: Prometheus, Mimir, or Thanos for metrics; Loki or Tempo for logs and traces; Elasticsearch; VictoriaMetrics; or ClickHouse and ClickStack.

The [GreptimeDB comparison hub](https://greptime.com/compare/) links to product-specific pages covering architecture, protocol and query differences, migration paths, and benchmark conditions. Use the page for the system you run today rather than a context-free feature matrix.

## Choose a Next Step

- Run the [Quick Start](/getting-started/quick-start.md) to test ingestion and queries locally.
- Review the [product comparisons](https://greptime.com/compare/) against your current stack.
- Use the [migration guides](/user-guide/migrate-to-greptimedb/overview.md) to check protocol, query, dashboard, and historical-data changes before a production cutover.
