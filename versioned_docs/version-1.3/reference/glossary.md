---
keywords: [cloud-native, observability, open-source, time-series database, connected vehicles, IoT, log, metrics, events, rust]
description: Definitions of GreptimeDB concepts and terms for observability data, storage, querying, and operations.
---

# GreptimeDB Glossary

This glossary defines GreptimeDB terms for observability data, storage, querying, and operations.

---

## A

### Anomaly Detection
The process of identifying data points, events, or observations that deviate significantly from the norm. In time-series data, anomaly detection helps in spotting unusual patterns that may indicate critical incidents.

### Append Only Table
A table type that keeps every written row and does not support row updates or deletion. It skips deduplication and is commonly used for immutable logs and events.

---

## C

### Cardinality
A measure of the uniqueness of data elements in a database, such as the number of unique values in a column. High cardinality can increase the complexity and storage requirements of a database, especially in time-series data.

### Cloud-Native Design
An architectural approach that uses cloud infrastructure and services for deployment, scaling, and recovery. GreptimeDB can run as a standalone process at the edge or as a distributed cluster.

### Columnar Storage
A data layout that stores values by column rather than by row. Queries can read only the columns they need, and values with similar types and distributions can be compressed together.

---

<AnchorAlias id="d-1" />

## D

### Datanode
A core component in GreptimeDB's distributed architecture responsible for data storage and processing. Datanodes handle data ingestion, storage management, query execution on local data, and maintain regions containing actual table data. Multiple datanodes can be deployed across a cluster to provide horizontal scalability, fault tolerance, and distributed data processing capabilities.

### Decoupled Compute and Storage Architecture
An architecture in which compute and persistent data storage are managed separately. In distributed GreptimeDB deployments backed by shared object storage, Datanodes can be added or removed without moving every persistent data file between them.

---

## E

### Edge Database
A database deployed at the edge of a network, close to the data source or user, to minimize latency and optimize data processing in real-time.

### Edge Deployment
The practice of running a system close to its data source to reduce network latency and bandwidth use. GreptimeDB standalone can run on edge devices that meet its resource requirements.

### Event Management
The practice of collecting, organizing, and analyzing events such as logs, alerts, and state changes.

---

## F

### Field
A column role for measurements, log content, trace attributes, and other values. Field columns do not participate in the primary key.

### Frontend
The query processing layer in GreptimeDB's distributed architecture that serves as the entry point for client connections. Frontend nodes handle SQL parsing, query planning, distributed query coordination, and result aggregation. They route queries to appropriate datanodes, manage client sessions, and provide protocol compatibility for various database interfaces including MySQL, PostgreSQL, and GreptimeDB's native protocols.



### Flow Engine
GreptimeDB's engine for continuous computation over incoming rows from source tables. It materializes results in sink tables. Aggregation and TQL workloads use batching mode; the original streaming mode is deprecated and is not recommended for new workloads.

---

## G

### GreptimeCloud
GreptimeDB's fully managed database service. It provides hosted GreptimeDB instances with managed deployment, scaling, upgrades, and monitoring.

---

## I

### IoT Cloud
A cloud computing platform specifically designed to support Internet of Things (IoT) applications by providing the necessary storage, processing power, and connectivity to manage IoT data at scale.

### IoT Database
A database optimized for high-frequency data from Internet of Things (IoT) devices, including time-series measurements, device events, and logs. It provides scalable storage and querying as the number of devices and data volume grow.

### IoT Observability
The use of metrics, logs, and events to monitor the state and behavior of IoT devices and the services that operate them, helping teams maintain reliability and diagnose performance problems.

### Interoperability
The ability of systems to exchange data through compatible interfaces. GreptimeDB supports SQL interfaces and selected APIs from InfluxDB, OpenTelemetry, Prometheus, Elasticsearch, and Loki. Each compatibility layer has its own documented scope.

---

## J

