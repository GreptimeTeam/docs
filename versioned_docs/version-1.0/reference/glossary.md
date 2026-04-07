---
keywords: [cloud-native, observability, open-source, time-series database, connected vehicles, IoT, log, metrics, events, rust]
description: The GreptimeDB Glossary provides clear definitions and explanations of core terms and concepts related to GreptimeDB, the cloud-native open source temporal database, covering the areas of metrics, logging, and events processing. Explore the Glossary to gain insight into the innovative features and technical architecture that underpin GreptimeDB.
---

# GreptimeDB Glossary

Welcome to the GreptimeDB Glossary! This resource provides clear definitions and explanations of key terms and concepts associated with GreptimeDB, a cloud-native, open-source time-series database designed for metrics, logs, and events. Explore the glossary to better understand the innovative features and technologies behind GreptimeDB.

---

## A

### Anomaly Detection
The process of identifying data points, events, or observations that deviate significantly from the norm. In time-series data, anomaly detection helps in spotting unusual patterns that may indicate critical incidents.

### Append Only Table
A table type in GreptimeDB optimized for write-heavy workloads where data is only inserted, never updated or deleted. This design significantly improves write and query performance, especially for log analytics and time-series data scenarios.

---

## C

### Cardinality
A measure of the uniqueness of data elements in a database, such as the number of unique values in a column. High cardinality can increase the complexity and storage requirements of a database, especially in time-series data.

### Cloud-Native Design
An architectural approach that utilizes cloud computing frameworks and services to build scalable and resilient applications. GreptimeDB's cloud-native design allows it to scale effortlessly from edge deployments to distributed clusters in the cloud.

### Columnar Storage
A data storage format that stores data tables by columns rather than rows. This format enhances performance for read-heavy operations and is optimized for analytical queries, contributing to GreptimeDB's cost efficiency.

---

## D

### Decoupled Compute and Storage Architecture
An architectural design where computing resources and storage are managed separately. This separation enables independent scaling and resource optimization, leading to improved performance and flexibility in managing workloads.

---

## E

### Edge Database
A database deployed at the edge of a network, close to the data source or user, to minimize latency and optimize data processing in real-time.

### Edge Deployment
The practice of deploying applications or services closer to the data source or end-user to reduce latency and bandwidth usage. GreptimeDB supports edge deployment, allowing for real-time data processing in resource-limited environments.

### Event Management
The practice of collecting, organizing, and analyzing events—including metrics, logs, and traces—to monitor and optimize systems. Event management is a critical aspect of maintaining real-time systems and applications.

---

## D

### Datanode
A core component in GreptimeDB's distributed architecture responsible for data storage and processing. Datanodes handle data ingestion, storage management, query execution on local data, and maintain regions containing actual table data. Multiple datanodes can be deployed across a cluster to provide horizontal scalability, fault tolerance, and distributed data processing capabilities.

---

## F

### Field
A column type in GreptimeDB's data model that contains the actual measurement data or log contents being collected. Fields store the numerical values, text content, or other data indicators that represent the core information in time-series data, complementing Tag and Time Index columns to form the complete data model.

### Frontend
The query processing layer in GreptimeDB's distributed architecture that serves as the entry point for client connections. Frontend nodes handle SQL parsing, query planning, distributed query coordination, and result aggregation. They route queries to appropriate datanodes, manage client sessions, and provide protocol compatibility for various database interfaces including MySQL, PostgreSQL, and GreptimeDB's native protocols.



### Flow Engine
GreptimeDB's real-time stream processing system that enables continuous, incremental computation on streaming data. Flow Engine works like an intelligent materialized view that automatically updates result tables as new data arrives in source tables. It processes data at configurable intervals (default: one second) with minimal computational overhead, making it ideal for ETL processes, downsampling, real-time analytics, and continuous aggregation scenarios.

---

## G

### GreptimeCloud
The fully managed cloud service offering of GreptimeDB that provides serverless, auto-scaling database-as-a-service (DBaaS) capabilities. GreptimeCloud eliminates operational overhead with features like automatic scaling, pay-as-you-go pricing, enterprise-grade security, and seamless cloud-to-edge deployment, making it ideal for organizations seeking a hassle-free observability database solution.

---

## I

### IoT Cloud
A cloud computing platform specifically designed to support Internet of Things (IoT) applications by providing the necessary storage, processing power, and connectivity to manage IoT data at scale.

