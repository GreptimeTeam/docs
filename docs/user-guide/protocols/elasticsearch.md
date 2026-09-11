---
keywords: [Elasticsearch, protocol, _bulk API, ingest logs, Logstash, Filebeat]
description: What GreptimeDB implements of the Elasticsearch protocol — the _bulk API for writes only — and where the ingestion guide lives.
---

# Elasticsearch

GreptimeDB implements the Elasticsearch [`_bulk` API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html) for ingestion, so collectors that already speak it — Logstash, Filebeat, Telegraf — write to GreptimeDB by changing the endpoint.

Two endpoints are available, both `POST` with an NDJSON body:

| Endpoint | Purpose |
| --- | --- |
| `/v1/elasticsearch/_bulk` | The index comes from each command line's `_index` field |
| `/v1/elasticsearch/${index}/_bulk` | The index comes from the path |

What the implementation covers:

- An Elasticsearch index maps to a GreptimeDB table. The `db` URL parameter selects the database.
- Both `index` and `create` commands are treated as inserts. Modification and deletion are not supported.
- Only the `_index` field is read from a command line; the other fields are ignored.
- Writes only. Querying uses [SQL](/user-guide/query-data/sql.md), not the Elasticsearch Query DSL.

Collector configuration and worked examples are in [Ingest Data with Elasticsearch](/user-guide/ingest-data/for-observability/elasticsearch.md).
