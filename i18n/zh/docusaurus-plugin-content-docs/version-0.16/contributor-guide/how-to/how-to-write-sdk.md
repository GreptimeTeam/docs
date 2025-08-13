---
keywords: [gRPC SDK, GreptimeDatabase, GreptimeRequest, GreptimeResponse, 插入请求]
description: 介绍如何为 GreptimeDB 开发一个 gRPC SDK，包括 GreptimeDatabase 服务的定义、GreptimeRequest 和 GreptimeResponse 的结构。
---

# 如何为 GreptimeDB 开发一个 gRPC SDK

GreptimeDB 的 gRPC SDK 只需要处理写请求即可。读请求是标准 SQL 或 PromQL，可以由任何 JDBC 客户端或 Prometheus
客户端处理。这也是为什么所有的 GreptimeDB SDK 都命名为 "`greptimedb-ingester-<language>`"。请确保你的 GreptimeDB SDK
遵循相同的命名约定。

## `GreptimeDatabase` 服务

GreptimeDB 自定义了一个 gRPC 服务：`GreptimeDatabase`
。你只需要实现这个服务即可。你可以在[这里](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/database.proto)
找到它的 Protobuf 定义。

`GreptimeDatabase` 有 2 个 RPC 方法：

```protobuf
service GreptimeDatabase {
  rpc Handle(GreptimeRequest) returns (GreptimeResponse);

  rpc HandleRequests(stream GreptimeRequest) returns (GreptimeResponse);
}
```

`Handle` 方法是一个 unary 调用：当 GreptimeDB 服务接收到一个 `GreptimeRequest` 请求后，它立刻处理该请求并返回一个相应的
`GreptimeResponse`。

`HandleRequests` 方法则是一个 "[Client Streaming RPC][3]" 方式的调用。
它可以接受一个连续的 `GreptimeRequest` 请求流，持续地发给 GreptimeDB 服务。
GreptimeDB 服务会在收到流中的每个请求时立刻进行处理，并最终（流结束时）返回一个总结性的 `GreptimeResponse`。
通过 `HandleRequests`，我们可以获得一个非常高的请求吞吐量。

### `GreptimeRequest`

`GreptimeRequest` 是一个 Protobuf 消息，定义如下：

```protobuf
message GreptimeRequest {
  RequestHeader header = 1;
  oneof request {
    InsertRequests inserts = 2;
    QueryRequest query = 3;
    DdlRequest ddl = 4;
    DeleteRequests deletes = 5;
    RowInsertRequests row_inserts = 6;
    RowDeleteRequests row_deletes = 7;
  }
}
```

`RequestHeader` 是必需，它包含了一些上下文，鉴权和其他信息。"oneof" 的字段包含了发往 GreptimeDB 服务的请求。

注意我们有两种类型的插入请求，一种是以 "列" 的形式（`InsertRequests`），另一种是以 "行" 的形式（`RowInsertRequests`
）。通常我们建议使用 "行" 的形式，因为它对于表的插入更自然，更容易使用。但是，如果需要一次插入大量列，或者有大量的 "null"
值需要插入，那么最好使用 "列" 的形式。

### `GreptimeResponse`

`GreptimeResponse` 是一个 Protobuf 消息，定义如下：

```protobuf
message GreptimeResponse {
  ResponseHeader header = 1;
  oneof response {AffectedRows affected_rows = 2;}
}
```

`ResponseHeader` 包含了返回值的状态码，以及错误信息（如果有的话）。"oneof" 的字段目前只有 "affected rows"。

GreptimeDB 现在有很多 SDK，你可以参考[这里](https://github.com/GreptimeTeam?q=ingester&type=all&language=&sort=)获取一些示例。
