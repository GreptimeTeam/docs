# MySQL

GreptimeCloud 在 MySQL 服务器-客户端协议中公开了 GreptimeDB 访问。大多数标准客户端和驱动程序都兼容。
有关更多信息，请参阅 GreptimeDB 的 [MySQL 客户端](https://docs.greptime.com/user-guide/clients/mysql)。

连接使用 TLS 加密。
使用 MySQL 协议连接时需要 `database`。
要连接到 GreptimeCloud，使用以下信息：

- 主机：`<host>`
- 端口：`4002`
- 数据库：`<dbname>`
- 用户名：`<username>`
- 密码：*您的 GreptimeCloud 服务密码*

## MySQL CLI

使用 `mysql` CLI 连接到 GreptimeCloud 服务实例。

```
mysql --ssl-mode=REQUIRED -u <username> -p -h <host> -P 4002 -A <dbname>
```

## MariaDB CLI

MariaDB's CLI has slightly different `ssl` option with original MySQL

```
mysql --ssl -u <username> -p -h <host> -P 4002 -A <dbname>
```

## JDBC URL

Use following connect string for your JDBC client. Replace *PASSWORD* with the
GreptimeCloud service password.

```
jdbc:mysql://<host>:4002/<dbname>?user=<username>&password=PASSWORD
```
