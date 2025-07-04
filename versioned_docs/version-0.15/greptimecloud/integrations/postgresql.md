---
keywords: [PostgreSQL, connection details, psql CLI, JDBC URL, wire protocol]
description: Instructions for connecting to GreptimeCloud using PostgreSQL protocol, including connection details, psql CLI, connection strings, and JDBC URL.
---

# PostgreSQL

GreptimeCloud exposes GreptimeDB access in PostgreSQL v3 wire protocol. Most
standard clients and drivers are compatible at wire protocol level, and the connection is encrypted with TLS.
Note that we don't use Postgres' SQL dialect in GreptimeDB, so there can be some statements
that are unsupported.
For more information, please refer to [Postgresql documentation](https://docs.greptime.com/user-guide/protocols/postgresql) of GreptimeDB.

To connect to GreptimeCloud in Postgres wire protocol, using information below:

- Host: `<host>`
- Port: `4003`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

## `psql`

The default cli tool bundled with PostgreSQL.

```text
psql -h <host> -p 4003 -U <username> -d <dbname> -W
```

## Postgres Connection String

Using the connection string below for compatible client libraries like psycopg,
rust-postgres and more.

```text
host=<host> port=4003 dbname=<dbname> user=<username> password=<password>
```

## URL

Using the URL below with your Postgres JDBC client.

```text
jdbc:postgresql://<host>:4003/<dbname>?user=<username>&password=<password>&ssl=true
```

If you are using clients from Python, you might be able to use following URL

```text
postgresql://<username>:<password>@<host>:4003/<dbname>
```

## Postgres Foreign Data Wrapper

Configure your GreptimeCloud instance as Postgres FDW. Change server name and
username to your own.

```sql
CREATE SERVER greptimedb
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host '<host>', dbname '<dbname>', port '4003');

CREATE USER MAPPING FOR postgres
SERVER greptimedb
OPTIONS (user '<username>', password '<password>');
```
