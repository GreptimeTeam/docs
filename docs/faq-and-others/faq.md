---
keywords: [unified observability, metrics, logs, traces, performance, OpenTelemetry, Prometheus, Grafana, cloud-native, SQL, PromQL]
description: Frequently Asked Questions about GreptimeDB - the unified observability database for metrics, logs, and traces.
---

# Frequently Asked Questions

## Core Capabilities

### What is GreptimeDB?

GreptimeDB is an open-source, cloud-native unified observability database designed to store and analyze metrics, logs, and traces in a single system. Built with Rust for high performance, it offers:
- Up to 50x lower operational and storage costs
- Sub-second query responses on petabyte-scale datasets  
- Native OpenTelemetry support
- SQL, PromQL, and stream processing capabilities
- Compute-storage separation for flexible scaling

### How is GreptimeDB's performance compared to other solutions?

GreptimeDB delivers superior performance across observability workloads:

**Write Performance**:
- **2-4.7x faster** than Elasticsearch (up to 470% throughput)
- **1.5x faster** than Loki (121k vs 78k rows/s)
- **2x faster** than InfluxDB (250k-360k rows/s)
- **Matches ClickHouse** performance (111% throughput)

**Query Performance**:
- **40-80x faster** than Loki for log queries
- **500x faster** for repeated queries (with caching)
- **2-11x faster** than InfluxDB for complex time-series queries
- Competitive with ClickHouse across different query patterns

**Storage & Cost Efficiency**:
- **87% less storage** than Elasticsearch (12.7% footprint)
- **50% less storage** than ClickHouse
- **50% less storage** than Loki (3.03GB vs 6.59GB compressed)
- **Up to 50x lower** operational costs vs traditional stacks

**Resource Optimization**:
- **40% less CPU** usage compared to previous versions
- **Lowest memory consumption** among tested databases
- Consistent performance on object storage (S3/GCS)
- Superior high-cardinality data handling

**Unique Advantages**:
- Single database for metrics, logs, and traces
- Native cloud-native architecture
- Horizontal scalability (handles 1.15B+ rows)
- Full-text search with native indexing

