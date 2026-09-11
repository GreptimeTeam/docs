---
keywords: [query data, SQL, PromQL, Jaeger, view, CTE, SQL drivers, external data]
description: The query interfaces GreptimeDB exposes — SQL, PromQL, and the Jaeger-compatible API — and the drivers and tools that connect to them.
---

# Query Data

GreptimeDB exposes several query interfaces over the same tables. Which one to use depends on the signal and on the tool doing the asking.

## Query languages

- [SQL](./sql.md) — queries across metrics, logs, and traces, including range queries. [Views](./view.md) and [common table expressions](./cte.md) factor out a query you write repeatedly.
- [PromQL](./promql.md) — metric queries through the Prometheus HTTP API, or `TQL` inside SQL.
- [Jaeger API](./jaeger.md) — trace queries from Jaeger UI or Grafana.
- [Log Query](./log-query.md) — a dedicated HTTP endpoint for log search. Experimental.

## Clients and drivers

GreptimeDB speaks the [MySQL](/user-guide/protocols/mysql.md) and [PostgreSQL](/user-guide/protocols/postgresql.md) wire protocols, so existing SQL drivers connect to it without a GreptimeDB-specific client. [SQL Tools](/reference/sql-tools.md) lists the drivers and their connection settings.

## Query files that were never ingested

GreptimeDB can run SQL over external data files in place. See [Query External Data](./query-external-data.md).
