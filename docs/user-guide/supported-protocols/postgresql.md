# PostgreSQL

GreptimeDB supports PostgreSQL wire protocol, which allows you to execute queries after connecting DB instances with the standard PostgreSQL client.
standard PostgreSQL client to connect to DB instances and execute
queries. Note that when writing SQL queries, GreptimeDB follows MySQL dialect
instead of PostgreSQL.

Both simple and extended query subprotocols are supported, except for those
like rust-postgres, which is in our backlog.

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

You can use the Postgres JDBC connector by specifying host, port, dbname. 
If authentication is enabled, then you can also specify username and password. 

```java
String url = "jdbc:postgresql://localhost:4003/public";
Connection conn = DriverManager.getConnection(url);
```

### Python

GreptimeDB is compatible with both [psycopg](https://www.psycopg.org/docs/) and
 psycopg2. When using psycopg, don't forget to turn on `autocommit`.


```python
import psycopg

conn = psycopg.connect("host=127.0.0.1 port=4003 dbname=public")
conn.set_session(autocommit=True)
```
