# Overview

You can read from or write into GreptimeDB using various protocols.

Note that writing data in a specific protocol does not mean that you
have to read data with the same protocol. For example, you can write
data through gRPC endpoint while using MySQL client to read them.

## Authentication

Please refer to [Authentication](./authentication.md) to learn how to config username and password for GreptimeDB.

## Protocols

- [MySQL](./mysql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
- [PostgreSQL](./postgresql.md)
- [OpenTelemetry Protocol(OTLP)](./otlp.md)
- [HTTP API](./http-api.md)

## Client SDK Libraries

Client libraries provide a convenient way to connect to GreptimeDB and interact with data.
They offer functionality for writing and querying data,
making it easier to integrate GreptimeDB into your applications.
For more information, please refer to the [Client Libraries](/user-guide/client-libraries/overview.md) documentation.
