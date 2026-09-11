---
keywords: [数据写入, 写入协议, 自动生成表结构, 可观测性, 物联网]
description: 按数据来源列出对应的写入协议和文档，并说明自动生成表结构的适用范围。
---

# 写入数据

GreptimeDB 支持多种常见的可观测性和数据库协议，多数数据源不需要专门的客户端即可写入。本页按数据来源列出对应的写入方式和文档。

<AnchorAlias id="推荐的数据写入方法" />

## 选择写入方式

| 数据来源 | 写入方式 | 文档 |
| --- | --- | --- |
| OpenTelemetry SDK | OTLP/HTTP | [OpenTelemetry 协议（OTLP）](./for-observability/opentelemetry.md) |
| OpenTelemetry Collector | OTLP/HTTP exporter | [OTel Collector](./for-observability/otel-collector.md) |
| Prometheus | Remote Write | [Prometheus](./for-observability/prometheus.md) |
| Grafana Alloy | Remote Write、OTLP 或 Loki | [Grafana Alloy](./for-observability/alloy.md) |
| Loki 客户端 | Loki Push API | [Loki](./for-observability/loki.md) |
| Elasticsearch 客户端 | Bulk API | [Elasticsearch](./for-observability/elasticsearch.md) |
| Splunk 采集端 | HTTP Event Collector（HEC） | [Splunk](./for-observability/splunk.md) |
| Vector | GreptimeDB sink | [Vector](./for-observability/vector.md) |
| Fluent Bit | HTTP output 插件 | [Fluent Bit](./for-observability/fluent-bit.md) |
| Kafka topic | 经 Vector 中转 | [Kafka](./for-observability/kafka.md) |
| Telegraf 或 InfluxDB 客户端 | InfluxDB 行协议 | [InfluxDB 行协议](./for-iot/influxdb-line-protocol.md) |
| OpenTSDB 客户端 | `/opentsdb/api/put` | [OpenTSDB](./for-iot/opentsdb.md) |
| MQTT 设备 | EMQX 数据集成 | [EMQX](./for-iot/emqx.md) |
| 自有应用 | Go 或 Java gRPC SDK | [gRPC SDK](./for-iot/grpc-sdks/overview.md) |
| 现有 SQL 工具链 | MySQL 或 PostgreSQL 协议 | [SQL](./for-iot/sql.md) |
| Flink 任务 | Flink SQL、Table API 或 DataStream API | [Apache Flink](/user-guide/integrations/flink.md) |
| Spark 任务 | batch DataFrame 或 Structured Streaming micro-batch | [Apache Spark](/user-guide/integrations/spark.md) |

同样的文档也按场景分组，见[可观测场景](./for-observability/overview.md)和[物联网场景](./for-iot/overview.md)。

文本日志和链路追踪除写入协议外还涉及存储前的处理：日志的解析和转换见 [日志](/user-guide/logs/overview.md)，OTLP trace 的存储和查询见[链路追踪](/user-guide/traces/overview.md)。

## 自动生成表结构

GreptimeDB 支持无 schema 写入：数据到达时自动创建表并添加需要的列，不需要预先定义 schema。

除 [SQL](./for-iot/sql.md)、[Apache Flink](/user-guide/integrations/flink.md) 和 [Apache Spark](/user-guide/integrations/spark.md) 外，所有协议和集成都支持该行为。

## 下一步

- [查询数据](/user-guide/query-data/overview.md)——SQL、PromQL 和 Jaeger 兼容接口。
- [管理数据](/user-guide/manage-data/overview.md)——更新、删除、TTL 策略和 compaction。
