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

## 管理表

请参考 [管理表](../table-management.md)。

## 写入数据

请参考 [写入数据](../ingest-data/for-iot/sql.md).

## 读取数据

请参考 [读取数据](../query-data/sql.md).

## 时区

GreptimeDB 的 PostgreSQL 协议遵循原始 PostgreSQL 的 [时区处理方式](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES)。

默认情况下，PostgreSQL 使用服务器的时区来处理时间戳。
你可以使用 SQL 语句 `SET TIMEZONE TO '<value>';` 为当前会话设置 `time_zone` 变量来覆盖服务器时区。
`time_zone` 的值可以是：

- 时区的全称，例如 `America/New_York`。
- 时区的缩写，例如 `PST`。
- UTC 的偏移量，例如 `+08:00`。

你可以使用 `SHOW` 来查看当前的时区设置。例如：

```sql
SHOW VARIABLES time_zone;
```

```sql
 TIME_ZONE 
-----------
 UTC
```

将会话时区更改为 `+1:00`：

```SQL
SET TIMEZONE TO '+1:00'
```

有关时区如何影响数据的插入和查询，请参考[写入数据](../ingest-data/for-iot/sql.md#时区)和[查询数据](../query-data/sql.md#时区)中的 SQL 文档。

