# Time Zone

GreptimeDB supports multiple protocols, each with its own method for configuring time zones.
This guide provides a comprehensive overview of how to set the time zone for different protocols and languages supported by GreptimeDB.

By default, GreptimeDB operates in the UTC 0 time zone.
If you need to change the time zone, please follow the instructions specific to your protocol or client.

## MySQL client

### Command line

For configuring the time zone via the MySQL command line client, please refer to the [time zone section](/user-guide/protocols/mysql.md#time-zone) in the MySQL protocol documentation.

### MySQL driver

For applications using the MySQL Driver in Java or Go, detailed instructions can be found in the [time zone section](/reference/sql-tools.md#time-zone) of the SQL tools documentation.

## PostgreSQL client

To configure the time zone for the PostgreSQL client,
please refer to the [time zone section](/user-guide/protocols/postgresql.md#time-zone) in the PostgreSQL protocol documentation.

## HTTP API

When using the HTTP API, you can specify the time zone through the header parameter.
For more information, please refer to the [HTTP API documentation](/user-guide/protocols/http.md#time-zone).

## Impact of time zone on SQL statements

The client's time zone setting influences both data ingestion and querying.

### Ingest data

The time zone set in the client impacts the data during ingestion.
For more information, please refer to the [ingest data section](/user-guide/ingest-data/for-iot/sql.md#time-zone).
Additionally, the default timestamp values in the table schema are influenced by the client's time zone in the same manner as the ingested data.

### Query data

The time zone setting also affects data during querying.
For detailed information, please refer to the [query data section](/user-guide/query-data/sql.md#time-zone).

