---
keywords: [PostgreSQL, 连接信息, psql 工具, 连接字符串, GreptimeCloud]
description: 介绍如何使用 PostgreSQL 协议连接到 GreptimeCloud，包括连接信息、使用 psql 工具和连接字符串示例。
---

# PostgreSQL

GreptimeCloud 支持用 PostgreSQL v3 协议访问 GreptimeDB。大多数标准客户端和驱动程序在协议级别上兼容，且连接使用 TLS 加密。
请注意，我们在 GreptimeDB 中不使用 Postgres 的 SQL 方言，因此可能有一些不支持的语句。
有关更多信息，请参考 GreptimeDB 的[Postgresql 文档](https://docs.greptime.cn/user-guide/protocols/postgresql)。

要使用 Postgres 协议连接到 GreptimeCloud，请使用以下信息：

- Host: `<host>`
- Port: `4003`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

## `psql`

使用 PostgreSQL 自带的默认 CLI 工具：

``` shell
psql -h <host> -p 4003 -U <username> -d <dbname> -W
```

## Postgres 连接字符串

使用以下连接字符串与兼容的客户端库（如 psycopg、rust-postgres 等）连接。

```
host=<host> port=4003 dbname=<dbname> user=<username> password=<password>
```

## URL

在你的 Postgres JDBC 客户端使用以下 URL。

```
jdbc:postgresql://<host>:4003/<dbname>?user=<username>&password=<password>&ssl=true
```

如果你使用 Python 等语言的数据库客户端，也可以通过这个 URL 连接到服务

```
postgresql://<username>:<password>@<host>:4003/<dbname>
```

## Postgres 外部表

将 GreptimeCloud 实例配置外 Postgres 外部数据源。注意依据你的配置修改下方的服务
器名和用户名。

```sql
CREATE SERVER greptimedb
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host '<host>', dbname '<dbname>', port '4003');

CREATE USER MAPPING FOR postgres
SERVER greptimedb
OPTIONS (user '<username>', password '<password>');
```
