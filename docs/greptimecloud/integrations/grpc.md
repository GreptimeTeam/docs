# gRPC

Using GreptimeDB gRPC SDK to connect to GreptimeCloud. For more information about the SDK, see [how to install](https://docs.greptime.com/user-guide/clients/grpc), [write data](https://docs.greptime.com/user-guide/write-data/grpc) and [query data](https://docs.greptime.com/user-guide/query-data/grpc).

To connect to GreptimeCloud, using information below:

- Host: `<host>`
- Port: `4001`
- Database: `<dbname>`
- Username: `<username>`
- Password: *Your GreptimeCloud service password*

## Java SDK

The following code snippet shows how to create a client using Java SDK.

```java
String endpoint = "<host>:4001";
AuthInfo authInfo = new AuthInfo("<username>", "*Your GreptimeCloud service password*");

GreptimeOptions opts = GreptimeOptions.newBuilder(endpoint) //
        .authInfo(authInfo)
        .writeMaxRetries(1) //
        .readMaxRetries(2) //
        .routeTableRefreshPeriodSeconds(-1) //
        .build();

GreptimeDB greptimeDB = new GreptimeDB();

if (!greptimeDB.init(opts)) {
    throw new RuntimeException("Fail to start GreptimeDB client");
}
```

After creating a GreptimeDB client, you can set database while writing data or querying data. For example query data:

```java
QueryRequest request = QueryRequest.newBuilder() //
        .exprType(SelectExprType.Sql) //
        .ql("SELECT * FROM monitor;") //
        .databaseName("<dbname>") //
        .build();
```

## Go SDK

The following code shows how to create a client using Go SDK.

```go
options := []grpc.DialOption{
    grpc.WithTransportCredentials(insecure.NewCredentials()),
}

cfg := greptime.NewCfg("<host>").
    WithDatabase("<dbname>").
    WithPort(4001).
    WithAuth("<username>", "*Your GreptimeCloud service password*").
    WithDialOptions(options...). // specify your gRPC dail options
    WithCallOptions()            // specify your gRPC call options

client, err := greptime.NewClient(cfg)
if err != nil {
    panic("failed to init client")
}
```
