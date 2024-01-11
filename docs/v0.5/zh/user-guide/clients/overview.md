# 概述

你可以使用多种协议从 GreptimeDB 中读取或写入数据。

请注意，使用特定协议写入数据并不意味着你必须使用相同的协议读取数据。例如，你可以通过 gRPC 端点写入数据，同时使用 MySQL 客户端读取它们。

## 鉴权

请参阅 [鉴权](./authentication.md) 以了解如何为 GreptimeDB 配置用户名和密码。

## 协议

- [MySQL](./mysql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
- [PostgreSQL](./postgresql.md)
- [OpenTelemetry Protocol(OTLP)](./otlp.md)
- [HTTP API](./http-api.md)

## 客户端库

客户端库提供了一种方便的方式来连接 GreptimeDB 并与数据交互。
它们提供了写入和查询数据的功能，使得将 GreptimeDB 集成到你的应用程序中变得更加容易。
请参考[客户端库](/user-guide/client-libraries/overview.md)文档获取更多信息。

