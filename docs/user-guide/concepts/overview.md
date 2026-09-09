---
title: "GreptimeDB Concepts Overview"
keywords: [GreptimeDB, features, data model, architecture, storage locations, key concepts]
description: Provides an overview of GreptimeDB, including its data model, architecture, storage locations, and core concepts.
---

# Concepts

GreptimeDB is the open-source observability database. It uses one columnar engine to process metrics, logs, and traces, and supports scalable deployments backed by object storage. The signals share Tag, Timestamp, and Field column semantics, but can remain in separate tables with different schemas and retention policies.

**Start here:**
- [Why GreptimeDB](./why-greptimedb.md) — Product scope, unified processing, scaling, protocol boundaries, and deployment options
- [Data Model](./data-model.md) — Shared Tag, Timestamp, and Field semantics for metrics, logs, traces, and event data
- [Architecture](./architecture.md) — Standalone and distributed deployments, compute-storage separation, and component responsibilities

**Deep dives:**
- [Observability 2.0 and wide events](./observability-2.md) — The role and trade-offs of wide events alongside native signals
- [Semantic Layer](./semantic-layer.md) — Optional metadata describing what each table represents and which entities and relationships the telemetry describes
- [Storage Location](./storage-location.md) — Local storage, object storage, and per-table storage providers
- [Key Concepts](./key-concepts.md) — Tables, Regions, time index, data types, views, and Flow
- [Common Questions](./features-that-you-concern.md) — FAQ on updates, deletion, TTL, compression, high cardinality, and other technical boundaries

## Further Reading

- [Observability 2.0 and the Database for It](https://greptime.com/blogs/2025-04-25-greptimedb-observability2-new-database) — An earlier description of the wide-event approach
- [Unifying Logs and Metrics](https://greptime.com/blogs/2024-06-25-logs-and-metrics)
- [GreptimeDB Storage Engine Design](https://greptime.com/blogs/2022-12-21-storage-engine-design)
