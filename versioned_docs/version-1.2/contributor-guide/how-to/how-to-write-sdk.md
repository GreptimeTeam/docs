---
keywords: [gRPC SDK, GreptimeDatabase, Handle, HandleRequests, GreptimeRequest, GreptimeResponse]
description: Protocol contracts and error-handling requirements for a GreptimeDB gRPC ingestion SDK.
---

# How to write a gRPC SDK for GreptimeDB

GreptimeDB's public gRPC SDKs are ingestion clients. Queries normally use SQL or PromQL through their standard clients. A new SDK should therefore focus on writes and deletes unless it has a separate requirement, and follow the `greptimedb-ingester-<language>` naming convention. See the [gRPC SDK overview](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md) for the user-facing API.

## `GreptimeDatabase` Service

Generate client stubs from the [`GreptimeDatabase` Protobuf definition](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/database.proto). Do not maintain a handwritten copy of the messages or service definition.

The service provides a unary method and a client-streaming method:

```protobuf
service GreptimeDatabase {
  rpc Handle(GreptimeRequest) returns (GreptimeResponse);

  rpc HandleRequests(stream GreptimeRequest) returns (GreptimeResponse);
}
```

`Handle` returns one response for one request. It is the usual choice for an SDK's insert and delete APIs.

`HandleRequests` is a [client-streaming RPC](https://grpc.io/docs/what-is-grpc/core-concepts/#client-streaming-rpc). The server returns a cumulative response only after the client closes the request stream. An SDK that exposes streaming must document this acknowledgement boundary and bind the stream to one endpoint.

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

A client must populate `RequestHeader` with the database context and authentication expected by the server. Set exactly one request variant.

The message also contains query and DDL variants used by internal callers. The public ingester API should not expose them: `GreptimeDatabase` does not return query result streams.

GreptimeDB accepts row-oriented `RowInsertRequests` and column-oriented `InsertRequests`. Row-oriented requests are the default for public ingestion APIs. A column-native client may use the column form, but it must keep column lengths consistent and preserve null values, timestamp precision, data types, and column semantic types during conversion.

Deletes have the same row-oriented and column-oriented distinction. Expose only the forms that the SDK can map without losing type information.

### `GreptimeResponse`

The `GreptimeResponse` is a Protobuf message defined like this:

```protobuf
message GreptimeResponse {
  ResponseHeader header = 1;
  oneof response {AffectedRows affected_rows = 2;}
}
```

On success, the response contains a successful header and `affected_rows`. Treat that value as the number acknowledged by the server, including the cumulative value returned when a request stream closes.

Request failures are returned as a gRPC status. When present, the trailing metadata keys `x-greptime-err-code` and `x-greptime-err-retry-hint` carry GreptimeDB's error code and retry classification. Preserve the gRPC status and expose the GreptimeDB metadata rather than replacing them with a generic SDK error.

## Retry and Delivery Semantics

Retries must be bounded and observable. A unary request may be retried only when the failure is classified as retryable and the deadline still permits it. Do not retry cancellation or deadline-expiration errors.

A lost response does not prove that the server rejected a write. Retrying such a request can insert duplicate rows unless the caller's data model makes the operation idempotent. Document this possibility and return the final error when delivery is ambiguous.

Do not transparently retry a partially sent `HandleRequests` stream. The server may already have accepted some requests even though the client has not received the cumulative response. Close the failed stream and report the ambiguity to the caller.

Keep Arrow Flight bulk ingestion separate from the `GreptimeDatabase` RPCs. Its batching and partial-acceptance behavior needs its own API contract.

Use the existing [GreptimeDB ingester repositories](https://github.com/GreptimeTeam?q=ingester&type=all&language=&sort=) to compare public API conventions, but derive wire behavior from the current Protobuf definition and server contract.
