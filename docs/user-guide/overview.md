---
keywords: [metrics, logs, observability, SQL support, range queries, flow computation, data model, protocols]
description: Learn how to use GreptimeDB according to your use case, including data ingestion, querying, and administration.
---

# User Guide

Welcome to the user guide for GreptimeDB.

GreptimeDB is the unified observability database for metrics, logs, and traces,
providing real-time insights from Edge to Cloud at any scale.

## Understanding GreptimeDB Concepts

Before diving into GreptimeDB,
it is recommended to familiarize yourself with its data model, key concepts, and features.
For a comprehensive overview, 
refer to the [Concepts Documentation](./concepts/overview.md).

## Ingesting Data Based on Your Use Case

GreptimeDB supports [multiple protocols](./protocols/overview.md) and [various integration tools](./integrations/overview.md) to simplify data ingestion tailored to your requirements.

### For Observability Scenarios

If you plan to use GreptimeDB as metrics, logs and traces storage for observability purposes,
see the [Observability Documentation](./ingest-data/for-observability/overview.md).
It explains how to ingest data using tools like Otel-Collector, Vector, Kafka, Prometheus, and the InfluxDB line protocol.

To use GreptimeDB as a log storage solution,
refer to the [Logs Documentation](./logs/overview.md).
It details how to ingest pattern text logs using pipelines.

To use GreptimeDB as a trace storage solution,
refer to the [Traces Documentation](./traces/overview.md).
It explains how to ingest trace data using OpenTelemetry and query it with Jaeger.

### For IoT and Edge Computing Scenarios

For IoT and Edge Computing scenarios,
the [IoT Documentation](./ingest-data/for-iot/overview.md) provides comprehensive guidance on ingesting data from diverse sources.

## Querying Data for Insights

GreptimeDB offers robust interfaces for [querying data](./query-data/overview.md).

### SQL Support

You can use SQL for range queries, aggregations, and more.
For detailed instructions, see the [SQL Query Documentation](./query-data/sql.md). 

### Prometheus Query Language (PromQL)

GreptimeDB supports PromQL for querying data. Refer to the [PromQL Documentation](./query-data/promql.md) for guidance. 

### Flow Computation

For real-time data processing and analysis, GreptimeDB provides [Flow Computation](./flow-computation/overview.md), enabling complex computations on data streams.

## Accelerating Queries with Indexes

Indexes such as inverted indexes, skipping indexes, and full-text indexes can significantly enhance query performance.
Learn more about effectively using these indexes in the [Data Index Documentation](./manage-data/data-index.md).

## Migrating to GreptimeDB from Other Databases

Migrating data from other databases to GreptimeDB is straightforward.
Follow the step-by-step instructions in the [Migration Documentation](./migrate-to-greptimedb/overview.md).

## Administering and Deploying GreptimeDB

When you're ready to deploy GreptimeDB, consult the [Deployment Documentation](./deployments/overview.md) and the [Administration Documentation](./administration/overview.md) for detailed guidance on deployment and management.

