---
keywords: [时区, 客户端会话, 数据写入, 数据查询, 时间管理, GreptimeDB, 时区设置]
description: 介绍了如何在客户端会话中指定时区，并解释了时区设置对数据写入和查询的影响。
---

# 时区

你可以在客户端会话中指定时区以方便地管理时间数据。
客户端会话中指定的时区仅应用在客户端向服务器发送请求时，
不影响存储在 GreptimeDB 服务器中的时间数据。
GreptimeDB 在数据写入或查询时，会根据指定的时区将时间值从字符串表示转换为日期时间，或转换回来。

## 在客户端中指定时区

默认情况下，所有客户端使用[默认时区配置](/user-guide/deployments-administration/configuration.md#默认时区配置)，即 UTC。
你也可以在每个客户端会话中指定时区，
这将覆盖默认的时区配置。

### MySQL 客户端

- **命令行**：有关通过 MySQL 命令行客户端配置时区的内容，请参阅 MySQL 协议文档中的[时区部分](/user-guide/protocols/mysql.md#时区)。
- **MySQL driver**：如果你使用的是 Java 或 Go 中的 MySQL driver，请查看 SQL 工具文档的[时区部分](/reference/sql-tools.md#时区)。

### PostgreSQL 客户端

要配置 PostgreSQL 客户端的时区，请参阅 PostgreSQL 协议文档中的[时区部分](/user-guide/protocols/postgresql.md#时区)。

### HTTP API

使用 HTTP API 时，你可以通过 header 参数指定时区。有关更多信息，请参阅 [HTTP API 文档](/user-guide/protocols/http.md#时区)。

### 其他客户端

对于其他客户端，你可以更改 GreptimeDB 的[默认时区配置](/user-guide/deployments-administration/configuration.md#默认时区配置)。

## 时区对 SQL 语句的影响

客户端中的时区设置会影响数据的写入和查询。

### 写入数据

客户端中设置的时区会影响数据的写入。有关更多信息，请参阅[写入数据](/user-guide/ingest-data/for-iot/sql.md#时区)。
此外，表 schema 中的默认写入的时间戳值也会受到客户端时区的影响，影响方式与数据写入相同。

### 查询数据

时区设置也会影响数据的查询。
有关详细信息，请参阅[查询数据](/user-guide/query-data/sql.md#时区)。

