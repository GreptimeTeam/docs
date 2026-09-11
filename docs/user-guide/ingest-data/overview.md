---
keywords: [data ingestion, ingestion protocols, automatic schema generation, observability, IoT]
description: Maps each data source to the protocol it writes with and the guide that covers it, and explains automatic schema generation.
---

# Ingest Data

GreptimeDB accepts data through established observability and database protocols, so most sources write to it without a custom client. This page maps each source to the protocol it writes with and the guide that covers it.

<AnchorAlias id="recommended-data-ingestion-methods" />

## Choose an Ingestion Path

| Data comes from | Writes with | Guide |
| --- | --- | --- |
| OpenTelemetry SDK | OTLP/HTTP | [OpenTelemetry Protocol (OTLP)](./for-observability/opentelemetry.md) |
| OpenTelemetry Collector | OTLP/HTTP exporter | [OTel Collector](./for-observability/otel-collector.md) |
| Prometheus | Remote Write | [Prometheus](./for-observability/prometheus.md) |
| Grafana Alloy | Remote Write, OTLP, or Loki | [Grafana Alloy](./for-observability/alloy.md) |
| Loki clients | Loki Push API | [Loki](./for-observability/loki.md) |
| Elasticsearch clients | Bulk API | [Elasticsearch](./for-observability/elasticsearch.md) |
| Splunk shippers | HTTP Event Collector (HEC) | [Splunk](./for-observability/splunk.md) |
| Vector | GreptimeDB sink | [Vector](./for-observability/vector.md) |
| Fluent Bit | HTTP output plugin | [Fluent Bit](./for-observability/fluent-bit.md) |
| Kafka topics | Vector as the transport | [Kafka](./for-observability/kafka.md) |
| Telegraf or InfluxDB clients | InfluxDB line protocol | [InfluxDB Line Protocol](./for-iot/influxdb-line-protocol.md) |
| OpenTSDB clients | `/opentsdb/api/put` | [OpenTSDB](./for-iot/opentsdb.md) |
| MQTT devices | EMQX data integration | [EMQX](./for-iot/emqx.md) |
| Your own application | gRPC SDK for Go or Java | [gRPC SDKs](./for-iot/grpc-sdks/overview.md) |
| Existing SQL tooling | MySQL or PostgreSQL protocol | [SQL](./for-iot/sql.md) |
| Flink jobs | GreptimeDB connector | [Apache Flink](/user-guide/integrations/flink.md) |
| Spark jobs | GreptimeDB connector | [Apache Spark](/user-guide/integrations/spark.md) |

The same guides are also grouped by scenario, in [observability sources](./for-observability/overview.md) and [IoT sources](./for-iot/overview.md).

Text logs and traces need more than a write protocol. See [Logs](/user-guide/logs/overview.md) for parsing and transforming logs with pipelines, and [Traces](/user-guide/traces/overview.md) for storing and querying OTLP traces.

## Automatic Schema Generation

GreptimeDB accepts schemaless writes: it creates the table and adds columns as data arrives, so no schema has to be defined in advance.

All protocols and integrations support this except [SQL](./for-iot/sql.md), [Apache Flink](/user-guide/integrations/flink.md), and [Apache Spark](/user-guide/integrations/spark.md).

## Next Steps

- [Query Data](/user-guide/query-data/overview.md) — SQL, PromQL, and the Jaeger-compatible API.
- [Manage Data](/user-guide/manage-data/overview.md) — updates, deletes, TTL policies, and compaction.
