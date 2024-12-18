---
keywords: [Java SDK, gRPC, database connection, authentication]
description: Instructions on how to use the GreptimeDB Java SDK to connect to GreptimeCloud using gRPC.
---

# Java SDK

The GreptimeDB Java ingester library utilizes gRPC for writing data to the database. For how to use the library, please refer to the [Java library documentation](https://docs.greptime.com/user-guide/ingest-data/for-iot/grpc-sdks/java).

To connect to GreptimeCloud, using information below:

- Host: `<host>`
- Port: `5001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

The following code snippet shows how to connect to database:

```java
String database = "<dbname>";
String[] endpoints = {"<host>:5001"};
AuthInfo authInfo = new AuthInfo("<username>", "<password>");
GreptimeOptions opts = GreptimeOptions.newBuilder(endpoints, database)
        .authInfo(authInfo)
        .tlsOptions(new TlsOptions())
        .build();
GreptimeDB client = GreptimeDB.create(opts);
```
