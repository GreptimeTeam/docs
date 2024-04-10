# MySQL

GreptimeCloud exposes GreptimeDB access in MySQL server-client protocol. Most
standard clients and drivers are compatible and the connection is encrypted with TLS.
Refer to [MySQL client](https://docs.greptime.com/user-guide/clients/mysql) of GreptimeDB for more information.

To connect to GreptimeCloud in MySQL protocol, using information below:

- Host: `<host>`
- Port: `4002`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

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

## URL

Use following connect string for your JDBC client.

```text
jdbc:mysql://<host>:4002/<dbname>?user=<username>&password=<password>
```

And if you are using client like Python, use following url to connect to your
instance.

```text
mysql://<username>:<password>@<host>:4002/<dbname>
```
