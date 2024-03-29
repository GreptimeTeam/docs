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

## HTTP API

GreptimeDB supports sending SQL statements through HTTP API. For information on how to set up authentication, please refer to [HTTP API](./http-api.md).

## Write data

Please refer to [SQL](../write-data/sql.md).

## Query data

Please refer to [SQL](../query-data/sql.md).

## Time Zone

GreptimeDB's PostgreSQL protocol interface follows original PostgreSQL on [datatype-timezones](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES).

By default, PostgreSQL uses its server time zone for timestamp. To override, you can
set `time_zone` variable for current session using SQL statement `SET TIMEZONE TO '<value>';`.
The value of `time_zone` can be any of:

- A full time zone name, for example `America/New_York`.
- A time zone abbreviation, for example PST.
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

For information on how the time zone affects queries and inserts, please refer to the SQL documents in the [Write Data](../write-data/sql.md#time-zone) and [Query Data](../query-data/sql.md#time-zone) chapters.

