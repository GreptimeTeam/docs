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

## Write Data

Please refer to [SQL](../write-data/sql.md).

## Query Data

Please refer to [SQL](../query-data/sql.md).
