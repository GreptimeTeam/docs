---
keywords: [IoT, data ingestion, MQTT, EMQX, gRPC SDK, InfluxDB line protocol, OpenTSDB, SQL]
description: IoT ingestion paths into GreptimeDB, from device protocols and message brokers to SDKs and SQL.
---

# Ingest Data for IoT

IoT data reaches GreptimeDB from devices, brokers, and applications. [Ingest Data](../overview.md) lists every source in one table; this page covers the IoT paths.

- [gRPC SDKs](./grpc-sdks/overview.md) — Go and Java clients for writing from your own application.
- [EMQX](emqx.md) — MQTT devices, written through an EMQX data integration.
- [InfluxDB Line Protocol](influxdb-line-protocol.md) — for Telegraf and existing InfluxDB clients. This page also covers the Telegraf configuration.
- [OpenTSDB](opentsdb.md) — the `/opentsdb/api/put` HTTP endpoint.
- [SQL](sql.md) — `INSERT` statements over the MySQL or PostgreSQL protocol.

Tables and columns are created as data arrives, except on the SQL path. See [Automatic Schema Generation](../overview.md#automatic-schema-generation).
