# Java SDK

The GreptimeDB Java SDK uses gRPC to communicate with the database. For more information on how to use the SDK, please refer to the [Java SDK documentation](https://docs.greptime.com/user-guide/clients/sdk-libraries/java).

To connect to GreptimeCloud, using information below:

- Host: `<host>`
- Port: `4001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

The following code snippet shows how to create a client.

```java
String endpoint = "<host>:4001";
AuthInfo authInfo = new AuthInfo("<username>", "<password>");

GreptimeOptions opts = GreptimeOptions.newBuilder(endpoint)
        .authInfo(authInfo)
        .writeMaxRetries(1)
        .readMaxRetries(2)
        .routeTableRefreshPeriodSeconds(-1)
        .build();

GreptimeDB greptimeDB = new GreptimeDB();

if (!greptimeDB.init(opts)) {
    throw new RuntimeException("Fail to start GreptimeDB client");
}
```

After creating a GreptimeDB client, you can set database while writing data or querying data. For example query data:

```java
QueryRequest request = QueryRequest.newBuilder()
        .exprType(SelectExprType.Sql)
        .ql("SELECT * FROM monitor;")
        .databaseName("<dbname>")
        .build();
```
