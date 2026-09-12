---
keywords: [OpenTSDB, protocol, api/put, ingest metrics, HTTP API]
description: What GreptimeDB implements of the OpenTSDB protocol — the /api/put endpoint for writes only — and where the ingestion guide lives.
---

# OpenTSDB

GreptimeDB accepts OpenTSDB metrics over HTTP, using the request and response format of OpenTSDB's `/api/put`.

- **Endpoint**: `POST /v1/opentsdb/api/put`
- **Body**: a single metric object or an array of them, with `metric`, `timestamp`, `value`, and `tags`

Writes only. There is no OpenTSDB-compatible query endpoint; query with [SQL](/user-guide/query-data/sql.md) or [PromQL](/user-guide/query-data/promql.md).

Request examples are in [Ingest Data with OpenTSDB](/user-guide/ingest-data/for-iot/opentsdb.md).
