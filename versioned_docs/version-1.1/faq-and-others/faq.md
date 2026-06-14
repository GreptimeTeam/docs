---
title: "GreptimeDB FAQ"
keywords: [FAQ, frequently asked questions, troubleshooting, deployment, migration, data model, integration]
description: Frequently Asked Questions about GreptimeDB — covering data model, integration, deployment, operations, and versioning.
---

# Frequently Asked Questions

:::tip Looking for introductory information?
- What is GreptimeDB / Use cases → [Why GreptimeDB](/user-guide/concepts/why-greptimedb.md)
- Performance benchmarks → [Key Features](/user-guide/concepts/features-that-you-concern.md#how-is-greptimedbs-performance-compared-to-other-solutions)
- Metrics, logs, and traces → [Key Features](/user-guide/concepts/features-that-you-concern.md#how-does-greptimedb-handle-metrics-logs-and-traces)
- High cardinality → [Key Features](/user-guide/concepts/features-that-you-concern.md#how-does-greptimedb-address-the-high-cardinality-issue)
- Data model → [Data Model](/user-guide/concepts/data-model.md)
:::

## General

### Where can I find ready-to-run demos?

Check out the [demo-scene](https://github.com/GreptimeTeam/demo-scene) repository. It contains end-to-end examples covering common use cases (metrics, logs, IoT, etc.) that you can run locally with Docker Compose.

### How is GreptimeDB's performance compared to other solutions?

GreptimeDB is designed for high-throughput write, low-latency query, and cost-efficient storage across metrics, logs, and traces workloads. Benchmark results are available in the following reports:

- [GreptimeDB vs. InfluxDB](https://greptime.com/blogs/2024-08-07-performance-benchmark)
- [GreptimeDB vs. TimescaleDB](https://greptime.com/blogs/2025-12-09-greptimedb-vs-timescaledb-benchmark)
- [GreptimeDB vs. Grafana Mimir](https://greptime.com/blogs/2024-08-02-datanode-benchmark)
- [GreptimeDB vs. ClickHouse vs. Elasticsearch (Log Benchmark)](https://greptime.com/blogs/2025-03-10-log-benchmark-greptimedb)
- [GreptimeDB vs. SQLite](https://greptime.com/blogs/2024-08-30-sqlite)
- [GreptimeDB vs. Loki](https://greptime.com/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report)
- [JSONBench #1 (1 Billion Cold Run)](https://greptime.com/blogs/2025-03-18-jsonbench-greptimedb-performance)

For a summary of how GreptimeDB compares architecturally, see the [comparison table](/user-guide/concepts/why-greptimedb.md#how-greptimedb-compares).

### What are GreptimeDB's design trade-offs?

GreptimeDB is optimized for observability and time-series workloads, which means it makes different trade-offs than a general-purpose OLTP database:

- **No ACID transactions**: Prioritizes high-throughput writes over transactional consistency.
- **Delete is supported but not optimized for high-frequency use**: GreptimeDB supports [row deletion](/user-guide/manage-data/overview.md#delete-data) and [TTL-based expiration](/user-guide/manage-data/overview.md#manage-data-retention-with-ttl-policies), but it is not designed for workloads that require frequent, fine-grained deletes — as is typical for append-heavy observability data.
- **Joins are functional but currently not the primary focus**: GreptimeDB supports SQL joins, but the query engine is optimized for time-series filter-aggregate patterns rather than complex multi-way relational joins. Simple joins (e.g., enrichment lookups, correlating metrics with logs) work well.
- **Time-series focused**: Optimized for IoT, metrics, logs, and traces rather than general OLTP.

### What's the difference between GreptimeDB and InfluxDB?

Key differences:

- **Open Source**: GreptimeDB's entire distributed system is fully open source.
- **Architecture**: Region-based sharding design optimized for observability workloads.
- **Query Languages**: SQL + PromQL vs. InfluxQL + SQL.
- **Unified Model**: Native support for metrics, logs, and traces in one system.
- **Storage**: Pluggable engines with dedicated optimizations.
- **Cloud-Native**: Built for Kubernetes with disaggregated compute/storage (see [Kubernetes Deployment Guide](/user-guide/deployments-administration/deploy-on-kubernetes/overview.md)).

For a detailed comparison, see [GreptimeDB vs InfluxDB](https://greptime.com/compare/influxdb). Additional product comparisons (vs. ClickHouse, Loki, etc.) are available in the Compare menu on the [website](https://greptime.com).

## Data Model & Schema

### What's the difference between Tag and Field columns?

GreptimeDB uses three semantic column types: **Tag**, **Timestamp**, and **Field**.

- **Tag** columns identify a time-series. Rows with the same tag values belong to the same series. Tags are indexed by default for fast filtering. In SQL, tag columns are declared via `PRIMARY KEY`.
- **Field** columns contain the measured values (numbers, strings, etc.). Fields are not indexed by default, but you can add [indexes](/user-guide/manage-data/data-index.md) as needed.
- **Timestamp** is the time index — every table must have exactly one.

For example, in a `system_metrics` table, `host` and `idc` are tags, `cpu_util` and `memory_util` are fields, and `ts` is the timestamp.

For full details and examples, see [Data Model](/user-guide/concepts/data-model.md) and the [schema design guide](/user-guide/deployments-administration/performance-tuning/design-table.md).

### Does GreptimeDB support schemaless data ingestion?

Yes. When writing via gRPC, InfluxDB Line Protocol, OpenTSDB, Prometheus Remote Write, OpenTelemetry, Loki, or Elasticsearch-compatible APIs, GreptimeDB creates tables and columns automatically on first write. No manual schema definition is needed.

For details, see [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).

### How do I set default table options (TTL, append mode, etc.) for auto-created tables?

There are three ways to control table options such as `ttl`, `append_mode`, `merge_mode`, `skip_wal`, and `sst_format` for tables created via [automatic schema generation](/user-guide/ingest-data/overview.md#automatic-schema-generation):

1. **Set options at ingestion time via HTTP header**: Use the `x-greptime-hints` header to pass table options when writing data. For example, `x-greptime-hints: ttl=7d, append_mode=true`. These options apply when the table is auto-created. See [HTTP Hints](/user-guide/protocols/http.md#hints) for all supported hints.

2. **Modify options after table creation**: Some options can be changed on an existing table via `ALTER TABLE`. For example, `ttl`, `append_mode`, `compaction.*`, and `sst_format` are supported:
   ```sql
   ALTER TABLE my_table SET 'ttl' = '7d';
   ALTER TABLE my_table SET 'append_mode' = 'true';
   ```
   Note that `merge_mode` and `skip_wal` cannot be altered after creation — they must be set at table creation time. See [ALTER TABLE](/reference/sql/alter.md#alter-table-options) for all supported options and constraints.

3. **Set database-level defaults**: Create or alter the database with default options. New auto-created tables will inherit these values:
   ```sql
   CREATE DATABASE my_db WITH (ttl = '7d', append_mode = 'true');
   -- or
   ALTER DATABASE my_db SET 'ttl' = '7d';
   ```
   Note that `ttl` and `compaction.*` options have ongoing effect — tables without their own settings continuously inherit the database value. Other options (`append_mode`, `merge_mode`, `skip_wal`, `sst_format`) only serve as defaults for newly created tables. See [CREATE DATABASE](/reference/sql/create.md#create-database) for all available options.

### How do I customize the default column names for InfluxDB / Prometheus protocols?

When writing via certain protocols, GreptimeDB generates default column names with a `greptime_` prefix. The timestamp column is named `greptime_timestamp` for all schemaless protocols. The value column `greptime_value` is used by single-value protocols such as Prometheus Remote Write and OpenTelemetry Metrics, where each time series carries only one numeric value. Multi-field protocols like InfluxDB Line Protocol use the field names from the input data directly — only the timestamp column gets the default prefix.

To change the prefix, set the `default_column_prefix` option in your `standalone.toml` or `frontend.toml`:

```toml
# Remove the "greptime_" prefix — columns become "value" and "timestamp"
default_column_prefix = ""

# Or use a custom prefix — columns become "my_value" and "my_timestamp"
# default_column_prefix = "my"
```

If unset, the default `greptime_` prefix is used. This is a top-level configuration option and requires a restart to take effect.

### Can I change a column's type after table creation?

Yes. Use `ALTER TABLE ... MODIFY COLUMN` to change a field column's data type:

```sql
ALTER TABLE monitor MODIFY COLUMN load_15 STRING;
```

The column must be a field (not a tag or time index) and must be nullable, so that values that cannot be cast return `NULL` instead of failing.

For the full `ALTER TABLE` syntax, see the [SQL reference](/reference/sql/alter.md).

### How does GreptimeDB handle late-arriving or out-of-order data?

GreptimeDB accepts writes with any timestamp — there is no ingestion-time window or ordering requirement. Late-arriving and out-of-order data is written normally and becomes queryable immediately. The storage engine's [compaction](/user-guide/deployments-administration/manage-data/compaction.md) process merges and sorts data in the background.

For append-only tables (commonly used for logs), rows are never deduplicated, so late-arriving data simply adds new rows. For tables with a primary key, rows with the same tag + timestamp combination follow the [update semantics](/user-guide/manage-data/overview.md#update-data).

## Integration & Migration

### What protocols, tools, and SDKs does GreptimeDB support?

**Write protocols**: [OpenTelemetry (OTLP)](/user-guide/ingest-data/for-observability/opentelemetry.md), [Prometheus Remote Write](/user-guide/ingest-data/for-observability/prometheus.md), [InfluxDB Line Protocol](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md), [Loki](/user-guide/ingest-data/for-observability/loki.md), [Elasticsearch](/user-guide/ingest-data/for-observability/elasticsearch.md), [MySQL](/user-guide/protocols/mysql.md), [PostgreSQL](/user-guide/protocols/postgresql.md), [gRPC](/user-guide/protocols/grpc.md) — see [Protocols Overview](/user-guide/protocols/overview.md).

**Query languages**: [SQL](/user-guide/query-data/sql.md), [PromQL](/user-guide/query-data/promql.md).

**Visualization**: [Grafana](/user-guide/integrations/grafana.md) (official plugin + MySQL/PostgreSQL data sources), and any tool that speaks MySQL or PostgreSQL wire protocol.

**Data pipeline**: Vector, Fluent Bit, Telegraf, Kafka — see [Integrations Overview](/user-guide/integrations/overview.md).

**SDKs**:
- [Go](https://github.com/GreptimeTeam/greptimedb-ingester-go)
- [Java](https://github.com/GreptimeTeam/greptimedb-ingester-java)
- [Rust](https://github.com/GreptimeTeam/greptimedb-ingester-rust)
- [Erlang](https://github.com/GreptimeTeam/greptimedb-ingester-erl)
- [.NET](https://github.com/GreptimeTeam/greptimedb-ingester-dotnet)
- [TypeScript](https://github.com/GreptimeTeam/greptimedb-ingester-ts)
- For other languages (Python, Ruby, etc.): use any OpenTelemetry SDK, InfluxDB client library, or MySQL/PostgreSQL driver — GreptimeDB is compatible with all of them.

### How do I choose the right ingestion protocol?

GreptimeDB supports multiple ingestion protocols with very different throughput characteristics. The following results are from a local benchmark at 1 million time series (batch size 1,000) — **focus on the relative ratios rather than absolute numbers**, as actual throughput varies by hardware and workload:

| Protocol | Relative throughput |
| --- | --- |
| gRPC Bulk (Arrow Flight) | Highest (~37x SQL) |
| gRPC Stream | ~21x SQL |
| gRPC SDK (Unary) | ~16x SQL |
| InfluxDB Line Protocol | ~12x SQL |
| OTLP Logs | ~8.5x SQL |
| MySQL / PostgreSQL INSERT | Baseline |

**How to choose:**

- **General workloads**: gRPC SDK — best balance of simplicity and performance, with schemaless support.
- **Bulk operations** (migrations, backfills): gRPC Bulk — maximum throughput, requires pre-created tables.
- **Continuous streams** (IoT, monitoring collectors): gRPC Stream — sustained high throughput over persistent connections.
- **Ecosystem integration**: InfluxDB Line Protocol (Telegraf-compatible) or OTLP (OpenTelemetry-compatible) — good throughput with broad tool support.
- **Development / debugging**: SQL protocols (MySQL / PostgreSQL) — lower throughput but easier to inspect and debug.

For the full benchmark details and methodology, see the [Ingestion Protocol Benchmark](https://greptime.com/blogs/2026-03-24-ingestion-protocol-benchmark) blog post.

### How do I connect Grafana to GreptimeDB?

GreptimeDB works with Grafana through three data source options:

- **[GreptimeDB plugin](/user-guide/integrations/grafana.md#greptimedb-data-source-plugin)**: Official plugin with full SQL and PromQL support.
- **[Prometheus data source](/user-guide/integrations/grafana.md#prometheus-data-source)**: Use GreptimeDB's Prometheus-compatible endpoint for PromQL dashboards.
- **[MySQL data source](/user-guide/integrations/grafana.md#mysql-data-source)**: Use the built-in MySQL data source with GreptimeDB's MySQL protocol endpoint.

See [Grafana Integration](/user-guide/integrations/grafana.md) for setup instructions.

### How can I migrate from other databases?

GreptimeDB provides migration guides for:

- **From InfluxDB**: Line protocol and data migration
- **From Prometheus**: Remote write and historical data migration
- **From ClickHouse**: Table schema and data migration
- **From MySQL/PostgreSQL**: SQL-based migration

For detailed instructions, see [Migration Overview](/user-guide/migrate-to-greptimedb/overview.md).

## Deployment & Operations

### What are the deployment options?

**Cluster deployment** (production):
- Minimum 3 nodes for high availability
- Three components: metasrv, frontend, and datanode
- Components can be co-located or separated depending on scale
- See [Capacity Planning Guide](/user-guide/deployments-administration/capacity-plan.md)

**Standalone** (development / edge / IoT):
- Single binary, all components in one process
- Runs on Linux, macOS, Android ARM64, Raspberry Pi
- See [Installation Guide](/getting-started/installation/overview.md)

**Storage backends**: S3, GCS, Azure Blob (recommended for production); local disk (development, testing, or small-scale). Metadata: RDS or etcd (cluster), local storage (standalone).

For a full overview, see [Deployments & Administration](/user-guide/deployments-administration/overview.md).

### Which metadata storage backend should I use for metasrv?

GreptimeDB supports etcd, MySQL, and PostgreSQL as metadata storage backends for the metasrv component.

For production deployments, **PostgreSQL or MySQL (including cloud RDS services) is generally recommended** — most teams already have operational experience, monitoring, backup, and disaster recovery strategies for relational databases.

That said, **etcd remains fully supported and actively maintained**. It is not deprecated. If your team has strong etcd expertise and operational tooling, it is a perfectly valid choice.

The decision ultimately comes down to your team's skill set and existing infrastructure. See [Metadata Storage Configuration](/user-guide/deployments-administration/manage-metadata/configuration.md) for setup instructions for each backend.

### How do I manage GreptimeDB?

GreptimeDB uses **standard SQL as its management interface**. You can [create tables](/user-guide/deployments-administration/manage-data/basic-table-operations.md), [alter schemas](/reference/sql/alter.md), set [TTL policies](/user-guide/manage-data/overview.md#manage-data-retention-with-ttl-policies), and configure [indexes](/user-guide/manage-data/data-index.md) — all through SQL. No config files to write, no proprietary APIs to call.

For configuration beyond SQL (e.g., node-level settings), see the [Configuration Guide](/user-guide/deployments-administration/configuration.md).

### How do I upgrade GreptimeDB?

See the [Upgrade Guide](/user-guide/deployments-administration/upgrade.md) for version-specific instructions, compatibility notes, and breaking changes.

### How do I back up and restore data?

GreptimeDB provides export and import tools for full database backup and restoration, including schema-only operations and S3 export support.

See [Data Export & Import](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data.md).

### Can I migrate data between standalone and cluster mode?

Yes. Use [`COPY TO`](/reference/sql/copy.md) to export tables from standalone mode, then [`COPY FROM`](/reference/sql/copy.md) to import them into a cluster (or vice versa). Data is exported in Parquet format and can be staged locally or in object storage (S3, GCS).

### My WAL directory is growing large. Is this normal?

WAL (Write-Ahead Log) space is cyclically reused after data is flushed to persistent storage. If the WAL directory appears large, it usually means data has not been flushed yet, or the WAL retention settings need tuning. WAL space is temporary — when measuring storage consumption, measure only the data directory (`data`).

For WAL configuration options, see the [Configuration Guide](/user-guide/deployments-administration/configuration.md).

### Queries fail with `Too many files to read concurrently`. What should I do?

This error means a single query is trying to scan more SST files than the per-query concurrency cap. A typical message:

```
Too many files to read concurrently: 1528, max allowed: 384
```

Two common causes:

- **Too many small SST files** — often seen after backfilling historical data with widely-spread timestamps, before compaction has merged them.
- **The default file concurrency cap is too conservative** for your CPU/memory budget.

**Diagnose**: use the [SSTS_MANIFEST](/reference/sql/information-schema/ssts-manifest.md) view to inspect file counts per table per day. Filter by `min_ts` to keep the result set manageable:

```sql
SELECT table_id, date_trunc('day', min_ts), COUNT(*) AS files, SUM(num_rows) AS rows
FROM information_schema.ssts_manifest
WHERE min_ts > '2026-05-01 00:00:00'
GROUP BY table_id, date_trunc('day', min_ts)
ORDER BY files DESC;
```

**Mitigate**:

1. Raise the per-query file cap on the datanode (or standalone) under `[region_engine.mito]`:

   ```toml
   [region_engine.mito]
   max_concurrent_scan_files = 1024
   ```

   The default `384` is intentionally conservative. On hosts with more CPU and memory headroom, a larger value lets heavier scans finish without being rejected. Restart the affected datanodes after editing.

2. Trigger manual compaction using the Strict Window Compaction Strategy. If a single day holds many small files, use a window smaller than the default 1 day — see [Compaction](/user-guide/deployments-administration/manage-data/compaction.md):

   ```sql
   -- 1-hour window, parallelism=2
   ADMIN COMPACT_TABLE('<table_name>', 'swcs', 'window=3600,parallelism=2');
   ```

### What are GreptimeDB's scalability characteristics?

- No strict limitations on table or column count; performance scales with primary key design rather than table count.
- Automatic time-based organization within regions.
- Manual distributed sharding via `PARTITION` clause — see [Table Sharding Guide](/user-guide/deployments-administration/manage-data/table-sharding.md).
- Multi-tiered caching (write cache + LRU read cache) for optimal performance.
- Object storage backend (S3/GCS/Azure Blob) provides virtually unlimited storage capacity.
- Distributed query execution with MPP for large datasets.

### How does data distribution work?

- Manual partitioning via `PARTITION` clause during table creation — see [Table Sharding Guide](/user-guide/deployments-administration/manage-data/table-sharding.md).
- Time-based automatic organization within regions.
- Manual region migration for load balancing — see [Region Migration Guide](/user-guide/deployments-administration/manage-data/region-migration.md).
- Automatic region failover for disaster recovery — see [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md).

### What disaster recovery options are available?

GreptimeDB offers multiple disaster recovery strategies:

- **Standalone DR**: Remote WAL + object storage, RPO=0, RTO in minutes.
- **Region Failover**: Automatic failover for individual regions with minimal downtime.
- **Active-Active Failover** (Enterprise): Synchronous request replication between two nodes.
- **Cross-Region Single Cluster**: Spans three regions with zero RPO and region-level fault tolerance.
- **Backup and Restore**: Periodic data backups with RPO depending on backup frequency.

See [Disaster Recovery Overview](/user-guide/deployments-administration/disaster-recovery/overview.md).

### What should I do if ingestion fails with `Procedure poison key already exists`?

This error blocks ingestion when a schema-on-write `ALTER TABLE` (typically adding a new column for an incoming attribute) fails after exhausting retries (12 by default), leaving a stale poison key in the metadata store. Subsequent writes that try to evolve the same table are then rejected.

A typical error looks like:

```
Procedure poison key already exists with a different value
Key: /__procedure_poison/table/<table_id>
```

**Recovery steps**:

1. Delete the poison key from the metadata store. Replace `--backend` and `--store-addrs` with your own — see [Metadata Interaction](/reference/command-lines/utilities/metadata-interaction.md#delete-key-value-pair):

   ```bash
   greptime cli meta del key \
       --store-addrs=$ENDPOINT \
       --backend=postgres-store \
       /__procedure_poison/table/<table_id>
   ```

2. Run table reconciliation so that Metasrv and Datanode metadata converge. Use the schema and table that were affected — see [Table Reconciliation](/user-guide/deployments-administration/maintenance/table-reconciliation.md):

   ```sql
   USE <schema>;
   ADMIN reconcile_table('<table_name>');
   ```

3. If ingestion still fails with `Column ... not found in logical region`, the logical table's column metadata is out of sync with its physical table. Repair it via the CLI — see [Repair logical tables](/reference/command-lines/utilities/repair-logical-tables.md):

   ```bash
   greptime cli meta repair logical-tables \
       --store-addrs=$ENDPOINT \
       --backend=postgres-store \
       --table-names=<table_name> \
       --schema-name=<schema> \
       --catalog-name=greptime
   ```

**Troubleshooting tip**: If `ADMIN reconcile_*` returns `Done` immediately but Metasrv logs show no `Reconciling table:` entries, you are likely talking to a different Metasrv than expected — for example, another GreptimeDB cluster deployed in a separate namespace. Verify the topology (e.g. `kubectl get pods -A | grep meta`) before retrying.

### How do I monitor and troubleshoot GreptimeDB?

GreptimeDB exposes Prometheus-compatible metrics and provides health check endpoints. For monitoring setup and troubleshooting guides, see [Monitoring Overview](/user-guide/deployments-administration/monitoring/overview.md).

## Open Source vs Enterprise vs Cloud

### What are the differences between GreptimeDB versions?

- **Open Source**: Full distributed system, multiple protocol support, basic authentication.
- **Enterprise**: Adds cost-based query optimizer, active-active failover, automatic scaling/indexing, RBAC/LDAP, and 24/7 support.
- **GreptimeCloud**: Fully managed with resource and performance guarantees for production workloads, predictable pricing, and SLA guarantees.

For a detailed feature comparison, see [Pricing & Features](https://greptime.com/pricing#differences).

### Does the GreptimeDB Dashboard have authentication?

The open-source [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md) does not include built-in authentication. To restrict access, you can:

- Place a reverse proxy (e.g., Nginx, Caddy) in front of the dashboard and configure HTTP Basic Auth or other authentication mechanisms.
- Host the dashboard behind your organization's internal authentication system.

**GreptimeDB Enterprise** provides a management console with built-in authentication and access control.

### What security features are available?

**Open Source**:
- Basic username/password authentication
- User-level read/write access control
- TLS/SSL support for connections

**Enterprise / Cloud**:
- Role-based access control (RBAC)
- LDAP support
- Team management and API keys
- Data encryption at rest
- Audit logging for compliance
