# PostgreSQL

GreptimeCloud exposes GreptimeDB access in PostgreSQL v3 wire protocol. Most
standard clients and drivers are compatible at wire protocol level. Note that we
don't use Postgres' SQL dialect in GreptimeDB, so there can be some statements
that are unsupported.

The connection is encrypted with TLS.

## `psql`

The default cli tool bundled with PostgreSQL.

```
psql -h <host> -p 4003 -U <username> -d <dbname> -W
```
