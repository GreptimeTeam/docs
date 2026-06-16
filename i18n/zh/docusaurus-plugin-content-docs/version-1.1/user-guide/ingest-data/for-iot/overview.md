---
keywords: [物联网, 数据写入, SQL, gRPC SDK, InfluxDB Line Protocol, EMQX, OpenTSDB]
description: 概述 GreptimeDB 支持的各种数据写入方法，包括 SQL、gRPC SDK、InfluxDB Line Protocol、EMQX 和 OpenTSDB。
---

# 物联网（IoT）数据写入

数据的写入是物联网数据流程的关键部分。
它从各种来源（如传感器、设备和应用程序）收集数据并将其存储在中央位置以供进一步处理和分析。
数据写入过程对于确保数据的准确性、可靠性和安全性至关重要。

GreptimeDB 可处理并存储超大规模量级的数据以供分析，
支持各种数据格式、协议和接口，以便集成不同的物联网设备和系统。

- [SQL INSERT](sql.md)：简单直接的数据插入方法。
- [gRPC SDK](./grpc-sdks/overview.md)：提供高效、高性能的数据写入，特别适用于实时数据和复杂的物联网基础设施。
- [InfluxDB Line Protocol](influxdb-line-protocol.md)：一种广泛使用的时间序列数据协议，便于从 InfluxDB 迁移到 GreptimeDB。该文档同样介绍了 Telegraf 的集成方式。
- [EMQX](emqx.md)：支持大规模设备连接的 MQTT 代理，可直接将数据写入到 GreptimeDB。
- [OpenTSDB](opentsdb.md)：使用 OpenTSDB 协议将数据写入到 GreptimeDB。

