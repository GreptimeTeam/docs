---
keywords: [log service, quick start, pipeline configuration, manage pipelines, query logs]
description: Comprehensive guide to GreptimeDB's log management capabilities, covering log collection architecture, pipeline processing, integration with popular collectors like Vector and Kafka, and advanced querying with full-text search.
---

# Logs

GreptimeDB provides a comprehensive log management solution designed for modern observability needs.
It offers seamless integration with popular log collectors,
flexible pipeline processing,
and powerful querying capabilities, including full-text search.

Key features include:

- **Unified Storage**: Store logs alongside metrics and traces in a single database
- **Pipeline Processing**: Transform and enrich raw logs with customizable pipelines, supporting various log collectors and formats
- **Advanced Querying**: SQL-based analysis with full-text search capabilities
- **Real-time Processing**: Process and query logs in real-time for monitoring and alerting


## Log Collection Flow

![log-collection-flow](/log-collection-flow.drawio.svg)

The diagram above illustrates the comprehensive log collection architecture,
which follows a structured four-stage process: Log Sources, Log Collectors, Pipeline Processing, and Storage in GreptimeDB.

### Log Sources

Log sources represent the foundational layer where log data originates within your infrastructure.
GreptimeDB supports ingestion from diverse source types to accommodate comprehensive observability requirements:

- **Applications**: Application-level logs from microservices architectures, web applications, mobile applications, and custom software components
- **IoT Devices**: Device logs, sensor event logs, and operational status logs from Internet of Things ecosystems
- **Infrastructure**: Cloud platform logs, container orchestration logs (Kubernetes, Docker), load balancer logs, and network infrastructure component logs
- **System Components**: Operating system logs, kernel events, system daemon logs, and hardware monitoring logs
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
- **Index**: Configure indexes to optimize query performance and enable efficient searching, including full-text indexes, time indexes, and more

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

## Integrate with Log Collectors

GreptimeDB integrates seamlessly with various log collectors to provide a comprehensive logging solution. The integration process follows these key steps:

1. **Select Appropriate Log Collectors**: Choose collectors based on your infrastructure requirements, data sources, and performance needs
2. **Analyze Output Format**: Understand the log format and structure produced by your chosen collector
3. **Configure Pipeline**: Create and configure pipelines in GreptimeDB to parse, transform, and enrich the incoming log data
4. **Store and Query**: Efficiently store processed logs in GreptimeDB for real-time analysis and monitoring

To successfully integrate your log collector with GreptimeDB, you'll need to:
- First understand how pipelines work in GreptimeDB
- Then configure the sink settings in your log collector to send data to GreptimeDB

Please refer to the following guides for detailed instructions on integrating GreptimeDB with log collectors:

- [Vector](/user-guide/ingest-data/for-observability/vector.md#using-greptimedb_logs-sink-recommended)
- [Kafka](/user-guide/ingest-data/for-observability/kafka.md#logs)
- [Fluent Bit](/user-guide/ingest-data/for-observability/fluent-bit.md#http)
- [OpenTelemetry Collector](/user-guide/ingest-data/for-observability/otel-collector.md)
- [Loki](/user-guide/ingest-data/for-observability/loki.md#using-pipeline-with-loki-push-api)

## Learn More About Pipelines

- [Using Custom Pipelines](./use-custom-pipelines.md): Explains how to create and use custom pipelines for log ingestion.
- [Managing Pipelines](./manage-pipelines.md): Explains how to create and delete pipelines.

## Query Logs

- [Full-Text Search](./fulltext-search.md): Guide on using GreptimeDB's query language for effective searching and analysis of log data.

## Reference

- [Built-in Pipelines](/reference/pipeline/built-in-pipelines.md): Lists and describes the details of the built-in pipelines provided by GreptimeDB for log ingestion.
- [APIs for Writing Logs](/reference/pipeline/write-log-api.md): Describes the HTTP API for writing logs to GreptimeDB.
- [Pipeline Configuration](/reference/pipeline/pipeline-config.md): Provides in-depth information on each specific configuration of pipelines in GreptimeDB.

