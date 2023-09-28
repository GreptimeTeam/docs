# MySQL

GreptimeCloud exposes GreptimeDB access in MySQL server-client protocol. Most
standard clients and drivers are compatible and the connection is encrypted with TLS.
Refer to [MySQL client](https://docs.greptime.com/user-guide/clients/mysql) of GreptimeDB for more information.

To connect to GreptimeCloud in MySQL protocol, using information below:

- Host: `<host>`
- Port: `4002`
- Database: `<dbname>`
- Username: `<username>`
- Password: *Your GreptimeCloud service password*

## MySQL CLI

Connect to GreptimeCloud service instance using `mysql` CLI.

```shell
mysql --ssl-mode=REQUIRED -u <username> -p -h <host> -P 4002 -A <dbname>
```

## MariaDB CLI

MariaDB's CLI has slightly different `ssl` option with original MySQL

```shell
mysql --ssl -u <username> -p -h <host> -P 4002 -A <dbname>
```

## JDBC URL

Use following connect string for your JDBC client. Replace *PASSWORD* with the
GreptimeCloud service password.

```
jdbc:mysql://<host>:4002/<dbname>?user=<username>&password=PASSWORD
```
