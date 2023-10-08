# PostgreSQL

GreptimeCloud 支持用 PostgreSQL v3 协议访问 GreptimeDB。大多数标准客户端和驱动程序在协议级别上兼容，且连接使用TLS加密。
请注意，我们在 GreptimeDB 中不使用 Postgres 的 SQL 方言，因此可能有一些不支持的语句。
有关更多信息，请参考 GreptimeDB 的[Postgresql文档](https://docs.greptime.cn/user-guide/clients/postgresql)。

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

使用以下连接字符串与兼容的客户端库（如 psycopg、rust-postgres 等）连接。请将 *PASSWORD* 替换为 GreptimeCloud service 的密码。

```
host=<host> port=4003 dbname=<dbname> user=<username> password=PASSWORD
```

## Postgres JDBC URL

在你的 Postgres JDBC 客户端使用以下 URL，请将 *PASSWORD* 替换为 GreptimeCloud service 的密码。

```
jdbc:postgresql://<host>:4003/<dbname>?user=<username>&password=PASSOWRD&ssl=true
```
