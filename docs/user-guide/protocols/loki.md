---
keywords: [Loki, protocol, Push API, ingest logs, Grafana Alloy, Promtail]
description: What GreptimeDB implements of the Loki protocol — the Push API for writes only — and where the ingestion guide lives.
---

# Loki

GreptimeDB implements the Loki Push API, so a client already writing to Loki can write to GreptimeDB by changing the endpoint.

- **Endpoint**: `POST /v1/loki/api/v1/push`
- **Payload encodings**: Snappy-compressed Protobuf (`Content-Type: application/x-protobuf`) or Loki JSON (`Content-Type: application/json`)
- **Target table**: `loki_logs` by default, overridden with the `X-Greptime-Log-Table-Name` header
- **Database**: selected with the `X-Greptime-DB-Name` header

Writes only. Querying uses [SQL](/user-guide/query-data/sql.md); LogQL is not supported.

Labels, headers, the resulting data model, and pipeline support are covered in [Ingest Data with Loki](/user-guide/ingest-data/for-observability/loki.md).
