# 概述

## 自动生成表结构

GreptimeDB 支持无 schema 写入，即在数据写入时自动创建表格并添加必要的列。
这种能力确保你无需事先手动定义 schema，从而更容易管理和集成各种数据源。
<!-- TODO: 添加协议和集成的链接 -->
此功能适用于所有协议和集成，除了 [SQL](./for-iot/sql.md)。

## 推荐的数据写入方法

GreptimeDB 支持针对特定场景的各种数据写入方法，以确保最佳性能和集成灵活性。

### 可观测性场景

- [Prometheus Remote Write](./for-observerbility/prometheus.md)：将 GreptimeDB 作为 Prometheus 的远程存储，适用于实时监控和警报。
- [Vector](./for-observerbility/vector.md)：将 GreptimeDB 用作 Vector 的接收端，适用于复杂的数据流水线和多样化的数据源。
- [OpenTelemetry](./for-observerbility/opentelemetry.md)：将 telemetry 数据收集并导出到 GreptimeDB，以获取详细的可观测性洞察。

### 物联网场景

- [SQL 插入](./for-iot/sql.md)：简单直接的数据插入方法。
- [gRPC-SDK](./for-iot/grpc-sdks/overview.md)：提供高效、高性能的数据写入，特别适用于实时数据和复杂的物联网基础设施。
- [InfluxDB Line Protocol](./for-iot/influxdb-line-protocol.md)：一种广泛使用的时间序列数据协议，便于从 InfluxDB 迁移到 GreptimeDB。
- [EMQX](./for-iot/emqx.md)：支持大规模设备连接的 MQTT 代理，可用于将数据写入到 GreptimeDB。
- [OpenTSDB](./for-iot/opentsdb.md)：使用 OpenTSDB 协议将数据写入到 GreptimeDB。

