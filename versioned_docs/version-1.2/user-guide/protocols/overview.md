---
keywords: [protocols, HTTP API, MySQL, PostgreSQL, gRPC, InfluxDB line protocol, OpenTelemetry]
description: The wire protocols GreptimeDB speaks, for both writing and querying, and where each protocol's ingestion guide lives.
---

import DocCardList from '@theme/DocCardList';

# Protocols

GreptimeDB speaks several wire protocols. They fall into two groups.

**Connection protocols** carry both writes and queries: the [HTTP API](http.md), [MySQL](mysql.md), [PostgreSQL](postgresql.md), and [gRPC](grpc.md). These pages document endpoints, authentication, and protocol-specific options.

**Ingestion protocols** accept writes from a system that already speaks them — InfluxDB line protocol, OpenTelemetry, Loki, Elasticsearch, Splunk, and OpenTSDB. The pages here cover protocol-level details; the configuration for each source is in [Ingest Data](/user-guide/ingest-data/overview.md).

<DocCardList />
