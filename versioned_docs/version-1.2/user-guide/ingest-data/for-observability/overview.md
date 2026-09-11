---
keywords: [observability, data ingestion, metrics, logs, traces, Prometheus, OpenTelemetry, Loki, Elasticsearch, Splunk, Vector, Fluent Bit]
description: Observability ingestion paths into GreptimeDB, grouped by signal and by the agent or pipeline that carries the data.
---

# Ingest Data for Observability

Observability data reaches GreptimeDB through the protocol its source already speaks. [Ingest Data](../overview.md) lists every source in one table; this page groups the observability paths by signal.

## Metrics

- [Prometheus Remote Write](prometheus.md) — for an existing Prometheus server or Prometheus Agent.
- [OpenTelemetry](opentelemetry.md) — OTLP/HTTP from an OpenTelemetry SDK.
- [InfluxDB Line Protocol](../for-iot/influxdb-line-protocol.md) — the path for migrating off InfluxDB, and for Telegraf. This page also covers the Telegraf configuration.

## Logs

- [Loki](loki.md) — the Loki Push API, the path for migrating off Loki without changing the clients already writing to it. This page also covers the Alloy configuration.
- [Elasticsearch](elasticsearch.md) — the `_bulk` API, compatible with Logstash, Filebeat, and Telegraf.
- [Splunk](splunk.md) — the HTTP Event Collector (HEC) protocol, compatible with Vector and the OpenTelemetry Collector.

Parsing and transforming text logs before they are stored is covered in [Logs](/user-guide/logs/overview.md).

## Traces

- [OpenTelemetry](opentelemetry.md) — OTLP/HTTP from an SDK or the Collector.

Storing traces and querying them with SQL or the Jaeger-compatible API is covered in [Traces](/user-guide/traces/overview.md).

## Agents and pipelines

These sit between the source and GreptimeDB and pick the protocol for you. Which signals each one carries differs:

- [OpenTelemetry Collector](otel-collector.md) — routes metrics, logs, and traces through an OTLP/HTTP exporter.
- [Vector](vector.md) — metrics through the `greptimedb_metrics` sink, logs through `greptimedb_logs`. No traces sink.
- [Fluent Bit](fluent-bit.md) — logs through the HTTP output; metrics, logs, and traces through the OpenTelemetry output; metrics also through Prometheus Remote Write.
- [Grafana Alloy](alloy.md) — writes through Remote Write, OpenTelemetry, or Loki.
- [Kafka](kafka.md) — consumed into GreptimeDB with Vector as the transport.