### IoT Database
A database optimized for handling Internet of Things (IoT) data, which often involves time-series metrics from sensors and devices. GreptimeDB is suitable for IoT use cases, providing scalable and efficient storage and querying for high-frequency data generated by IoT devices.

### IoT Observability
The ability to monitor, analyze, and gain insights into IoT devices and systems through metrics, logs, and events. IoT observability ensures that devices and applications perform reliably and efficiently.

### Interoperability
The ability of different systems, applications, or products to connect and communicate in a coordinated way without effort from the end-user. GreptimeDB supports widely adopted database protocols and APIs, including SQL, InfluxDB, OpenTelemetry, Prometheus, Elasticsearch, and Loki, ensuring seamless integration.

---

## L

### Log Aggregation
Perform calculations on a set of logs to generate a single summary statistic for analysis and troubleshooting. For example, SUM, COUNT, etc.

### Log Management
The overall process of handling log data, including collection, storage, analysis, and visualization, to ensure system performance and security.

---

## M

### Memory Leak
A type of software bug where a program fails to release unused memory, causing a gradual decrease in available memory and potential system instability over time.

### Metric Engine
A specialized storage engine in GreptimeDB designed for efficient processing of metrics data, particularly scenarios with thousands of small tables common in observability workloads. The Metric Engine uses synthetic wide physical tables to store data from numerous logical tables, enabling efficient column and metadata reuse, reducing storage overhead, and enhancing columnar compression. Built on top of the Mito Engine for robust storage capabilities.

### Mito Engine
The default storage engine in GreptimeDB based on Log-Structured Merge Tree (LSM-Tree) architecture, optimized for time-series workloads. Mito features Write-Ahead Logging (WAL), memory tables, and Time Window Compaction Strategy (TWCS) to handle high-throughput writes while maintaining excellent query performance. It integrates natively with object storage solutions (S3, GCS, Azure Blob) and implements tiered caching for optimal storage costs and access speeds.

---

## L

### LSM-Tree (Log-Structured Merge Tree)
A data structure used by GreptimeDB's storage engine that optimizes write performance by initially writing data to a log and periodically merging these logs into sorted structures. This design is particularly effective for time-series workloads with high write throughput.

---

## M

### Metasrv
The metadata management service in GreptimeDB's distributed architecture that maintains cluster state, table schemas, and region distribution information. Metasrv coordinates cluster operations, manages table creation and modifications, handles region assignments and migrations, and ensures metadata consistency across the cluster. It acts as the central control plane for cluster management and serves as the source of truth for all metadata operations.

---

## O

### Observability
A measure of how well the internal states of a system can be inferred based on its external outputs. Observability tools, such as GreptimeDB, help engineers monitor, debug, and gain insights into system performance by analyzing metrics, logs, and events.

### OpenTelemetry
An open-source observability framework for cloud-native software. OpenTelemetry provides APIs and SDKs for collecting, processing, and exporting telemetry data such as traces, metrics, and logs. GreptimeDB integrates with OpenTelemetry to enhance data observability.

---

## P

### PromQL (Prometheus Query Language)
A powerful and flexible query language used to retrieve and manipulate time-series data stored in Prometheus. GreptimeDB supports PromQL with near 100% compatibility, enabling users to perform complex queries on their time-series data and use existing Prometheus dashboards and alerting rules.

---

## P

### Pipeline
A powerful data parsing and transformation mechanism in GreptimeDB designed for processing incoming data in real-time. Pipeline consists of configurable processors that pre-process raw data, dispatchers that route data to different pipelines, and transform rules that convert data types and define table structures. It supports multiple input formats and data sources (including logs, Prometheus metrics, and other observability data) and provides extensive processing capabilities including timestamp parsing, regex matching, field extraction, and data type conversion, enabling structured storage and efficient querying of observability data.

---

## R

### Read Replica
An enterprise feature in GreptimeDB that creates additional read-only instances of data to enhance query performance and scalability. Read replicas distribute read workloads across multiple instances, reducing load on primary databases while providing faster query responses. This feature supports geographic distribution of data access points, improves high availability for read operations, and enables efficient scaling of read-intensive workloads in enterprise environments.

