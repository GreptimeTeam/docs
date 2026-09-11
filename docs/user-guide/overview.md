---
keywords: [user guide, data ingestion, querying, flow computation, deployment, migration, protocols]
description: Entry point for running GreptimeDB — ingesting data, querying it, processing it, and operating a deployment.
---

# User Guide

This guide covers running GreptimeDB: getting data in, querying it, processing it, and operating a deployment. For the data model and architecture behind these tasks, see [Concepts](./concepts/overview.md). To install GreptimeDB and run a first query, start with the [Quick Start](/getting-started/quick-start.md).

<AnchorAlias id="ingesting-data-based-on-your-use-case" />

<AnchorAlias id="for-observability-scenarios" />
<AnchorAlias id="for-iot-and-edge-computing-scenarios" />

## Ingest Data

[Ingest Data](./ingest-data/overview.md) maps each data source to the protocol it writes with and the guide that covers it. On most paths, tables and columns are created as data arrives; [SQL, Flink, and Spark](./ingest-data/overview.md#automatic-schema-generation) write into an existing table.

Two signals have their own guides because storing them involves more than a write protocol:

- [Logs](./logs/overview.md) — parse and transform text logs with pipelines before they are stored.
- [Traces](./traces/overview.md) — store OTLP traces and query them with SQL or the Jaeger-compatible API.

<AnchorAlias id="querying-data-for-insights" />

<AnchorAlias id="sql-support" />
<AnchorAlias id="prometheus-query-language-promql" />

## Query Data

- [SQL](./query-data/sql.md) — queries across metrics, logs, and traces, including range queries, CTEs, joins, and views.
- [PromQL](./query-data/promql.md) — metric queries through the Prometheus HTTP API, or `TQL` inside SQL.
- [Jaeger API](./query-data/jaeger.md) — trace queries from Jaeger UI or Grafana.

The [query overview](./query-data/overview.md) compares the interfaces.

<AnchorAlias id="accelerating-queries-with-indexes" />

<AnchorAlias id="flow-computation" />

## Process and Describe Data

- [Flow](./flow-computation/overview.md) — continuous aggregation from incoming rows into sink tables.
- [Data Index](./manage-data/data-index.md) — inverted, skipping, and full-text indexes, and when each one pays off.
- [Update, Delete, and TTL](./manage-data/overview.md) — updating by overwrite, deleting, and expiring data.
- [Semantic Layer](./semantic-layer/overview.md) — metadata recording what each table holds and which entities its rows describe.
- [Vector Storage](./vectors/vector-type.md) — the vector data type and similarity search.

<AnchorAlias id="migrating-to-greptimedb-from-other-databases" />
<AnchorAlias id="administering-and-deploying-greptimedb" />

## Deploy and Operate

- [Deployments & Administration](./deployments-administration/overview.md) — Kubernetes and bare-metal deployment, capacity planning, WAL modes, monitoring, disaster recovery, and Region operations.
- [Migrate to GreptimeDB](./migrate-to-greptimedb/overview.md) — protocol, query, dashboard, and historical-data changes when moving from Prometheus, InfluxDB, Loki, Elasticsearch, or MySQL.
- [Time Zone](./timezone.md) — how the session time zone affects ingestion and query results.

## Connect Other Tools

- [Protocols](./protocols/overview.md) — the wire protocols GreptimeDB speaks, and the boundaries of each one.
- [Integrations](./integrations/overview.md) — Grafana, Superset, Metabase, Flink, Spark, the MCP Server, and other tools that connect to GreptimeDB.
