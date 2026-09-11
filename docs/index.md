---
title: "GreptimeDB"
keywords: [observability database, open source observability database, observability data, observability tools, cloud native database, data observability, observability platform, edge database, IoT edge computing, edge cloud computing, log management, log aggregation, high cardinality, sql query examples, opentelemetry collector, GreptimeDB]
description: Documentation for GreptimeDB, an open-source observability database for metrics, logs, traces, and wide events, with entry points for getting started, the user guide, AI agents, and the SQL reference.
---

import AgentOnboarding from '@site/src/components/AgentOnboarding';

# GreptimeDB Documentation

**GreptimeDB** is an open-source observability database that stores metrics, logs, and traces in one engine. Run it as the single OpenTelemetry backend in place of Prometheus, Loki, and Elasticsearch, keep the data on object storage, and query all of it with [SQL](/user-guide/query-data/sql.md) and [PromQL](/user-guide/query-data/promql.md).

<HomeCards>

- **[Getting Started](/getting-started/overview.md)**

  Install GreptimeDB, write your first rows, and run your first query.

- **[User Guide](/user-guide/overview.md)**

  Ingestion protocols, queries, pipelines, flows, and running GreptimeDB in production.

- **[For AI Agents](/faq-and-others/vibecoding.md)**

  Run GreptimeDB from a coding agent, with no custom integration.

- **[Reference](/reference/sql/overview.md)**

  SQL, functions, configuration, command lines, and HTTP endpoints.

</HomeCards>

## Ask about GreptimeDB

Answers come from this documentation, with links to the pages they are based on.

<AskAI />

## Why GreptimeDB

**Replace three systems with one.** Metrics, logs, and traces go into one columnar engine with native OpenTelemetry support, instead of a separate store, query language, and operational overhead for each signal.

**Pay object-storage prices.** S3, Azure Blob, and GCS are the primary store, and compute scales independently of them. Columnar storage and observability-tuned compression cut cost by up to 50x — [OceanBase Cloud](/user-guide/concepts/why-greptimedb.md#what-production-users-report) keeps 300 TB of logs and audit data on GreptimeDB and reports 60%+ lower storage cost after moving from Loki.

**Migrate without rewriting queries.** [PromQL](/user-guide/query-data/promql.md), [Prometheus remote write](/user-guide/ingest-data/for-observability/prometheus.md), [Jaeger](/user-guide/query-data/jaeger.md), [MySQL](/user-guide/protocols/mysql.md), and [PostgreSQL](/user-guide/protocols/postgresql.md) are supported directly. Existing collectors and [Grafana](/user-guide/integrations/grafana.md) dashboards continue to work.

**Give agents one query interface.** In [Agent RCA Bench](https://rca-bench.greptime.com/), six models investigated the same 14 incidents on GreptimeDB and on Prometheus, Loki, and Tempo: 40% fewer wrong diagnoses, 48% fewer input tokens read, about 45% lower cost to run.

More in [Why GreptimeDB](/user-guide/concepts/why-greptimedb.md) and [Observability 2.0 and wide events](/user-guide/concepts/observability-2.md).

## Build with AI agents

The quickstart guide is hosted as a fetchable markdown file. A coding agent reads it at runtime, with no installation required.

<AgentOnboarding />

- **[MCP Server](/user-guide/integrations/mcp.md)** — read-only access for agents: list tables, run SQL, TQL, and range queries.
- **[Skills](/faq-and-others/vibecoding.md)** — pipelines, flows, triggers, table design, and performance diagnosis, in the [Agent Skills](https://agentskills.io/) format.
- **[Semantic layer](/user-guide/semantic-layer/overview.md)** — what each table means and how the entities behind it relate, queried with ordinary SQL.
- **[llms.txt](https://docs.greptime.com/llms.txt)** — a structured index of the whole site; append `.md` to any page URL for its raw markdown.

## Keep exploring

- [Tutorials](/tutorials/k8s-metrics-monitor.md): end-to-end walkthroughs, such as monitoring a Kubernetes cluster.
- [GreptimeDB Enterprise](/enterprise/overview.md): read replicas, workload isolation, RBAC, audit logging, and disaster recovery.
- [Contributor Guide](/contributor-guide/overview.md): internals, for anyone working on GreptimeDB itself.
- [Roadmap](https://greptime.com/blogs/2026-02-11-greptimedb-roadmap-2026): the project's direction and planned work.
- [Release Notes](/release-notes): every released version.
- [FAQ](/faq-and-others/faq.md): common questions about deployment, ingestion, and queries.