### Region
A fundamental unit of data distribution in GreptimeDB's architecture. Regions contain a subset of table data and can be distributed across different nodes in a cluster. Each region manages its own storage, indexing, and query processing, enabling horizontal scalability and fault tolerance.

### Rust
A modern programming language known for its performance and safety features, particularly in system-level programming. GreptimeDB is built with Rust, contributing to its superior performance and reliability.

---

## S

### Scalability
The capability of a database system to handle growing volumes of data and increasing query loads efficiently by scaling resources either vertically (adding more power to a single server) or horizontally (adding more servers to a cluster). Scalability ensures that the system can accommodate future growth without sacrificing performance or reliability, making it crucial for modern data-intensive applications.

### SQL (Structured Query Language)
A standardized programming language used for managing and manipulating relational databases. GreptimeDB supports SQL, allowing users to query metrics, logs, and events efficiently.

### Stream Processing
The continuous, real-time processing of data streams as they arrive. In GreptimeDB, stream processing is implemented through the Flow Engine, which performs incremental computation on streaming time-series data. This enables instant filtering, computing, and aggregation of metrics, logs, and events, providing actionable insights with minimal latency.

---

## T

### Tag
A column type in GreptimeDB's data model that uniquely identifies time-series data. Rows with the same Tag values belong to the same time-series, making Tags essential for organizing and querying observability data. Tags are typically used to store metadata like host names, service names, or device IDs, and are specified as PRIMARY KEY columns in table schemas.

### Time Index
A special timestamp column in GreptimeDB tables that serves as the primary time dimension for time-series data. Every GreptimeDB table requires exactly one Time Index column to organize data chronologically, enable time-based queries, and support efficient time-series operations like downsampling and time-window aggregations.

### Time Series Database
A specialized database designed to handle time-series data, which consists of sequences of data points indexed by timestamps. GreptimeDB is a cloud-native time-series database optimized for analyzing and querying metrics, logs, and events.

---

## T

### Trigger
An enterprise-grade monitoring and alerting feature in GreptimeDB that enables automated evaluation of time-series data conditions. Triggers continuously monitor data in tables at specified intervals, execute SQL-based rules to check for predefined thresholds or conditions, and send notifications via webhooks when criteria are met. This feature integrates with alerting systems like Alertmanager and supports custom labels and annotations, making it ideal for real-time system monitoring, performance alerting, and automated incident response.

---

## U

### Unified Analysis
The integration of various data types and sources into a single platform for analysis. GreptimeDB provides unified analysis by allowing users to query metrics, logs, and events using SQL and PromQL, simplifying data analytics workflows.

### Unified Observability
A database architecture approach that consolidates metrics, logs, and traces into a single system, eliminating data silos and reducing operational complexity. GreptimeDB implements unified observability by treating all telemetry data types as wide events with timestamps, enabling cross-signal correlation, simplified data pipelines, and cost-effective observability infrastructure.

---

## W

### WAL (Write-Ahead Log)
A logging mechanism used by GreptimeDB to ensure data durability and consistency. WAL records all data changes before they are applied to the main storage, enabling recovery in case of system failures. GreptimeDB supports flexible WAL options including local disk storage or distributed services like Kafka.

### Wide Events
A foundational concept in Observability 2.0 that represents context-rich, high-dimensional telemetry data combining metrics, logs, and traces into single comprehensive events. Wide Events capture extensive contextual information per service interaction, including high-cardinality fields (user IDs, session IDs), business logic data, infrastructure details, and request metadata. GreptimeDB natively supports Wide Events as timestamped observability data, enabling complex multi-dimensional querying and solving "unknown unknowns" in system behavior analysis.

---

## V

### Vector Processing
A high-performance data processing technique used by GreptimeDB's query engine that operates on data in batches (vectors) rather than individual values. Leverages SIMD instructions for acceleration, significantly improving query performance on large-scale time-series datasets.

### Vehicle Data Collection
The process of gathering data generated by vehicles, such as sensor readings, GPS locations, and diagnostics, for analysis and insights. Vehicle data collection is a key component of modern IoT ecosystems.

### Vehicle-Cloud Integrated TSDB
A time-series database designed to work seamlessly with vehicle data and cloud-based systems, enabling efficient data storage, querying, and real-time analysis for connected vehicle applications.

---

*Note: This glossary is a work in progress and will be updated as new features and concepts emerge within the GreptimeDB ecosystem.*