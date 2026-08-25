---
keywords: [gRPC ingester SDK, GreptimeDatabase, RowInsertRequests, streaming RPC]
description: Protocol and reliability requirements for a GreptimeDB gRPC ingester SDK.
---

# How to write a gRPC SDK for GreptimeDB

This guide covers an **ingester SDK** built on GreptimeDB's native gRPC database service. Query drivers and clients are outside its scope. Official ingester libraries use the `greptimedb-ingester-<language>` naming pattern.

Generate message and client code from the versioned [greptime-proto](https://github.com/GreptimeTeam/greptime-proto) definitions rather than copying message layouts into an SDK. Keep the generated protocol package separate from the ergonomic row and batch APIs exposed to application code.

## `GreptimeDatabase` Service

[`database.proto`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/database.proto) defines two RPC methods:

```protobuf
service GreptimeDatabase {
  rpc Handle(GreptimeRequest) returns (GreptimeResponse);
  rpc HandleRequests(stream GreptimeRequest) returns (GreptimeResponse);
}
```

`Handle` is a unary RPC. `HandleRequests` is a [client-streaming RPC](https://grpc.io/docs/what-is-grpc/core-concepts/#client-streaming-rpc): the client sends a stream of requests, closes its send side, and receives one summarized response. A production SDK should apply bounded buffering and gRPC flow control rather than accumulating an unbounded batch in memory.

The protocol has no request-level idempotency key. An SDK must not promise exactly-once ingestion. If a transport failure leaves the server outcome unknown, an automatic retry can duplicate data for table configurations that retain duplicate rows; make retry behavior explicit to callers.

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

For ingestion, prefer `RowInsertRequests`. Each `RowInsertRequest` names one table and carries a `Rows` schema plus row values. Validate column count, data type, semantic type, and null representation before sending so client-side construction errors do not become opaque server errors. The older column-oriented `InsertRequests` remains part of the protocol for compatibility.

Every request includes a `RequestHeader`. Populate the target catalog and schema, authentication header, timezone, and W3C tracing context when the corresponding SDK option is set. Do not silently replace an explicitly selected catalog or schema with a client default.

### `GreptimeResponse`

```protobuf
message GreptimeResponse {
  ResponseHeader header = 1;
  oneof response {
    AffectedRows affected_rows = 2;
  }
}
```

Successful gRPC transport does not by itself mean the database operation succeeded. Inspect `ResponseHeader.status`, map non-success status codes and `err_msg` into the SDK's error type, and return `affected_rows` only after that check. Preserve the underlying gRPC status separately from a GreptimeDB response status so callers can distinguish transport failures from server-side request errors.

Protobuf clients must also tolerate unknown fields and an unset response variant. Add compatibility tests using serialized messages from the supported protocol versions, plus integration tests for unary writes, client streaming, authentication errors, partial stream failure, and server status propagation.
