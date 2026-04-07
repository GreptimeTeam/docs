---
keywords: [observability database, open source observability database, observability data, observability tools, cloud native database, data observability, observability platform, edge database, IoT edge computing, edge cloud computing, log management, log aggregation, high cardinality, sql query examples, opentelemetry collector, GreptimeDB]
description: Introduction to GreptimeDB, an open-source observability database for metrics, logs, and traces, with links to getting started, user guide, contributor guide, and more.
---
# Introduction

<p align="center">
    <img src="/logo-greptimedb.png" alt="GreptimeDB Logo" width="400"/>
</p>

**GreptimeDB** is an open-source observability database that handles metrics, logs, and traces in one engine. Use it as the single OpenTelemetry backend — replacing Prometheus, Loki, and Elasticsearch with one database built on object storage. Query with [SQL](/user-guide/query-data/sql.md) and [PromQL](/user-guide/query-data/promql.md), scale without pain, cut costs up to 50x.

## Why GreptimeDB

**Replace three systems with one.** Most teams run Prometheus for metrics, Loki or ELK for logs, and Elasticsearch or Tempo for traces — three systems, three query languages, three sets of operational overhead. GreptimeDB unifies all three in a single engine with native OpenTelemetry support.

**Cut costs up to 50x.** Object storage (S3, Azure Blob, GCS) as primary data store with compute-storage separation. Compute nodes scale independently. Written in Rust with columnar storage and advanced compression for maximum efficiency.

**Drop-in compatible.** [PromQL](/user-guide/query-data/promql.md), [Prometheus remote write](/user-guide/ingest-data/for-observability/prometheus.md), [Jaeger](/user-guide/query-data/jaeger.md), [MySQL](/user-guide/protocols/mysql.md), [PostgreSQL](/user-guide/protocols/postgresql.md) protocols — migrate without rewriting queries. [SQL](/user-guide/query-data/sql.md) + [PromQL](/user-guide/query-data/promql.md) dual query capability means one database replaces your metrics store + data warehouse combo.

Learn more in [Why GreptimeDB](/user-guide/concepts/why-greptimedb.md) and [Observability 2.0](/user-guide/concepts/observability-2.md).

Before getting started, please read the following documents that include instructions for setting up, fundamental concepts, architectural designs, and tutorials:

- [Getting Started][1]: Provides an introduction to GreptimeDB for those who are new to it, including installation and database operations.
- [User Guide][2]: For application developers to use GreptimeDB or build custom integration.
- [GreptimeCloud][6]: For users of GreptimeCloud to get started.
- [Contributor Guide][3]: For contributors interested in learning more about the technical details and enhancing GreptimeDB.
- [Roadmap][7]: The latest GreptimeDB roadmap.
- [Release Notes][4]: Presents all historical version release notes.
- [FAQ][5]: Provides answers to the most frequently asked questions.

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./contributor-guide/overview.md
[4]: /release-notes
[5]: ./faq-and-others/faq.md
[6]: ./greptimecloud/overview.md
[7]: https://greptime.com/blogs/2026-02-11-greptimedb-roadmap-2026
