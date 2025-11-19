---
keywords: [cloud-native, observability database, high performance, cost-effective, unified design]
description: Explains the motivations and benefits of using GreptimeDB, including its unified design for metrics, logs, and traces, cloud-native architecture, cost-effectiveness, high performance, and ease of use. It highlights key features and deployment strategies.
---

# Why GreptimeDB

GreptimeDB is an open-source observability database built for cloud-native environments. Our core developers have extensive experience building observability platforms, and GreptimeDB embodies their best practices in the following key areas:

## Unified Processing for Observability Data

GreptimeDB unifies the processing of metrics, logs, and traces through:
- A consistent [data model](./data-model.md) that treats all observability data as timestamped wide events with context
- Native support for both [SQL](/user-guide/query-data/sql.md) and [PromQL](/user-guide/query-data/promql.md) queries
- Built-in stream processing capabilities ([Flow](/user-guide/flow-computation/overview.md)) for real-time aggregation and analytics
- Seamless correlation analysis across different types of observability data (read the [SQL example](/getting-started/quick-start.md#correlate-metrics-and-logs) for detailed info)

It replaces complex legacy data stacks with a high-performance single solution.

<p align='center'><img src="/unify-processing.png" alt="Replaces complex legacy data stacks with a high-performance single solution" width="400"/></p>

## Cost-Effective with Object Storage

GreptimeDB leverages cloud object storage (like AWS S3 and Azure Blob Storage etc.) as its storage layer, dramatically reducing costs compared to traditional storage solutions. Its optimized columnar storage and advanced compression algorithms achieve up to 50x cost efficiency. Scale flexibly across cloud storage systems (e.g., S3, Azure Blob Storage) for simplified management, dramatic cost efficiency, and **no vendor lock-in**.

## High Performance

As for performance optimization, GreptimeDB utilizes different techniques such as LSM Tree, data sharding, and flexible WAL options (local disk or distributed services like Kafka), to handle large workloads of observability data ingestion.

GreptimeDB is written in pure Rust for superior performance and reliability. The powerful and fast query engine is powered by vectorized execution and distributed parallel processing (thanks to [Apache DataFusion](https://datafusion.apache.org/)), and combined with [indexing capabilities](/user-guide/manage-data/data-index.md) such as inverted index, skipping index, and full-text index. GreptimeDB combines smart indexing and Massively Parallel Processing (MPP) to boost pruning and filtering.

[GreptimeDB achieves 1 billion cold runs #1 in JSONBench!](https://greptime.com/blogs/2025-03-18-jsonbench-greptimedb-performance) Read more [benchmark reports](https://www.greptime.com/blogs/2024-09-09-report-summary).

## Elastic Scaling with Kubernetes

Built from the ground up for Kubernetes, GreptimeDB features a disaggregated storage and compute architecture that enables true elastic scaling:
- Independent scaling of storage and compute resources
- Unlimited horizontal scalability through Kubernetes
- Resource isolation between different workloads (ingestion, querying, compaction)
- Automatic failover and high availability

![Storage/Compute Disaggregation, Compute/Compute separation](/storage-compute-disaggregation-compute-compute-separation.png)

## Flexible Architecture: From Edge to Cloud

![The architecture of GreptimeDB](/architecture-2.png)

GreptimeDB’s modularized architecture allows different components to operate independently or in unison as needed. Its flexible design supports a wide variety of deployment scenarios, from edge devices to cloud environments, while still using consistent APIs for operations. For example:
- Frontend, datanode, and metasrv can be merged into a standalone binary
- Components like WAL or indexing can be enabled or disabled per table

This flexibility ensures that GreptimeDB meets deployment requirements for edge-to-cloud solutions, like the [Edge-Cloud Integrated Solution](https://greptime.com/product/carcloud).

From embedded and standalone deployments to cloud-native clusters, GreptimeDB adapts to various environments easily.

## Easy to Use

### Easy to Deploy and Maintain

GreptimeDB simplifies deployment and maintenance with tools like:
- [K8s Operator](https://github.com/GreptimeTeam/greptimedb-operator)
- [Helm Charts](https://github.com/GreptimeTeam/helm-charts)
- [Command-line Tool](https://github.com/GreptimeTeam/gtctl)
- Embedded [Dashboard](https://github.com/GreptimeTeam/dashboard)

### Easy to Integrate

GreptimeDB supports multiple data ingestion protocols, making integration with existing observability stacks seamless:
- **Database protocols**: MySQL, PostgreSQL
- **Time-series protocols**: InfluxDB, OpenTSDB
- **Observability protocols**: OpenTelemetry, Loki, ElasticSearch, Prometheus RemoteStorage
- **gRPC with SDKs**: Java, Go, Erlang, etc.

For data querying, GreptimeDB provides:
- **SQL**: For real-time queries, analytics, and database management
- **PromQL**: Native support for real-time metrics querying and Grafana integration

GreptimeDB integrates seamlessly with your observability stack while maintaining high performance and flexibility.

![Greptime Ecosystem](/greptime-ecosystem.png)

### Simple Data Model with Automatic Schema

GreptimeDB introduces a new data model that combines time-series and relational models:
- Data is represented as a table with rows and columns
- Metrics, logs, and traces map to columns with a time index for timestamps
- Schema is created dynamically and new columns are added automatically as data is ingested

![Time-Series Table](/time-series-table.png)

However, our definition of schema is not mandatory, but rather leans towards the schema-less approach of databases like MongoDB. Tables will be created automatically and dynamically as data is written, and newly appearing columns (Tag and Field) will be added automatically. For a more detailed explanation, please read the [Data Model](./data-model.md).


For more details, explore our blogs:
- ["Observability 2.0 and the Database for It"](https://greptime.com/blogs/2025-04-25-greptimedb-observability2-new-database)
- ["This Time, for Real"](https://greptime.com/blogs/2022-11-15-this-time-for-real)
- ["Unified Storage for Observability - GreptimeDB's Approach"](https://greptime.com/blogs/2024-12-24-observability)
