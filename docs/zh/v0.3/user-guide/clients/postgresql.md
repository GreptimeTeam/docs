# PostgreSQL

## 连接数据库

GreptimeDB 支持 PostgreSQL 协议。要连接到 GreptimeDB，只需要在 `psql` 命令行工具中添加 `-U` 参数，后面跟上你的用户名。例如：

```shell
❯ psql -h localhost -p 4003 -U greptime_user -d public
Password for user greptime_user:
psql (15.2, server 0.1.1)
WARNING: psql major version 15, server major version 0.1.
         Some psql features might not work.
Type "help" for help.

public=>
```

记得将示例中的 `greptime_user(username)` 和 `greptime_pwd(password)` 替换成自己的用户名和密码。

## HTTP API

GreptimeDB 支持通过 HTTP API 发送 SQL 语句。要在 HTTP 请求中设置鉴权，请参考 [HTTP API](./http-api.md)。

## 写入数据

请参考 [写入数据](../write-data/sql.md).

## 读取数据

请参考 [读取数据](../query-data/sql.md).
