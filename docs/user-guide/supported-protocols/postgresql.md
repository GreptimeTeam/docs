# PostgreSQL

PostgreSQL wire protocol is supported by GreptimeDB, which means you can use
standard PostgreSQL client to connect to DB instances and execute
queries. Note that when writing SQL queries, GreptimeDB follows MySQL dialect
instead of PostgreSQL.

Both simple and extended query subprotocols are supported, except for those
clients relies on parameter type inference, like rust-postgres, will be
supported later.

## Using psql

Currently we have PostgreSQL simple query subprotocol supported on
GreptimeDB. You can connect to GreptimeDB with standard `psql` client:

```shell
psql -h 127.0.0.1 -p 4003 -d public
```

When running in standalone mode, the default port of PostgreSQL protocol is
`4003`.

## Using database connectors

### Java

You can use Postgres JDBC connector by specifying host, port, dbname. Username
and password are also supported when you have authentication enabled.

```java
String url = "jdbc:postgresql://localhost:4003/public";
Connection conn = DriverManager.getConnection(url);
```

### Python

GreptimeDB now works with both [psycopg](https://www.psycopg.org/docs/) and its
legacy version, psycopg2. When using psycopg, remember to turn on `autocommit`.


```python
import psycopg

conn = psycopg.connect("host=127.0.0.1 port=4003 dbname=public")
conn.set_session(autocommit=True)
```
