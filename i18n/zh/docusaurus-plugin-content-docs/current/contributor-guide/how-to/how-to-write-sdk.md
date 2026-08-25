---
keywords: [gRPC ingester SDK, GreptimeDatabase, RowInsertRequests, streaming RPC]
description: 介绍 GreptimeDB gRPC ingester SDK 的协议和可靠性要求。
---

# 如何为 GreptimeDB 开发一个 gRPC SDK

本文面向基于 GreptimeDB 原生 gRPC database service 的 **ingester SDK**，不涵盖查询 driver 和 client。官方写入库统一采用 `greptimedb-ingester-<language>` 命名。

消息和 client 代码应由版本化的 [greptime-proto](https://github.com/GreptimeTeam/greptime-proto) 定义生成，不要在 SDK 中复制 message layout。生成的协议 package 应与提供给应用代码的 row 和 batch API 分离。

## `GreptimeDatabase` 服务

[`database.proto`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/database.proto) 定义了两个 RPC 方法：

```protobuf
service GreptimeDatabase {
  rpc Handle(GreptimeRequest) returns (GreptimeResponse);
  rpc HandleRequests(stream GreptimeRequest) returns (GreptimeResponse);
}
```

`Handle` 是 unary RPC。`HandleRequests` 是 [client-streaming RPC](https://grpc.io/docs/what-is-grpc/core-concepts/#client-streaming-rpc)：client 发送一组 request stream，关闭发送端，再接收一个汇总 response。生产 SDK 应使用有界缓冲和 gRPC flow control，不能在内存中无限累积 batch。

协议没有 request 级 idempotency key，因此 SDK 不能承诺 exactly-once ingestion。传输故障导致服务端结果未知时，自动重试可能在保留重复行的表配置中写入重复数据；重试行为必须显式暴露给调用方。

### `GreptimeRequest`

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

写入优先使用 `RowInsertRequests`。每个 `RowInsertRequest` 指定一张表，并携带一个 `Rows` schema 和对应数据行。发送前应校验列数、数据类型、semantic type 及 null 表示，避免 client 构造错误变成难以定位的服务端错误。较早的列式 `InsertRequests` 仍作为兼容协议保留。

每个 request 都包含 `RequestHeader`。SDK 配置指定相关值时，应填写目标 Catalog、Schema、认证 header、时区和 W3C tracing context。调用方显式选择 Catalog 或 Schema 后，不能静默替换为 client 默认值。

### `GreptimeResponse`

```protobuf
message GreptimeResponse {
  ResponseHeader header = 1;
  oneof response {
    AffectedRows affected_rows = 2;
  }
}
```

gRPC 传输成功不代表数据库操作成功。SDK 必须检查 `ResponseHeader.status`，把非成功 status code 和 `err_msg` 转换为 SDK error，随后才能返回 `affected_rows`。底层 gRPC status 应与 GreptimeDB response status 分开保留，使调用方能够区分传输故障和服务端请求错误。

Protobuf client 还必须容忍未知字段及未设置的 response variant。兼容性测试应覆盖支持版本的序列化消息；集成测试应覆盖 unary 写入、client streaming、认证错误、stream 中途失败和服务端 status 传递。