Benchmark reports: [vs InfluxDB](https://greptime.com/blogs/2024-08-07-performance-benchmark) | [vs Loki](https://greptime.com/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report) | [Log Benchmark](https://greptime.com/blogs/2025-03-10-log-benchmark-greptimedb)

### How does GreptimeDB handle metrics, logs, and traces?

GreptimeDB is designed as a unified observability database that natively supports all three telemetry types:
- **Metrics**: Full Prometheus compatibility with PromQL support
- **Logs**: Full-text indexing, Loki protocol support, and efficient compression
- **Traces**: Experimental OpenTelemetry trace storage with scalable querying

This unified approach eliminates data silos and enables cross-signal correlation without complex data pipelines.

For detailed documentation:
- [Log Overview](/user-guide/logs/overview.md)
- [Trace Overview](/user-guide/traces/overview.md)
- [OpenTelemetry compatibility](/user-guide/ingest-data/for-observability/opentelemetry.md)
- [Prometheus compatibility](/user-guide/ingest-data/for-observability/prometheus.md)
- [Loki protocol compatibility](/user-guide/ingest-data/for-observability/loki.md)
- [Elasticsearch compatibility](/user-guide/ingest-data/for-observability/elasticsearch.md)
- [Vector compatibility](/user-guide/ingest-data/for-observability/vector.md)

### What are the main use cases for GreptimeDB?

GreptimeDB excels in:
- **Unified Observability**: Replace complex monitoring stacks with a single database
- **Edge and Cloud Data Management**: Seamless data synchronization across environments
- **IoT and Automotive**: Process high-volume sensor data efficiently
- **AI/LLM Monitoring**: Track model performance and behavior
- **Real-time Analytics**: Sub-second queries on petabyte-scale datasets

## Architecture & Performance

### Can GreptimeDB replace my Prometheus setup?

Yes, GreptimeDB provides:
- Native PromQL support with near 100% compatibility
- Prometheus remote write protocol support
- Efficient handling of high-cardinality metrics
- Long-term storage without downsampling
- Better resource efficiency than traditional Prometheus+Thanos stacks

### What indexing capabilities does GreptimeDB offer?

GreptimeDB provides rich indexing options:
- **Inverted indexes**: Fast lookups on tag columns
- **Full-text indexes**: Efficient log searching
- **Skipping indexes**: Accelerate range queries
- **Vector indexes**: Support for AI/ML workloads

These indexes enable sub-second queries even on petabyte-scale datasets.

For configuration details, see [Index Management](/user-guide/manage-data/data-index.md).

### How does GreptimeDB achieve cost efficiency?

GreptimeDB reduces costs through:
- **Columnar storage**: Superior compression ratios
- **Compute-storage separation**: Independent scaling of resources
- **Efficient cardinality management**: Handles high-cardinality data without explosion
- **Unified platform**: Eliminates need for multiple specialized databases

Result: Up to 50x lower operational and storage costs compared to traditional stacks.

### What makes GreptimeDB cloud-native?

GreptimeDB is purpose-built for Kubernetes with:
- **Disaggregated architecture**: Separate compute and storage layers
- **Elastic scaling**: Add/remove nodes based on workload
- **Multi-cloud support**: Run across AWS, GCP, Azure seamlessly
- **Kubernetes operators**: Simplified deployment and management
- **Object storage backend**: Use S3, GCS, or Azure Blob for data persistence

For Kubernetes deployment details, see the [Kubernetes Deployment Guide](/user-guide/deployments-administration/deploy-on-kubernetes/overview.md).

### Does GreptimeDB support schemaless data ingestion?

Yes, GreptimeDB supports automatic schema creation when using:
- gRPC protocol
- InfluxDB Line Protocol
- OpenTSDB protocol
- Prometheus Remote Write
- OpenTelemetry protocol
- Loki protocol (for log data)
- Elasticsearch-compatible APIs (for log data)

Tables and columns are created automatically on first write, eliminating manual schema management.

## Integration & Compatibility

### What protocols and tools does GreptimeDB support?

GreptimeDB provides extensive compatibility:
- **Protocols**: OpenTelemetry, Prometheus Remote Write, InfluxDB Line, Loki, Elasticsearch, MySQL, PostgreSQL (see [Protocols Overview](/user-guide/protocols/overview.md))
- **Query Languages**: SQL, PromQL
- **Visualization**: [Grafana integration](/user-guide/integrations/grafana.md), any MySQL/PostgreSQL compatible tool
- **Data Pipeline**: Vector, Fluent Bit, Telegraf, Kafka
- **SDKs**: Go, Java, Rust, Erlang, Python

### Is GreptimeDB compatible with Grafana?

Yes, GreptimeDB offers:
- [Grafana integration](/user-guide/integrations/grafana.md) with official plugin
- [MySQL/PostgreSQL protocol support](/user-guide/integrations/grafana.md#mysql-data-source) for standard Grafana data sources
- [Native PromQL](/user-guide/query-data/promql.md) for Prometheus-style queries
- SQL support for complex analytics

### How does GreptimeDB integrate with OpenTelemetry?

GreptimeDB is OpenTelemetry-native:
- Direct OTLP ingestion for metrics, logs, and traces
- No translation layer or data loss
- Supports OpenTelemetry Collector and SDKs
- Preserves semantic conventions and resource attributes

### What SDKs are available for GreptimeDB?

- **Go**: [greptimedb-ingester-go](https://github.com/GreptimeTeam/greptimedb-ingester-go)
- **Java**: [greptimedb-ingester-java](https://github.com/GreptimeTeam/greptimedb-ingester-java)
- **Rust**: [greptimedb-ingester-rust](https://github.com/GreptimeTeam/greptimedb-ingester-rust)
- **Erlang**: [greptimedb-ingester-erl](https://github.com/GreptimeTeam/greptimedb-ingester-erl)
- **Python**: Via SQL drivers (MySQL/PostgreSQL compatible)

### How can I migrate from other databases to GreptimeDB?

GreptimeDB provides migration guides for popular databases:
- **From ClickHouse**: Table schema and data migration
- **From InfluxDB**: Line protocol and data migration  
- **From Prometheus**: Remote write and historical data migration
- **From MySQL/PostgreSQL**: SQL-based migration

For detailed migration instructions, see [Migration Overview](/user-guide/migrate-to-greptimedb/overview.md).

### What disaster recovery options does GreptimeDB provide?

GreptimeDB offers multiple disaster recovery strategies to meet different availability requirements:

- **Standalone DR Solution**: Uses remote WAL and object storage, achieving RPO=0 and RTO in minutes for small-scale scenarios
- **Region Failover**: Automatic failover for individual regions with minimal downtime
- **Active-Active Failover** (Enterprise): Synchronous request replication between nodes for high availability
- **Cross-Region Single Cluster**: Spans three regions with zero RPO and region-level error tolerance
- **Backup and Restore**: Periodic data backups with configurable RPO based on backup frequency

Choose the appropriate solution based on your availability requirements, deployment scale, and cost considerations. For detailed guidance, see [Disaster Recovery Overview](/user-guide/deployments-administration/disaster-recovery/overview.md).

## Data Management & Processing

### How does GreptimeDB handle data lifecycle?

**Retention Policies**:
- Database-level and table-level TTL settings
- Automatic data expiration without manual cleanup
- Configurable via [TTL Documentation](/reference/sql/create.md#table-options)

**Data Export**:
- [`COPY TO` command](/reference/sql/copy.md#connect-to-s3) for S3, local files
- Standard SQL queries via any compatible client
- Export functionality for backup and disaster recovery: [Back up & Restore Data](/user-guide/deployments-administration/disaster-recovery/back-up-&-restore-data.md)

### How does GreptimeDB handle high-cardinality and real-time processing?

**High-Cardinality Management**:
- Advanced indexing strategies prevent cardinality explosion
- Columnar storage with intelligent compression
- Distributed query execution with data pruning
- Handles millions of unique time series efficiently

Learn more about indexing: [Index Management](/user-guide/manage-data/data-index.md)

**Real-Time Processing**:
- **[Flow Engine](/user-guide/flow-computation/overview.md)**: Real-time stream processing system that enables continuous, incremental computation on streaming data with automatic result table updates
- **[Pipeline](/user-guide/logs/pipeline-config.md)**: Data parsing and transformation mechanism for processing log data in real-time, with configurable processors for field extraction and data type conversion
- **Output Tables**: Persist processed results for analysis


### What are GreptimeDB's scalability characteristics?

**Scale Limits**:
- No strict limitations on table or column count
- Hundreds of tables with minimal performance impact
- Performance scales with primary key design, not table count
- Column-oriented storage ensures efficient partial reads

**Partitioning & Distribution**:
- Automatic time-based organization within regions
- Manual distributed sharding via PARTITION clause (see [Table Sharding Guide](/user-guide/deployments-administration/manage-data/table-sharding.md))
- Automatic region splitting planned for future releases
- **Dynamic partitioning without configuration** (Enterprise feature)

**Core Scalability Features**:
- **Multi-tiered caching**: Write cache (disk-backed) and read cache (LRU policy) for optimal performance
- **Object storage backend**: Virtually unlimited storage via S3/GCS/Azure Blob
- **Asynchronous WAL**: Efficient write-ahead logging with optional per-table controls
- **Distributed query execution**: Multi-node coordination for large datasets
- **Manual Compaction**: Available via [admin commands](/reference/sql/admin.md)

**Enterprise Scale Features**:
- Advanced partitioning and automatic rebalancing
- Enhanced multi-tenancy and isolation
- Enterprise-grade monitoring and management tools

For architecture details, see the [storage architecture blog](https://greptime.com/blogs/2025-03-26-greptimedb-storage-architecture).

### What are GreptimeDB's design trade-offs?

GreptimeDB is optimized for observability workloads with intentional limitations:
- **No ACID transactions**: Prioritizes high-throughput writes over transactional consistency
- **Limited delete operations**: Designed for append-heavy observability data
- **Time-series focused**: Optimized for IoT, metrics, logs, and traces rather than general OLTP
- **Simplified joins**: Optimized for time-series queries over complex relational operations

## Deployment & Operations

### What are the deployment options for GreptimeDB?

**Cluster Deployment** (Production):
- Minimum 3 nodes for high availability
- Services: metasrv, frontend, and datanode on each node
- Can separate services for larger scale deployments
- See [Capacity Planning Guide](/user-guide/deployments-administration/capacity-plan.md)

**Edge & Standalone**:
- Android ARM64 platforms (prebuilt binaries available)
- Raspberry Pi and constrained environments
- Single-node mode for development/testing
- Efficient resource usage for IoT scenarios

**Storage Backends**:
- **Production**: S3, GCS, Azure Blob for data persistence
- **Development**: Local storage for testing
- **Metadata**: MySQL/PostgreSQL backend support for metasrv

For deployment and administration details: [Deployments & Administration Overview](/user-guide/deployments-administration/overview.md)

### How does data distribution work?

**Current State**:
- Manual partitioning via PARTITION clause during table creation (see [Table Sharding Guide](/user-guide/deployments-administration/manage-data/table-sharding.md))
- Time-based automatic organization within regions
- Manual region migration support for load balancing (see [Region Migration Guide](/user-guide/deployments-administration/manage-data/region-migration.md))
- Automatic region failover for disaster recovery (see [Region Failover](/user-guide/deployments-administration/manage-data/region-failover.md))

**Roadmap**:
- Automatic region splitting and rebalancing
- Dynamic workload distribution across nodes

### How do I monitor and troubleshoot GreptimeDB?

GreptimeDB provides comprehensive monitoring capabilities including metrics collection, health checks, and observability integrations. For detailed monitoring setup and troubleshooting guides, see the [Monitoring Overview](/user-guide/deployments-administration/monitoring/overview.md).

## Open Source vs Enterprise vs Cloud

### What are the differences between GreptimeDB versions?

**Open Source Version**:
- High-performance ingestion and query capabilities
- Cluster deployment with basic read-write separation
- Multiple protocol support (OpenTelemetry, Prometheus, InfluxDB, etc.)
- Basic authentication and access control
- Basic data encryption
- Community support

**Enterprise Version** (all Open Source features plus):
- Cost-based query optimizer for better performance
- Advanced read-write separation and active-active failover (see [Active-Active Failover](/enterprise/deployments-administration/disaster-recovery/dr-solution-based-on-active-active-failover.md))
- Automatic scaling, indexing, and load balancing
- Layered caching and enterprise-level web console
- Enterprise authorization (RBAC/LDAP integration)
- Enhanced security and audit features
- One-on-one technical support with 24/7 service response
- Professional customization services

**GreptimeCloud** (fully managed, all Enterprise features plus):
- Serverless autoscaling with pay-as-you-go pricing
- Fully managed deployment with seamless upgrades
- Independent resource pools with isolated networks
- Configurable read/write capacity and unlimited storage
- Advanced dashboard with Prometheus workbench
- SLA guarantees and automated disaster recovery

For detailed comparison, see [Pricing & Features](https://greptime.com/pricing#differences).

### What security features are available?

**Open Source**:
- Basic username/password authentication
- TLS/SSL support for connections

**Enterprise/Cloud**:
- Role-based access control (RBAC)
- Team management and API keys
- Data encryption at rest
- Audit logging for compliance

## Technical Details

### How does GreptimeDB extend Apache DataFusion?

GreptimeDB builds on DataFusion with:
- **Query Languages**: Native PromQL alongside SQL
- **Distributed Execution**: Multi-node query coordination
- **Custom Functions**: Time-series specific UDFs/UDAFs
- **Optimizations**: Rules tailored for observability workloads
- **Counter Handling**: Automatic reset detection in `rate()` and `delta()` functions

For custom function development: [Function Documentation](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/how-to/how-to-write-aggregate-function.md)

### What's the difference between GreptimeDB and InfluxDB?

Key differences:
- **Open Source**: GreptimeDB's entire distributed system is fully open source
- **Architecture**: Region-based design optimized for observability workloads
- **Query Languages**: SQL + PromQL vs InfluxQL + SQL
- **Unified Model**: Native support for metrics, logs, and traces in one system
- **Storage**: Pluggable engines with dedicated optimizations
- **Cloud-Native**: Built for Kubernetes with disaggregated compute/storage (see [Kubernetes Deployment Guide](/user-guide/deployments-administration/deploy-on-kubernetes/overview.md))

For detailed comparisons, see [GreptimeDB vs InfluxDB](https://greptime.com/compare/influxdb). Additional product comparisons (vs. ClickHouse, Loki, etc.) are available in the Resources menu on our website.

### How does GreptimeDB's storage engine work?

**LSM-Tree Architecture**:
- Based on Log-Structured Merge Tree (LSMT) design
- WAL can use local disk or distributed services (e.g., Kafka) via Log Store API
- SST files are flushed to object storage (S3/GCS) or local disk
- Designed for cloud-native environments with object storage as primary backend
- Optimized for time-series workloads with TWCS (Time-Window Compaction Strategy)

**Performance Considerations**:
- **Timestamps**: Datetime formats (yyyy-MM-dd HH:mm:ss) have no performance impact
- **Compression**: Measure only data directory; WAL is cyclically reused
- **Append-only tables**: Recommended for better write and query performance, especially for log scenarios
- **Flow Engine**: Currently SQL-based; PromQL support under evaluation

### What are best practices for specific use cases?

**Network Monitoring** (e.g., thousands of NICs):
- Use Flow tables for continuous aggregation
- Manual downsampling via Flow Engine for data reduction
- Output to regular tables for long-term storage

**Log Analytics**:
- Use append-only tables for better write and query performance
- Create indexes on frequently queried fields ([Index Management](/user-guide/manage-data/data-index.md))
- Storage efficiency: 50% of ClickHouse, 12.7% of Elasticsearch

**Table Design & Performance**:
- For table modeling guidance: [Design Table](/user-guide/deployments-administration/performance-tuning/design-table.md)
- For performance optimization: [Performance Tuning Tips](/user-guide/deployments-administration/performance-tuning/performance-tuning-tips.md)


## Getting Started

### Where can I find documentation and benchmarks?

**Performance & Benchmarks**:
- [TSBS Benchmarks](https://github.com/GreptimeTeam/greptimedb/tree/main/docs/benchmarks/tsbs)
- [Performance Comparisons](/user-guide/concepts/features-that-you-concern.md#how-is-greptimedbs-performance-compared-to-other-solutions)
- [vs InfluxDB](https://greptime.com/blogs/2024-08-07-performance-benchmark)
- [vs Loki](https://greptime.com/blogs/2025-08-07-beyond-loki-greptimedb-log-scenario-performance-report)
- [Log Benchmark](https://greptime.com/blogs/2025-03-10-log-benchmark-greptimedb)

**Installation & Deployment**:
- [Installation Guide](/getting-started/installation/overview.md)
- [Capacity Planning](/user-guide/deployments-administration/capacity-plan.md)
- [Configuration Guide](/user-guide/deployments-administration/configuration.md)

### How can I contribute to GreptimeDB?

Welcome to the community! Get started:
- **Code**: [Contribution Guide](https://github.com/GreptimeTeam/greptimedb/blob/main/CONTRIBUTING.md)
- **First Issues**: [Good First Issues](https://github.com/GreptimeTeam/greptimedb/issues?q=is%3Aopen+is%3Aissue+label%3A%22Good+first+issue%22)
- **Community**: [Slack Channel](https://greptime.com/slack)
- **Documentation**: [Help improve these docs!](https://github.com/GreptimeTeam/docs)

### What's next?

1. **Try GreptimeCloud**: [Free serverless tier](https://greptime.com/product/cloud)
2. **Self-host**: Follow the [installation guide](/getting-started/installation/overview.md)
3. **Explore Integrations**: GreptimeDB supports extensive integrations with Prometheus, Vector, Kafka, Telegraf, EMQX, Metabase, and many more. See [Integrations Overview](/user-guide/integrations/overview.md) for the complete list, or start with [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md) or [Prometheus](/user-guide/ingest-data/for-observability/prometheus.md)
4. **Join Community**: Connect with users and maintainers on [Slack](https://greptime.com/slack)