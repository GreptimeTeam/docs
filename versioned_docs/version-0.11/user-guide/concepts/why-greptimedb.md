---
keywords: [cloud-native, time series database, high performance, cost-effective, unified design]
description: Explains the motivations and benefits of using GreptimeDB, including its unified design for metrics, logs, and events, cloud-native architecture, cost-effectiveness, high performance, and ease of use. It highlights key features and deployment strategies.
---


# Why GreptimeDB

GreptimeDB is an open-source time series database built for cloud-native environments. Our core developers have extensive experience building time-series platforms, and GreptimeDB embodies their best practices in three key areas:

## Cost-Effective with Object Storage

GreptimeDB leverages cloud object storage (like AWS S3 and Azure Blob Storage etc.) as its storage layer, dramatically reducing costs compared to traditional storage solutions. Its optimized columnar storage and advanced compression algorithms achieve up to 50x cost efficiency, while the pay-as-you-go model( via [GreptimeCloud](https://greptime.com/product/cloud)) ensures you only pay for what you use.

## High Performance

As for performance optimization, GreptimeDB utilizes different techniques such as, LSM Tree, data sharding, and kafka-based WAL design, to handle large workloads of time-series data ingestion.

GreptimeDB is written in pure Rust for superior performance and reliability. The powerful and fast query engine is powered by vectorized execution and distributed parallel processing (Thanks to [Apache DataFusion](https://datafusion.apache.org/)), and combined with [indexing capabilities](/user-guide/manage-data/data-index) such as inverted index, data skipping index and full-text index, etc. GreptimeDB builds smart indexing and Massively Parallel Processing (MPP) together to boost pruning and filtering. read the [benchmark reports](https://www.greptime.com/blogs/2024-09-09-report-summary).

## Elastic Scaling with Kubernetes

Built from the ground up for Kubernetes, GreptimeDB features a disaggregated storage and compute architecture that enables true elastic scaling:

- Independent scaling of storage and compute resources
- Unlimited horizontal scalability through Kubernetes
- Resource isolation between different workloads (ingestion, querying, compaction)
- Automatic failover and high availability

![Storage/Compute Disaggregation, Compute/Compute separation](/storage-compute-disaggregation-compute-compute-separation.png)

## Unified Processing for All Time Series Data

GreptimeDB unifies the processing of metrics, logs, and events through:

- A consistent [data model]((./data-model.md)) that treats all time series data as timestamped events with context
- Native support for both [SQL](/user-guide/query-data/sql.md) and [PromQL](/user-guide/query-data/promql.md) queries
- Built-in stream processing capabilities([Flow](/user-guide/flow-computation/overview.md)) for real-time analytics
- Seamless correlation analysis across different types of time series data, read the [SQL example](/user-guide/overview.md#sql-query-example) for detailed info.

## Flexible Architecture: from Edge to Cloud

![The architecture of GreptimeDB](/architecture-2.png)

With flexible architecture design principles, different modules and components can be independently switched on, combined, or separated through modularization and layered design.
For example, we can merge the frontend, datanode, and metasrv modules into a standalone binary, and we can also independently enable or disable the WAL for every table.

Flexible architecture allows GreptimeDB to meet deployment and usage requirements in scenarios from the edge to the cloud, while still using the same set of APIs and control panels, learn the [Edge-Cloud Integrated Solution](https://greptime.com/product/carcloud).

Through well-abstracted layering and encapsulation isolation, GreptimeDB's deployment form supports various environments from embedded, standalone, and traditional clusters to cloud-native.

## Easy to Use

### Easy to Deploy and Maintain

To simplify deployment and maintenance processes, GreptimeDB provides [K8s operator](https://github.com/GreptimeTeam/greptimedb-operator), [command-line tool](https://github.com/GreptimeTeam/gtctl), embedded [dashboard](https://github.com/GreptimeTeam/dashboard), and other useful tools for users to configure and manage their databases easily. Check [GreptimeCloud](https://greptime.com/product/cloud) on our official website for more information.

### Easy to Integrate

GreptimeDB supports multiple ingestion protocols:
- Database protocols: MySQL, PostgreSQL
- Time-series protocols: InfluxDB, OpenTSDB, Prometheus RemoteStorage
- Observability protocols: OpenTelemetry, Loki, ElasticSearch
- High-performance gRPC with client SDKs (Java, Go, Erlang, etc.)

For data querying, GreptimeDB offers:
- **SQL**: For real-time queries, complex analytics, and database management
- **PromQL**: Native support for real-time metrics querying and Grafana integration
- **Python**: (Planned) In-database UDF and DataFrame operations for data science workloads

This unified approach enables seamless integration with existing observability stacks while maintaining high performance and flexibility.

![Greptime Ecosystem](/greptime-ecosystem.png)
￼
### Simple Data Model with Automatic Schema

Combining the metrics (Measurement/Tag/Field/Timestamp) model and the relational data model (Table), GreptimeDB provides a new data model called a time-series table (see below), which presents data in the form of tables consisting of rows and columns, with tags and fields of the metrics, logs and events mapped to columns, and an enforced time index constraint that represents the timestamp.

![Time-Series Table](/time-series-table.png)

Nevertheless, our definition of a schema is not mandatory but leans more towards the schemaless approach of databases like MongoDB.
The table will be created dynamically and automatically when data is ingested, and new columns (tags and fields) will be added as they appear.

To learn more about our approach and architecture, check out our blog posts ["This Time, for Real"](https://greptime.com/blogs/2022-11-15-this-time-for-real), ["Unified Storage for Observability - GreptimeDB's Approach"](https://greptime.com/blogs/2024-12-24-observability) and ["Unifying Logs and Metrics"](https://greptime.com/blogs/2024-06-25-logs-and-metrics).