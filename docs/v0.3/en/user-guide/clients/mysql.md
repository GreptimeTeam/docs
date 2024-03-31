# MySQL

## Connect

GreptimeDB is compatible with MySQL protocol, use `mysql` client to connect to GreptimeDB server.

```shell
# 127.0.0.1 is GreptimeDB's host and 4002 is the default MySQL port
$ mysql -h 127.0.0.1 -P 4002
```

If [authentication](./authentication.md) has been setup on the server side, use `-u` param to set username and `-p` to indicate password.

```shell
# replace greptime_user with your account username
$ mysql -h 127.0.0.1 -P 4002 -u greptime_user -p
```

## Time zone

GreptimeDB's MySQL protocol interface follows original MySQL server on [how to
deal with time zone](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html).

By default, MySQL uses its server time zone for timestamp. To override, you can
set `time_zone` variable for current session using SQL statement `SET time_zone
= 'UTC';`. The value of `time_zone` can be any of:

- The server's time zone: `SYSTEM`.
- Offset to UTC such as `+08:00`.
- Any named time zone like `Europe/Berlin`.

A few MySQL clients like Grafana MySQL data source allows you to set time zone
for current session. It is also possible to check `time_zone` variable for
current session by SQL statement `SELECT @@time_zone;`.

## HTTP API

GreptimeDB supports sending SQL statements through HTTP API. For information on how to set up authentication, please refer to [HTTP API](./http-api.md).

## Write Data

Please refer to [SQL](../write-data/sql.md).

## Query Data

Please refer to [SQL](../query-data/sql.md).
