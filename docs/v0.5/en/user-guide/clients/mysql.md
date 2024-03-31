# MySQL

## Connect

Use `-u` param to set username, use `-p` to indicate password. Be sure to replace `greptime_user(username)` and `greptime_pwd(password)` with your own username and password:

```shell
❯ mysql -h 127.0.0.1 -P 4002 -u greptime_user -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.1.10-alpha-msql-proxy Greptime

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
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

## Write data

Please refer to [SQL](../write-data/sql.md).

## Query data

Please refer to [SQL](../query-data/sql.md).
