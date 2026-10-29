---
keywords: [Splunk, protocol, HTTP Event Collector, HEC, ingest logs, Vector]
description: What GreptimeDB implements of the Splunk HEC protocol, which endpoints exist, and what is deliberately not implemented.
---

# Splunk

GreptimeDB implements a subset of the [Splunk HTTP Event Collector (HEC)](https://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector) protocol, so a shipper that already speaks HEC — Vector, the OpenTelemetry Collector — writes to GreptimeDB by changing the endpoint URL and the token.

The base path is `/v1/splunk`; the client appends the collector path.

| Endpoint | Purpose |
| --- | --- |
| `/services/collector/event` | Structured JSON events |
| `/services/collector/raw` | Plain text, stored verbatim |

Mapping: a Splunk `index` becomes a GreptimeDB table. `host`, `source`, `sourcetype`, and the keys under `fields` become tag columns and join the table's primary key.

Not implemented:

- Indexer acknowledgment (`/services/collector/ack`).
- The `channel` parameter is accepted and ignored.
- Fluent Bit's native `splunk` output, which hardcodes the request path and cannot reach `/v1/splunk`. Use [its HTTP output](/user-guide/ingest-data/for-observability/fluent-bit.md) instead.

Endpoint details, response codes, and shipper configuration are in [Ingest Data with Splunk](/user-guide/ingest-data/for-observability/splunk.md).
