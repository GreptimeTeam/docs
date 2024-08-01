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

## Client SDK libraries

Client libraries provide a convenient way to connect to GreptimeDB and interact with data.
They offer functionality for writing and querying data,
making it easier to integrate GreptimeDB into your applications.
For more information, please refer to the [Client Libraries](/user-guide/client-libraries/overview.md) document.

## Time zone

SQL client sessions use the database system time zone by default. 
You can specify the time zone for the current SQL client session, 
which will override the database's system time zone. 
GreptimeDB converts timestamp values from the current time zone to UTC for storage, 
and converts them back from UTC to the current time zone for retrieval.

- To learn how to set the time zone, please refer to the documents for [MySQL](mysql.md#time-zone) and [PostgreSQL](postgresql.md#time-zone).
- For information on how the time zone affects inserts and queries, please refer to the SQL documents in the [write data](../ingest-data/for-iot/sql.md#time-zone) and [query data](../query-data/sql.md#time-zone) chapters.
