# 时区

GreptimeDB 支持多种协议，每种协议都有其配置时区的方法。
本指南是如何为 GreptimeDB 支持的不同协议和语言设置时区的概述。

默认情况下，GreptimeDB 在 UTC 0 时区运行。
如果需要更改时区，请按照特定协议或客户端的说明进行操作。

## MySQL 客户端

### 命令行

要通过 MySQL 命令行客户端配置时区，请参阅 MySQL 协议文档中的[时区章节](/user-guide/protocols/mysql.md#time-zone)。

### MySQL 驱动程序

对于在 Java 或 Go 中使用 MySQL 驱动程序的应用程序，可以在 SQL 工具文档的[时区章节](/reference/sql-tools.md#time-zone)中找到详细说明。

## PostgreSQL 客户端

要为 PostgreSQL 客户端配置时区，请参阅 PostgreSQL 协议文档中的[时区章节](/user-guide/protocols/postgresql.md#time-zone)。

## HTTP API

使用 HTTP API 时，可以通过头参数指定时区。有关更多信息，请参阅[HTTP API 文档](/user-guide/protocols/http.md#time-zone)。

## 时区对 SQL 语句的影响

客户端中的时区设置会影响数据的写入和查询。

### 写入数据

客户端中设置的时区会影响数据的写入。有关更多信息，请参阅[写入数据](/user-guide/ingest-data/for-iot/sql.md#time-zone)。
此外，表 schema 中的默认写入的时间戳值也会受到客户端时区的影响，影响方式与数据写入相同。

### 查询数据

时区设置也会影响数据的查询。
有关详细信息，请参阅[查询数据](/user-guide/query-data/sql.md#time-zone)。

