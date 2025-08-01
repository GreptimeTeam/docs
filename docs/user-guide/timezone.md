---
keywords: [time zone management, SQL time zone, data ingestion, querying, client session, time zone configuration]
description: Guide on specifying and managing time zones in GreptimeDB client sessions, including impacts on data ingestion and querying.
---

# Time Zone

You can specify the time zone in the client session to manage time data conveniently.
The specified time zone in the client session does not affect the time data stored in the GreptimeDB server,
it only applies when the client sends a request to the server.
GreptimeDB converts the time value from a string representation to a datetime according to the specified time zone during ingestion or querying, or converts it back.

## Specify time zone in clients

By default, all clients use [the default time zone configuration](/user-guide/deployments-administration/configuration.md#default-time-zone-configuration), which is UTC.
You can also specify a time zone in each client session,
which will override the default time zone configuration.

### MySQL client

- **Command Line**: For configuring the time zone via the MySQL command line client, please refer to the [time zone section](/user-guide/protocols/mysql.md#time-zone) in the MySQL protocol documentation.
- **MySQL Driver**: If you are using MySQL Driver in Java or Go, see the [time zone section](/reference/sql-tools.md#time-zone) of the SQL tools documentation.

### PostgreSQL client

To configure the time zone for the PostgreSQL client, please refer to the [time zone section](/user-guide/protocols/postgresql.md#time-zone) in the PostgreSQL protocol documentation.

### HTTP API

When using the HTTP API, you can specify the time zone through the header parameter. For more information, please refer to the [HTTP API documentation](/user-guide/protocols/http.md#time-zone).

### Dashboard

The dashboard will use the local timezone as the default timezone value. You can change it in the settings menu.

### Other clients

For other clients, you can change [the default time zone configuration](/user-guide/deployments-administration/configuration.md#default-time-zone-configuration) of GreptimeDB.

## Impact of time zone on SQL statements

The client's time zone setting influences both data ingestion and querying.

### Ingest data

The time zone set in the client impacts the data during ingestion.
For more information, please refer to the [ingest data section](/user-guide/ingest-data/for-iot/sql.md#time-zone).
Additionally, the default timestamp values in the table schema are influenced by the client's time zone in the same manner as the ingested data.

### Query data

The time zone setting also affects data during querying.
For detailed information, please refer to the [query data section](/user-guide/query-data/sql.md#time-zone).

