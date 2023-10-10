# MySQL

## 连接到服务端

GreptimeDB 支持 MySQL 连接协议。使用 `mysql` 客户端来连接到 GreptimeDB 服务端。

```shell
# 127.0.0.1 是 GreptimeDB 服务端的 host 地址；4002 是默认的 MySQL 协议端口
$ mysql -h 127.0.0.1 -P 4002
```

如果 GreptimeDB 服务端设置了 [鉴权](./authentication.md)，可以使用 `-u` 来设定用户名，使用 `-p` 来提示输入密码。

```shell
# 使用设定的账号名替换命令行中的 greptime_user
$ mysql -h 127.0.0.1 -P 4002 -u greptime_user -p
```

## 时区

GreptimeDB 的 MySQL 协议接口遵循原始 MySQL 服务器的 [时区处理方式](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html)。

默认情况下，MySQL 使用服务器的时区来处理时间戳。要覆盖这一行为，可以使用 SQL 语句 `SET time_zone = 'UTC';` 来为当前会话设置 `time_zone` 变量。`time_zone` 的值可以是：

- 服务器的时区：`SYSTEM`。
- UTC 的偏移量，例如 `+08:00`。
- 任何时区的命名，例如 `Europe/Berlin`。

一些 MySQL 客户端，例如 Grafana 的 MySQL 数据源，允许你为当前会话设置时区。想要知道当前设定的时区，可以通过 SQL 语句 `SELECT @@time_zone;` 来查询。

## HTTP API

GreptimeDB 支持通过 HTTP API 发送 SQL 语句。关于如何设置鉴权认证信息，请参考 [HTTP API](./http-api.md)。

## 写入数据

请参考 [写入数据](../write-data/sql.md).

## 读取数据

请参考 [读取数据](../query-data/sql.md).
