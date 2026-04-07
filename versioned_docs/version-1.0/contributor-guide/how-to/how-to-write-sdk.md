---
keywords: [gRPC SDK, GreptimeDatabase, Handle, HandleRequests, GreptimeRequest, GreptimeResponse]
description: Explains how to write a gRPC SDK for GreptimeDB, focusing on the GreptimeDatabase service, its methods, and the structure of requests and responses.
---

# How to write a gRPC SDK for GreptimeDB

A GreptimeDB gRPC SDK only needs to handle the writes. The reads are standard SQL and PromQL, can be handled by any JDBC
client or Prometheus client. This is also why GreptimeDB gRPC SDKs are all named
like "`greptimedb-ingester-<language>`". Please make sure your GreptimeDB SDK follow the same naming convention.

## `GreptimeDatabase` Service

GreptimeDB defines a custom gRPC service called `GreptimeDatabase`. All you need to do in your SDK are implement it. You
can find its Protobuf
definitions [here](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/database.proto).

The service contains two RPC methods:

```protobuf
service GreptimeDatabase {
  rpc Handle(GreptimeRequest) returns (GreptimeResponse);

  rpc HandleRequests(stream GreptimeRequest) returns (GreptimeResponse);
}
```

The `Handle` method is for unary call: when a `GreptimeRequest` is received and processed by a GreptimeDB
server, it responds with a `GreptimeResponse` immediately.

The `HandleRequests` acts in
a "[Client streaming RPC](https://grpc.io/docs/what-is-grpc/core-concepts/#client-streaming-rpc)" style. It ingests a
stream of `GreptimeRequest`, and handles them on the fly. After all the requests have been handled, it returns a
summarized `GreptimeResponse`. Through `HandleRequests`, we can achieve a very high throughput of requests handling.

### `GreptimeRequest`

The `GreptimeRequest` is a Protobuf message defined like this:

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

A `RequestHeader` is needed, it includes some context, authentication and others. The "oneof" field contains the request
to the GreptimeDB server.

Note that we have two types of insertions, one is in the form of "column" (the `InsertRequests`), and the other is "
row" (`RowInsertRequests`). It's generally recommended to use the "row" form, since it's more natural for insertions on
a table, and easier to use. However, if there's a need to insert a large number of columns at once, or there're plenty
of "null" values to insert, the "column" form is better to be used.

### `GreptimeResponse`

The `GreptimeResponse` is a Protobuf message defined like this:

```protobuf
message GreptimeResponse {
  ResponseHeader header = 1;
  oneof response {AffectedRows affected_rows = 2;}
}
```

The `ResponseHeader` contains the response's status code, and error message (if there's any). The "oneof" response only
contains the affected rows for now.

GreptimeDB has a lot of SDKs now, you can refer to
them [here](https://github.com/GreptimeTeam?q=ingester&type=all&language=&sort=) for some examples.
