# Overview

You can read from or write into GreptimeDB using various protocols.

![protocols](/multiple-protocols.png)

Note that writing data in a specific protocol does not mean that you
have to read data with the same protocol. For example, you can write
data through gRPC endpoint while using MySQL client to read them.

### Authentication

Refer to [Authentication](./authentication.md) to learn how to config username and password for GreptimeDB.

### Protocols

- [MySQL](./mysql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
- [PostgreSQL](./postgresql.md)
- [OpenTelemetry Protocol(OTLP)](./otlp.md)
- [HTTP API](./http-api.md)
- SDK Libraries
  - [Go](./sdk-libraries/go.md)
  - [Java](./sdk-libraries/java.md)
