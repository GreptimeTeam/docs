---
keywords: [observability, data ingestion, metrics, logs, traces, Prometheus, OpenTelemetry, Loki, Elasticsearch, Splunk, Vector, Fluent Bit]
description: Observability ingestion paths into GreptimeDB, grouped by signal and by the agent or pipeline that carries the data.
---

# Ingest Data for Observability

Observability data reaches GreptimeDB through the protocol its source already speaks. [Ingest Data](../overview.md) lists every source in one table; this page groups the observability paths by signal.

## Metrics

- [Prometheus Remote Write](prometheus.md) — for an existing Prometheus server or Prometheus Agent.
- [OpenTelemetry](opentelemetry.md) — OTLP/HTTP from an OpenTelemetry SDK.
- [InfluxDB Line Protocol](../for-iot/influxdb-line-protocol.md) — for Telegraf and existing InfluxDB clients. This page also covers the Telegraf configuration.

## Logs

- [Loki](loki.md) — the Loki Push API, for clients already writing to Loki. This page also covers the Alloy configuration.
- [Elasticsearch](elasticsearch.md) — the `_bulk` API, compatible with Logstash, Filebeat, and Telegraf.
- [Splunk](splunk.md) — the HTTP Event Collector (HEC) protocol, compatible with Vector and the OpenTelemetry Collector.

Parsing and transforming text logs before they are stored is covered in [Logs](/user-guide/logs/overview.md).

## Traces

- [OpenTelemetry](opentelemetry.md) — OTLP/HTTP from an SDK or the Collector.

Storing traces and querying them with SQL or the Jaeger-compatible API is covered in [Traces](/user-guide/traces/overview.md).

## Agents and pipelines

These carry any of the three signals, and choose the protocol for you:

- [OpenTelemetry Collector](otel-collector.md) — routes metrics, logs, and traces through an OTLP/HTTP exporter.
- [Vector](vector.md) — writes through the GreptimeDB sink.
- [Fluent Bit](fluent-bit.md) — writes through the HTTP output plugin.
- [Grafana Alloy](alloy.md) — writes through Remote Write, OpenTelemetry, or Loki.
- [Kafka](kafka.md) — consumed into GreptimeDB with Vector as the transport.