### JSON2
[`JSON2`](/user-guide/logs/json2.md) is a Beta column type for logs and other semi-structured data. It stores JSON subpaths in a structured columnar form and supports dot-path access, `json_get`, and optional type hints. JSON2 currently requires an append-only table.

---

<AnchorAlias id="l-1" />

## L

### Log Aggregation
Perform calculations on a set of logs to generate a single summary statistic for analysis and troubleshooting. For example, SUM, COUNT, etc.

### Logical and Physical Tables
A logical table is the table users create and query. A physical table is the internal storage table that holds its data. Mito Engine normally maps a logical table to its own physical storage, while Metric Engine can map many logical metric tables to shared physical tables. Sharing a physical table does not merge their logical schemas or query interfaces.

### Log Management
The process of collecting, storing, querying, and visualizing log data to support performance analysis and security investigations.

### LSM-Tree (Log-Structured Merge Tree)
A data structure used by GreptimeDB's storage engine that optimizes write performance by initially writing data to a log and periodically merging these logs into sorted structures. This design is particularly effective for time-series workloads with high write throughput.

---

<AnchorAlias id="m-1" />

## M

### Memory Leak
A type of software bug where a program fails to release unused memory, causing a gradual decrease in available memory and potential system instability over time.

### Metasrv
The metadata management service in GreptimeDB's distributed architecture that maintains cluster state, table schemas, and region distribution information. Metasrv coordinates cluster operations, manages table creation and modifications, handles region assignments and migrations, and ensures metadata consistency across the cluster. It acts as the central control plane for cluster management and serves as the source of truth for all metadata operations.

### Metric Engine
GreptimeDB's storage engine for metrics workloads with many logical tables. It maps logical tables to shared physical wide tables so that they can reuse columns and metadata, reducing storage overhead and improving columnar compression and query efficiency. Metric Engine uses Mito Engine for physical storage.

### Mito Engine
The default storage engine in GreptimeDB. Mito uses an LSM-tree design with WAL, memtables, immutable SST files, and compaction. It supports local and object-storage providers and can use local cache for remote data.

---

## O

### Observability
A measure of how well a system's internal state can be inferred from its outputs. Metrics, logs, traces, and events provide evidence for monitoring and debugging.

### OpenTelemetry
An open-source framework with APIs, SDKs, and protocols for collecting and exporting metrics, logs, and traces. GreptimeDB accepts these signals through OTLP/HTTP.

---

<AnchorAlias id="p-1" />

## P

### Pipeline
A GreptimeDB configuration that parses and transforms incoming data before storage. Processors parse or modify fields, the transform section maps fields to table columns and types, and a dispatcher can select a pipeline based on values in an incoming record. Pipelines support timestamp parsing, regular-expression matching, field extraction, and type conversion so that observability data can be stored in a structure that supports efficient queries.

### Primary Key
One or more Tag columns that identify a series or record group. In a table that uses deduplication, the primary key and time index identify rows that are merged according to the table's merge mode. It is not a general relational uniqueness constraint: append-only tables can omit the primary key and can retain repeated keys and timestamps as separate rows.

