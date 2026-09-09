---
keywords: [gRPC SDK, GreptimeDatabase, GreptimeRequest, GreptimeResponse, 插入请求]
description: 介绍 GreptimeDB gRPC 写入 SDK 需要遵守的协议契约和错误处理要求。
---

# 如何为 GreptimeDB 开发一个 gRPC SDK

GreptimeDB 的公开 gRPC SDK 是写入客户端。查询通常通过标准 SQL 或 PromQL 客户端完成。除非有单独需求，新 SDK 应聚焦写入和删除，并遵循 `greptimedb-ingester-<language>` 命名约定。面向用户的 API 参见 [gRPC SDK 概述](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md)。

## `GreptimeDatabase` 服务

从 [`GreptimeDatabase` Protobuf 定义](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/database.proto)生成客户端 stub，不要在 SDK 中手写一份 message 或 service 定义。

该 service 提供一个 unary method 和一个 client-streaming method：

```protobuf
service GreptimeDatabase {
  rpc Handle(GreptimeRequest) returns (GreptimeResponse);

  rpc HandleRequests(stream GreptimeRequest) returns (GreptimeResponse);
}
```

`Handle` 对一个请求返回一个响应，是 SDK insert 和 delete API 通常使用的方法。

`HandleRequests` 是 [client-streaming RPC](https://grpc.io/docs/what-is-grpc/core-concepts/#client-streaming-rpc)。客户端关闭请求流后，服务端才返回累计响应。SDK 如果暴露 streaming API，需要明确这个确认边界，并将一个 stream 绑定到一个 endpoint。

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

客户端需要在 `RequestHeader` 中填写服务端要求的 database context 和认证信息，并且只能设置一个 request variant。

该 message 还包含供内部调用者使用的 query 和 DDL variant。公开 ingester API 不应暴露它们，因为 `GreptimeDatabase` 不返回 query result stream。

GreptimeDB 同时接受行式 `RowInsertRequests` 和列式 `InsertRequests`。公开写入 API 默认使用行式请求。面向列的客户端可以使用列式请求，但转换过程中必须保持列长度一致，并保留 null、时间戳精度、数据类型和列 semantic type。

删除同样区分行式和列式。SDK 只应暴露能够在不丢失类型信息的前提下完成映射的形式。

### `GreptimeResponse`

`GreptimeResponse` 是一个 Protobuf 消息，定义如下：

```protobuf
message GreptimeResponse {
  ResponseHeader header = 1;
  oneof response {AffectedRows affected_rows = 2;}
}
```

成功响应包含 success header 和 `affected_rows`。该值表示服务端确认的行数；关闭请求流时返回的是累计值。

请求失败通过 gRPC status 返回。Trailing metadata 中的 `x-greptime-err-code` 在存在时提供 GreptimeDB error code，错误文本则由 status message 携带。SDK 应保留 gRPC status 并暴露 GreptimeDB error code，不能用一个通用 SDK error 将其覆盖。

## 重试与交付语义

重试次数必须有上限，并且对调用者可见。只有错误被标记为 retryable 且 deadline 仍允许时，才能重试 unary request。Cancellation 和 deadline expiration 不应重试。

响应丢失不代表服务端拒绝了写入。除非调用者的数据模型保证操作幂等，重试这类请求可能插入重复行。SDK 需要说明这一点，并在交付结果不确定时返回最终错误。

不要自动重试只发送了一部分的 `HandleRequests` stream。即使客户端尚未收到累计响应，服务端也可能已经接受了部分请求。此时应关闭失败的 stream，并将不确定状态返回给调用者。

Arrow Flight bulk ingestion 与 `GreptimeDatabase` RPC 应使用不同的 API。它的 batching 和 partial acceptance 需要独立的契约。

可以参考现有 [GreptimeDB ingester 仓库](https://github.com/GreptimeTeam?q=ingester&type=all&language=&sort=)的公开 API 约定，但线上行为应以当前 Protobuf 定义和服务端契约为准。
