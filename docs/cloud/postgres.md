# Postgresql

GreptimeCloud exposes GreptimeDB access in PostgreSQL v3 protocol. Most standard
clients and drivers are compatible.

The connection is encrypted with TLS.

## `psql`

The default cli tool bundled with PostgreSQL.

```
psql -h <host> -p <port> -U <user> -d <dbname> -W
```
