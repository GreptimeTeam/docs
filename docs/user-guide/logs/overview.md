---
keywords: [log service, quick start, pipeline configuration, manage pipelines, query logs]
description: Provides links to various guides on using GreptimeDB's log service, including quick start, pipeline configuration, managing pipelines, writing logs, querying logs, and full-text index configuration.
---

# Logs

In this chapter, we will walk-through GreptimeDB's features for logs support,
from basic ingestion/query, to advanced transformation, full-text index topics.

## Log Collection Flow

![log-collection-flow](/log-collection-flow.drawio.svg)

The diagram above illustrates the comprehensive log collection architecture,
which follows a structured four-stage process: Log Sources, Log Collectors, Pipeline Processing, and Storage in GreptimeDB.
This flexible architecture allows you to choose the most appropriate collectors and configure pipelines that match your specific log processing needs.

### Log Sources

Log sources represent the foundational layer where log data originates within your infrastructure.
GreptimeDB supports ingestion from diverse source types to accommodate comprehensive observability requirements:

- **Applications**: Application-level logs from microservices architectures, web applications, mobile applications, and custom software components
- **IoT Devices**: Telemetry data, sensor readings, and operational metrics from Internet of Things ecosystems
- **Infrastructure**: Cloud platform logs, container orchestration systems (Kubernetes, Docker), load balancers, and network infrastructure components
- **System Components**: Operating system logs, kernel events, system daemons, and hardware monitoring data
- **Custom Sources**: Any other log sources specific to your environment or applications

### Log Collectors

Log collectors are responsible for efficiently gathering log data from diverse sources and reliably forwarding it to the storage backend. GreptimeDB seamlessly integrates with industry-standard log collectors,
including Vector, Fluent Bit, Apache Kafka, OpenTelemetry Collector and more.

GreptimeDB functions as a powerful sink backend for these collectors,
providing robust data ingestion capabilities.
During the ingestion process,
GreptimeDB's pipeline system enables real-time transformation and enrichment of log data,
ensuring optimal structure and quality before storage.

### Pipeline Processing

GreptimeDB's pipeline mechanism transforms raw logs into structured, queryable data:

- **Parse**: Extract structured data from unstructured log messages
- **Transform**: Enrich logs with additional context and metadata
- **Validate**: Ensure data quality and consistency
- **Index**: Configure full-text search capabilities for efficient querying

### Storage in GreptimeDB

After processing through the pipeline,
the logs are stored in GreptimeDB enabling flexible analysis and visualization:

- **SQL Querying**: Use familiar SQL syntax to analyze log data
- **Time-based Analysis**: Leverage time-series capabilities for temporal analysis
- **Full-text Search**: Perform advanced text searches across log messages
- **Real-time Analytics**: Query logs in real-time for monitoring and alerting

## Quick Start

You can quickly get started by using the built-in `greptime_identity` pipeline for log ingestion.
For more information, please refer to the [Quick Start](./quick-start.md) guide.

## Integrate with popular Log Collectors

GreptimeDB integrates seamlessly with various log collectors to provide a comprehensive logging solution. The integration process follows these key steps:

1. **Select Appropriate Log Collectors**: Choose collectors based on your infrastructure requirements, data sources, and performance needs
2. **Analyze Output Format**: Understand the log format and structure produced by your chosen collector
3. **Configure Pipeline**: Create and configure pipelines in GreptimeDB to parse, transform, and enrich the incoming log data
4. **Store and Query**: Efficiently store processed logs in GreptimeDB for real-time analysis and monitoring

To successfully integrate your log collector with GreptimeDB, you'll need to:
- First understand how pipelines work in GreptimeDB
- Then configure the sink settings in your log collector to send data to GreptimeDB

Please refer to the following guides for detailed instructions on integrating GreptimeDB with popular log collectors:

- [Vector](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended)
- [Kafka](/user-guide/ingest-data/for-observability/kafka.md#logs)
- [Fluent Bit](/user-guide/ingest-data/for-observability/fluent-bit.md#http)
- [OpenTelemetry Collector](/user-guide/ingest-data/for-observability/otel-collector.md)
- [Loki](/user-guide/ingest-data/for-observability/loki.md#using-pipeline-with-loki-push-api)

## How to Configure Pipeline

- [Quick Start](./quick-start.md): Provides an introduction on how to quickly get started with GreptimeDB log service.
- [Pipeline Configuration](./pipeline-config.md): Provides in-depth information on each specific configuration of pipelines in GreptimeDB.
- [Managing Pipelines](./manage-pipelines.md): Explains how to create and delete pipelines.
- [Writing Logs with Pipelines](./write-logs.md): Provides detailed instructions on efficiently writing log data by leveraging the pipeline mechanism.

## Querying Logs

- [Query Logs](./query-logs.md): Describes how to query logs using the GreptimeDB SQL interface.
- [Full-Text Index Configuration](./fulltext-index-config.md): Describes how to configure full-text index in GreptimeDB.
