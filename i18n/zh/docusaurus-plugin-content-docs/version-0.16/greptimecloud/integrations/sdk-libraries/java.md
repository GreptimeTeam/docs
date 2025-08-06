---
keywords: [Java SDK, gRPC 协议, 数据库连接, 示例代码, 认证信息]
description: 介绍如何使用 GreptimeDB Java SDK 通过 gRPC 协议连接到 GreptimeCloud，并提供了连接信息和示例代码。
---

# Java SDK

GreptimeDB Java ingester 库使用 gRPC 协议写入数据，
请参考 [Java 库文档](https://docs.greptime.cn/user-guide/ingest-data/for-iot/grpc-sdks/java)查看更多使用内容。

请使用以下信息连接到 GreptimeCloud：

- Host: `<host>`
- Port: `5001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

下方的代码片段展示了如何连接到数据库：

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
