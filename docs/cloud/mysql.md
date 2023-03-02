# MySQL

GreptimeCloud exposes GreptimeDB access in MySQL server-client protocol. Most
standard clients and drivers are compatible.

The connection is encrypted with TLS. `database` is required when connect using
MySQL protocol.

## MySQL CLI

Connect to GreptimeCloud service instance using `mysql` CLI.

```
mysql --ssl-mode=REQUIRED -u <username> -p -h <host> -P 4002 -A <dbname>
```

## MariaDB CLI

MariaDB's CLI has slightly different `ssl` option with original MySQL

```
mysql --ssl -u <username> -p -h <host> -P 4002 -A <dbname>
```
