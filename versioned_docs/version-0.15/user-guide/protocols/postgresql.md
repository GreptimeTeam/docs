---
keywords: [pg, pgsql, PostgreSQL connection, table management, data ingestion, querying data, time zones, foreign data wrapper]
description: Guide on connecting to GreptimeDB using PostgreSQL, managing tables, ingesting and querying data, and handling time zones.
---

# PostgreSQL

## Connect

You can connect to GreptimeDB using PostgreSQL via port `4003`.
Simply add the `-U` argument to your command, followed by your username and password. Here's an example:

```shell
psql -h <host> -p 4003 -U <username> -d public
```

- For how to setup username and password for GreptimeDB, please refer to [Authentication](/user-guide/deployments-administration/authentication/overview.md).
- If you want to use other ports for PostgreSQL, please refer to [Protocol options](/user-guide/deployments-administration/configuration.md#protocol-options) in the configuration document.


## Table management

Please refer to [Table Management](/user-guide/deployments-administration/manage-data/basic-table-operations.md).

## Ingest data

Please refer to [SQL](/user-guide/ingest-data/for-iot/sql.md).

## Query data

Please refer to [SQL](/user-guide/query-data/sql.md).

## Time zone

GreptimeDB's PostgreSQL protocol interface follows original PostgreSQL on [datatype-timezones](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES).

By default, PostgreSQL uses its server time zone for timestamp. To override, you can
set `time_zone` variable for current session using SQL statement `SET TIMEZONE TO '<value>';`.
The value of `time_zone` can be any of:

- A full time zone name, for example `America/New_York`.
- A time zone abbreviation, for example `PST`.
- Offset to UTC such as `+08:00`.

You can use `SHOW` to check the current time zone settings. For example:

```sql
SHOW VARIABLES time_zone;
```

```sql
 TIME_ZONE
-----------
 UTC
```

Change the session time zone to `+1:00`:

```SQL
SET TIMEZONE TO '+1:00'
```

For information on how the time zone affects data inserts and queries, please refer to the SQL documents in the [Ingest Data](/user-guide/ingest-data/for-iot/sql.md#time-zone) and [Query Data](/user-guide/query-data/sql.md#time-zone) sections.

## Foreign Data Wrapper

GreptimeDB can be configured as a foreign data server for Postgres' built-in
[FDW extension](https://www.postgresql.org/docs/current/postgres-fdw.html). This
allows user to query GreptimeDB tables seamlessly from Postgres server. It's
also possible to join Postgres tables with GreptimeDB tables.

For example, your IoT metadata, like device information, is stored in a
relational data model in Postgres. It's possible to use filter queries to find
out device IDs and join with time-series data from GreptimeDB.

### Setup

To setup GreptimeDB for Postgres FDW, make sure you enabled postgres protocol
support in GreptimeDB and it's accessible from your Postgres server.

To create and configuration GreptimeDB in Postgres, first enable the
`postgres_fdw` extension.

```sql
CREATE EXTENSION postgres_fdw;
```

Add GreptimeDB instance as remote server.

```sql
CREATE SERVER greptimedb
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host 'greptimedb_host', dbname 'public', port '4003');
```

Configure user mapping for Postgres user and GreptimeDB user. This step is
required. But if you don't have authentication enabled in GreptimeDB OSS
version, just fill the credential with random data.

```sql
CREATE USER MAPPING FOR postgres
SERVER greptimedb
OPTIONS (user 'greptime', password '...');
```

Create foreign table in Postgres to map GreptimeDB's schema. Note that you will
need to use Postgres' corresponding data types for GreptimeDB's.

For GreptimeDB's tables

```sql
CREATE TABLE grpc_latencies (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  method_name STRING,
  latency DOUBLE,
  PRIMARY KEY (host, method_name)
) with('append_mode'='true');

CREATE TABLE app_logs (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  api_path STRING FULLTEXT INDEX,
  log_level STRING,
  log STRING FULLTEXT INDEX,
  PRIMARY KEY (host, log_level)
) with('append_mode'='true');
```

The foreign table DDL is like this. You need to run them in Postgres to create
these tables;

```sql
CREATE FOREIGN TABLE ft_grpc_latencies (
  ts TIMESTAMP,
  host VARCHAR,
  method_name VARCHAR,
  latency DOUBLE precision
)
SERVER greptimedb
OPTIONS (table_name 'grpc_latencies');

CREATE FOREIGN TABLE ft_app_logs (
  ts TIMESTAMP,
  host VARCHAR,
  api_path VARCHAR,
  log_level VARCHAR,
  log VARCHAR
)
SERVER greptimedb
OPTIONS (table_name 'app_logs');
```

To help you to generate statements in Postgres, we enhanced `SHOW CREATE TABLE`
in GreptimeDB to dump the Postgres DDL for you. For example:

```sql
SHOW CREATE TABLE grpc_latencies FOR postgres_foreign_table;
```

Note that you will need to replace server name `greptimedb` with the name you
defined in `CREATE SERVER` statement.

### Run Queries

You can now send query from Postgres. It's also possible to use functions that
are available in both Postgres and GreptimeDB, like `date_trunc`.

```sql
SELECT * FROM ft_app_logs ORDER BY ts DESC LIMIT 100;

SELECT
    date_trunc('MINUTE', ts) as t,
    host,
    avg(latency),
    count(latency)
FROM ft_grpc_latencies GROUP BY host, t;
```

## Statement Timeout

You can set the `statement_timeout` variable for the current session using SQL statement `SET statement_timeout = <value>` or `SET STATEMENT_TIMEOUT = <value>`, which specifies the maximum time in milliseconds for a statement to execute. The server will terminate the statement if it exceeds the specified time.

For example, to set the maximum execution time to 10 seconds:

```SQL
SET statement_timeout=10000;
```
