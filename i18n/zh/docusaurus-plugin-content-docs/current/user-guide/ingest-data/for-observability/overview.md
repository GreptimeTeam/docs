---
keywords: [可观测性, 数据写入, 指标, 日志, 链路追踪, Prometheus, OpenTelemetry, Loki, Elasticsearch, Splunk, Vector, Fluent Bit]
description: 可观测场景写入 GreptimeDB 的路径，按信号类型以及承载数据的采集端分组。
---

# 可观测场景数据写入

可观测数据通过数据源本身已经在用的协议写入 GreptimeDB。[写入数据](../overview.md)用一张表列出了全部来源，本页按信号类型整理可观测场景的写入路径。

## 指标

- [Prometheus Remote Write](prometheus.md)——适用于已经运行 Prometheus 或 Prometheus Agent 的环境。
- [OpenTelemetry](opentelemetry.md)——通过 OpenTelemetry SDK 以 OTLP/HTTP 写入。
- [InfluxDB 行协议](../for-iot/influxdb-line-protocol.md)——从 InfluxDB 迁移时走这条路径，也适用于 Telegraf，该页同时包含 Telegraf 的配置方式。

## 日志

- [Loki](loki.md)——Loki Push API，从 Loki 迁移时走这条路径，已有的客户端不用改，该页同时包含 Alloy 的配置方式。
- [Elasticsearch](elasticsearch.md)——`_bulk` API，兼容 Logstash、Filebeat 和 Telegraf。
- [Splunk](splunk.md)——HTTP Event Collector（HEC）协议，兼容 Vector 和 OpenTelemetry Collector。

文本日志在入库前的解析和转换见[日志](/user-guide/logs/overview.md)。

## 链路追踪

- [OpenTelemetry](opentelemetry.md)——通过 SDK 或 Collector 以 OTLP/HTTP 写入。

trace 的存储，以及用 SQL 和 Jaeger 兼容接口查询，见[链路追踪](/user-guide/traces/overview.md)。

## 采集端与数据管道

以下工具位于数据源和 GreptimeDB 之间，写入协议由工具自己决定。各自支持的信号类型并不相同：

- [OpenTelemetry Collector](otel-collector.md)——通过 OTLP/HTTP exporter 转发指标、日志和 trace。
- [Vector](vector.md)——指标用 `greptimedb_metrics` sink，日志用 `greptimedb_logs`，没有 trace sink。
- [Fluent Bit](fluent-bit.md)——日志用 HTTP output；指标、日志和 trace 用 OpenTelemetry output；指标还可以用 Prometheus Remote Write。
- [Grafana Alloy](alloy.md)——通过 Remote Write、OpenTelemetry 或 Loki 写入。
- [Kafka](kafka.md)——经 Vector 中转写入。
