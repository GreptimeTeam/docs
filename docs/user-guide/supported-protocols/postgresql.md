# PostgreSQL

GreptimeDB supports PostgreSQL wire protocol, which allows you to execute
queries after connecting DB instances with standard PostgreSQL clients and
language drivers.

Note that when writing SQL queries, GreptimeDB follows MySQL dialect
instead of PostgreSQL.

Clients relies on parameter type inference, like rust-postgres, is partially
supported and on our backlog.

## Using psql

Connect to GreptimeDB with standard `psql` client:

```shell
psql -h 127.0.0.1 -p 4003 -d public
```

When running GreptimeDB in standalone mode, the default port of PostgreSQL
protocol is `4003`.

## Using language drivers

### Java

You can use the Postgres JDBC connector by specifying host, port, dbname.
If authentication is enabled, then you can also specify username and password.

```java
String url = "jdbc:postgresql://localhost:4003/public";
Connection conn = DriverManager.getConnection(url);

## use standard JDBC API or any framework on `conn`
```

### Python

GreptimeDB is compatible with both [psycopg](https://www.psycopg.org/docs/) and
 psycopg2. When using psycopg, don't forget to turn on `autocommit`.


```python
import psycopg

conn = psycopg.connect("host=127.0.0.1 port=4003 dbname=public")
conn.set_session(autocommit=True)

## get cursor from `conn` and execute your query
```
