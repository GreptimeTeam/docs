# gRPC

使用 GreptimeDB gRPC SDK 连接到 GreptimeCloud。有关 SDK 的更多信息，请参见[安装](https://docs.greptime.cn/user-guide/clients/grpc)、[写入数据](https://docs.greptime.cn/user-guide/write-data/grpc)和[查询数据](https://docs.greptime.cn/user-guide/query-data/grpc)。

要连接到 GreptimeCloud，请使用以下信息：

- Host: `<host>`
- Port: `4001`
- Database: `<dbname>`
- Username: `<username>`
- Password: *Your GreptimeCloud service password*

## Java SDK

下方的代码片段展示了如何使用 Java SDK 建立一个 `client` 连接对象：

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

在创建了 GreptimeDB 客户端之后，你可以在写入数据或查询数据时设置数据库。例如查询数据：

```java
QueryRequest request = QueryRequest.newBuilder() //
        .exprType(SelectExprType.Sql) //
        .ql("SELECT * FROM monitor;") //
        .databaseName("<dbname>") //
        .build();
```

## Go SDK

下方的代码片段展示了如何使用 Go SDK 建立一个 `client` 连接对象：

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
