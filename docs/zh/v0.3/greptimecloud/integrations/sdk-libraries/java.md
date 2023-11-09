# Java SDK

GreptimeDB Java SDK 使用 gRPC 与数据库通信，
请参考 [Java SDK 文档](https://docs.greptime.cn/v0.3/user-guide/clients/sdk-libraries/java)查看更多 SDK 使用的相关内容。

请使用以下信息连接到 GreptimeCloud：

- Host: `<host>`
- Port: `4001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

下方的代码片段展示了如何使用 Java SDK 建立一个 `client` 连接对象：

```java
String endpoint = "<host>:4001";
AuthInfo authInfo = new AuthInfo("<username>", "<password>");

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
