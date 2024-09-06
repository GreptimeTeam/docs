# PostgreSQL

## Connect

You can connect to GreptimeDB using PostgreSQL via port `4003`.
Simply add the `-U` argument to your command, followed by your username and password. Here's an example:

```shell
psql -h <host> -p 4003 -U <username> -d public
```

- For how to setup username and password for GreptimeDB, please refer to [Authentication](/user-guide/operations/authentication.md).
- If you want to use other ports for PostgreSQL, please refer to [Protocol options](/user-guide/operations/configuration.md#protocol-options) in the configuration document.


## Table management

Please refer to [Table Management](/user-guide/table-management.md).

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

