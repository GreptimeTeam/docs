# PostgreSQL

## Using psql

Currently we have PostgreSQL [simple query subprotocol] supported on GreptimeDB. You can connect to
GreptimeDB with standard `psql` client:

```shell
psql -h 127.0.0.1 -p 5432
```

When running in standalone mode, the default port of PostgreSQL protocol is `5432`. While it's
`4003`.

## Using database connectors

When using database connectors, you need to add url parameter `preferQueryMode=simple` for now.

Java example

```java
String url = "jdbc:postgresql://localhost/test?preferQueryMode=simple";
Connection conn = DriverManager.getConnection(url);
```

Python example[WIP]

## Upcoming features

We are going to add these features to our postgresql protocol support:

- Extended Query subprotocol: enables full support of prepared statement
- TLS