### PromQL (Prometheus Query Language)
The query language used by Prometheus for time-series data. GreptimeDB provides near 100% PromQL compatibility, including support for existing Prometheus dashboards and alerting rules. See the [documented limitations and compatibility list](/user-guide/query-data/promql.md#limitations).

---

## R

### Read Replica
An Enterprise feature that adds read-only Follower Regions to a table to scale read workloads and reduce query load on Leader Regions. Leader and Follower Regions share SST files in object storage; the leader synchronizes SST metadata, and followers fetch unflushed data from the leader when serving current reads. Datanode groups can place leaders and followers on different nodes to isolate read and write workloads, improve query response time, support geographically distributed access, and improve read availability. See [Read Replicas](/enterprise/read-replicas/overview.md).

### Region
A fundamental unit of data distribution in GreptimeDB's architecture. Regions contain a subset of table data and can be distributed across different nodes in a cluster. Each region manages its own storage, indexing, and query processing, enabling horizontal scalability and fault tolerance.

### Repartition
The process of adjusting table partition boundaries after creation by merging existing partitions and splitting them with new rules. Repartition is used to better match current data distribution, relieve hotspots, and reduce small cold regions.

### Rust
A systems programming language with static memory-safety guarantees. GreptimeDB is implemented in Rust.

---

## S

### Scalability
The ability of a system to handle more data or work by adding resources to existing nodes or by adding nodes. Scaling does not remove the need to plan partitioning, cache, query concurrency, and workload distribution.

### SQL (Structured Query Language)
A standardized language for defining, managing, and querying relational data. GreptimeDB supports SQL for metrics, logs, traces, and event data.

### Stream Processing
The continuous, real-time processing of data streams as they arrive. GreptimeDB's Flow Engine provides continuous aggregation through batching mode; its original streaming mode is deprecated and is not recommended for new workloads.

---

<AnchorAlias id="t-1" />

## T

### Table Engine
A table engine controls how table data is written, organized, compacted, and read. Mito Engine is the general-purpose engine for time-indexed tables. Metric Engine is built on Mito Engine and is optimized for large numbers of logical metric tables.

### Table Sharding
The technique of splitting a large table into multiple smaller partitions. In GreptimeDB, table sharding helps distribute load across regions and improve throughput for hot or large tables.

### Tag
A column role used to identify a time series. Rows with the same Tag values belong to the same series. Tags commonly store dimensions such as host names, service names, or device IDs and are declared as `PRIMARY KEY` columns.

### Time Index
A special timestamp column in GreptimeDB tables that serves as the primary time dimension for time-series data. Every GreptimeDB table requires exactly one Time Index column to organize data chronologically, enable time-based queries, and support efficient time-series operations like downsampling and time-window aggregations.

### Time Series Database
A specialized database designed to handle time-series data, which consists of sequences of data points indexed by timestamps. GreptimeDB supports time-series workloads as part of a broader model for metrics, logs, traces, and event data.

### Trigger
An Enterprise feature that evaluates SQL rules at configured intervals and sends webhook notifications when their conditions match. Trigger supports Alertmanager-compatible labels and annotations.

---

## U

### Unified Analysis
Analysis across signal types through shared query tools. GreptimeDB supports SQL across metrics, logs, traces, and event tables, and PromQL for metrics.

### Unified Observability
A database architecture that handles metrics, logs, traces, and events through shared data-model concepts, storage infrastructure, and query tools. GreptimeDB applies common Tag, Timestamp, and Field semantics across these signals while allowing them to remain in separate tables. Wide events are an optional modeling approach within this foundation.

---

## V

### Vector Processing
A query-execution technique that processes batches of values rather than one value at a time. GreptimeDB's query engine uses vectorized execution and can use SIMD instructions for supported operations.

### Vehicle Data Collection
The process of collecting vehicle data such as sensor readings, GPS locations, and diagnostics.

### Vehicle-Cloud Integrated TSDB
A time-series database deployment in which vehicle or edge systems collect data and a cloud service stores and queries the aggregated data. This model supports efficient storage and real-time analysis for connected-vehicle applications.

---

## W

### WAL (Write-Ahead Log)
A logging mechanism used by GreptimeDB to ensure data durability and consistency. WAL records all data changes before they are applied to the main storage, enabling recovery in case of system failures. GreptimeDB supports flexible WAL options including local disk storage or distributed services like Kafka.

### Wide Events
A structured telemetry record with many fields describing one operation or business event. A wide event can include high-cardinality values such as user IDs, session IDs, trace IDs, business attributes, and request metadata. It is commonly associated with the Observability 2.0 approach, but does not replace native metrics, logs, or traces. GreptimeDB can store wide events as timestamped data alongside those signals.

---
