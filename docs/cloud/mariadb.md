# MariaDB

GreptimeCloud exposes GreptimeDB access in MariDB(MySQL) server-client
protocol. Most standard clients and drivers are compatible.

The connection is encrypted with TLS. `database` is required when connect using
MySQL protocol.

## `mysql`

Connect to GreptimeCloud service instance using `mysql` cli.

```
mysql --ssl -u <user> -p -h <host> -P 4002 -A <dbname>
```
