---
keywords: [物联网, IoT, 数据写入, MQTT, EMQX, gRPC SDK, InfluxDB 行协议, OpenTSDB, SQL]
description: 物联网场景写入 GreptimeDB 的路径，覆盖设备协议、消息代理、SDK 和 SQL。
---

# 物联网（IoT）数据写入

物联网数据来自设备、消息代理和应用程序。[写入数据](../overview.md)用一张表列出了全部来源，本页覆盖物联网场景的写入路径。

- [gRPC SDK](./grpc-sdks/overview.md)——Go 和 Java 客户端，用于从自有应用写入。
- [EMQX](emqx.md)——MQTT 设备，通过 EMQX 的数据集成写入。
- [InfluxDB 行协议](influxdb-line-protocol.md)——适用于 Telegraf 和已有的 InfluxDB 客户端，该页同时包含 Telegraf 的配置方式。
- [OpenTSDB](opentsdb.md)——通过 `/opentsdb/api/put` HTTP 接口写入。
- [SQL](sql.md)——通过 MySQL 或 PostgreSQL 协议执行 `INSERT`。

除 SQL 路径外，表和列都在数据到达时自动创建，见[自动生成表结构](../overview.md#自动生成表结构)。
