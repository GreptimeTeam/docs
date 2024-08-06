# PostgreSQL

## Connect

GreptimeDB also supports PostgreSQL server protocol! To get started, simply add the `-U` argument to your command, followed by your username and password. Here's an example:

```shell
❯ psql -h localhost -p 4003 -U greptime_user -d public
Password for user greptime_user:
psql (15.2, server 0.1.1)
WARNING: psql major version 15, server major version 0.1.
         Some psql features might not work.
Type "help" for help.

public=>
```

Note: Be sure to replace `greptime_user(username)` and `greptime_pwd(password)` with your own username and password.

## Table management

Please refer to [Table Management](../table-management.md).

## Write data

Please refer to [SQL](../ingest-data/for-iot/sql.md).

## Query data

Please refer to [SQL](../query-data/sql.md).

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

For information on how the time zone affects data inserts and queries, please refer to the SQL documents in the [write data](../ingest-data/for-iot/sql.md#time-zone) and [query data](../query-data/sql.md#time-zone) sections.

