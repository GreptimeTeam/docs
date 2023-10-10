# PostgreSQL

## Connect

GreptimeDB also supports PostgreSQL server protocol! To get started, simply type the following command.

```shell
# 127.0.0.1 is GreptimeDB's host and 4003 is the default PostgreSQL port
# use `-d` to specify the database to connect, `public` is the default database
$ psql -h 127.0.0.1 -p 4003 -d public
```

If [authentication](./authentication.md) has been set at server side, use `-U` to specify username and input password when prompted.

```shell
# replace greptime_user with your account username
$ psql -h localhost -p 4003 -U greptime_user -d public
```

## HTTP API

GreptimeDB supports sending SQL statements through HTTP API. For information on how to set up authentication, please refer to [HTTP API](./http-api.md).

## Write Data

Please refer to [SQL](../write-data/sql.md).

## Query Data

Please refer to [SQL](../query-data/sql.md).
