# PostgreSQL

## 连接数据库

GreptimeDB 支持 PostgreSQL 协议。要连接到 GreptimeDB，只需要使用 `psql` 命令行工具。

```shell
# 127.0.0.1 是 GreptimeDB 服务端地址；4003 是默认的 PostgreSQL 端口
# 使用 `-d` 指定需要连接的数据库；`public` 是默认的数据库名
$ psql -h 127.0.0.1 -p 4003 -d public
```

如果服务端设置了[鉴权](./authentication.md)，使用 `-U` 来指定用户名，并根据提示输入密码。

```shell
# 将 greptime_user 替换成设定的用户名
$ psql -h localhost -p 4003 -U greptime_user -d public
```

## HTTP API

GreptimeDB 支持通过 HTTP API 发送 SQL 语句。要在 HTTP 请求中设置鉴权，请参考 [HTTP API](./http-api.md)。

## 写入数据

请参考 [写入数据](../write-data/sql.md).

## 读取数据

请参考 [读取数据](../query-data/sql.md).
