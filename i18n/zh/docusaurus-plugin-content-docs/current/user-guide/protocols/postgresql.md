# PostgreSQL

## 连接数据库

你可以通过端口 `4003` 使用 PostgreSQL 连接到 GreptimeDB。
只需在命令中添加 `-U` 参数，后跟你的用户名和密码。以下是一个示例：

```shell
psql -h <host> -p 4003 -U <username> -d public
```

- 请参考[鉴权认证](/user-guide/deployments/authentication.md) 来设置 GreptimeDB 的用户名和密码。
- 如果你想使用其他端口连接 PostgreSQL，请参考配置文档中的[协议选项](/user-guide/deployments/configuration.md#协议选项)。

## 管理表

请参考[管理表](/user-guide/administration/manage-data/basic-table-operations.md)。

## 写入数据

请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md).

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

有关时区如何影响数据的插入和查询，请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md#时区)和[查询数据](/user-guide/query-data/sql.md#时区)中的 SQL 文档。
