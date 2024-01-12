# 如何为 GreptimeDB 开发一个 gRPC SDK

GreptimeDB 有 2 个 gRPC 服务。一个是 GreptimeDB 自己定义的，另一个是基于 [Apache Arrow Flight][1] 开发。
如果你想给用你熟悉的编程语言给 GreptimeDB 开发一个 gRPC SDK，请继续阅读本文。

> 目前，GreptimeDB 有 2 个 gRPC SDK，分别由 Java 和 Go 实现。参见它们的 SDK 文档：
>
> - [Java](/user-guide/client-libraries/java.md)
> - [Go](/user-guide/client-libraries/go.md)

## `GreptimeDatabase` 服务

GreptimeDB 自定义了一个 gRPC 服务：`GreptimeDatabase`。你可以在[这里][2]找到它的 protobuf 描述。
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

然而，目前 `GreptimeDatabase` 服务**只能**处理写请求。对于读请求，我们需要实现 [Apache Arrow Flight][1] 的 gRPC 客户端。

## [Apache Arrow Flight][1] 服务

首先，你可以在[这个][2]仓库里找到 GreptimeDB 请求和响应的 protobuf 描述。
同时建议阅读那个仓库的 README 的 "For SDK developers" 部分。

确认 Arrow Flight RPC 官方支持你使用的编程语言。当前支持的有 C++, Java, Go, C# 和 Rust。
未来它可能支持其他语言，所以请留意它的 [Implementation Status][4]。
如果你没有找到官方支持的语言，就只能从 Arrow Flight RPC 的原始 protobuf [定义][5]开始写 gRPC 客户端了。

现在请关注 Arrow Flight gRPC 服务的 `DoGet` 方法。该方法是所有 GreptimeDB 请求的入口。

`DoGet` 方法定义如下：

```protobuf
  rpc DoGet(Ticket) returns (stream FlightData) {}
```

要发送一个 GreptimeDB 请求，首先将其序列化为字节。然后将这些字节封装进一个 protobuf 的 `Ticket` 消息：

```protobuf
message Ticket {
  bytes ticket = 1;
}
```

处理 GreptimeDB 的响应有一些复杂。`DoGet` 是一个 "[Server Streaming RPC][6]"，它返回一个 `FlightData` 流。
`FlightData` 的 protobuf 定义是：

```protobuf
message FlightData {

  /*
   * The descriptor of the data. This is only relevant when a client is
   * starting a new DoPut stream.
   */
  FlightDescriptor flight_descriptor = 1;

  /*
   * Header for message data as described in Message.fbs::Message.
   */
  bytes data_header = 2;

  /*
   * Application-defined metadata.
   */
  bytes app_metadata = 3;

  /*
   * The actual batch of Arrow data. Preferably handled with minimal-copies
   * coming last in the definition to help with sidecar patterns (it is
   * expected that some implementations will fetch this field off the wire
   * with specialized code to avoid extra memory copies).
   */
  bytes data_body = 1000;
}
```

各字段的说明如下：

- `flight_descriptor` 可忽略。
- `data_header` 必须首先反序列化到 `Message` [FlatBuffer](https://github.com/google/flatbuffers) 消息。
  其定义可见 "[message.fbs][7]"。`Message` 的 header type 决定了下面两个字段如何解析。
- `app_metadata` 包含了 GreptimeDB 的自定义数据。
  该字段只在客户端发送了写请求（比如 `InsertRequest` 或 `Insert Into` SQL）之后有值。
  当 `app_metadata` 非空时，`Message` 的 header type 是 `None`。
  - `app_metadata` 可以反序列化为 [`FlightMetadata`][8]。
  - 对写请求的响应，`FlightMetadata` 只包含了 "Affected Rows"。就像 `Insert Into` SQL 在 MySQL 的返回值一样。
    如果你不关注这个返回值，可以忽略 `app_metadata` 字段。
- 当 `Message` 的 header type 是 `Schema` 或 `Recordbatch` 时，`data_body` 带有读请求的实际返回数据。
  你可以解析 `DoGet` 接口返回的 `FlightData` 流来得到完整的读请求结果。
  通常情况下，`FlightData` 流的首个元素是整个读请求结果的 schema。剩下的元素则是 recordbatch。
  schema 用于解析后续的 recordbatch，需要保存在某个上下文中。

这里我们提供了一个解析 `DoGet` 返回的 `FlightData` 流的伪代码例子：

```txt
Context {
  schema: Schema
}

Result {
  affected_rows: int
  recordbatches: List<Recordbatch>
}

function decode_do_get_stream(flight_datas: List<FlightData>) -> Result {
  result = Result
  context = Context

  for flight_data in flight_datas {
    decode(flight_data, context, result);
  }

  return result;
}

function decode(flight_data: FlightData, context: Context, result: Result) {
  message = Message::deserialize(flight_data.data_header);

  switch message.header_type {
    case None:
      flight_metadata = FlightMetadata::deserialize(flight_data.app_metadata);

      result.affected_rows = flight_metadata.affected_rows;

    case Schema:
      context.schema = Schema::deserialize(flight_data.data_body);

    case Recordbatch:
      recordbatch = Recordbatch::deserialize(
        flight_data.data_body,
        context.schema
      );

      result.recordbatches.push(recordbatch);
  }
}
```

你也可以参考我们的 [Rust client][9] 对 `FlightData` 的解析方式。

[1]: https://arrow.apache.org/docs/format/Flight.html
[2]: https://github.com/GreptimeTeam/greptime-proto
[3]: https://grpc.io/docs/what-is-grpc/core-concepts/#client-streaming-rpc
[4]: https://arrow.apache.org/docs/status.html#flight-rpc
[5]: https://arrow.apache.org/docs/format/Flight.html#protocol-buffer-definitions
[6]: https://grpc.io/docs/what-is-grpc/core-concepts/#server-streaming-rpc
[7]: https://github.com/apache/arrow/blob/4f06beb737c3d1401e011e0a2ef33b159ab25995/format/Message.fbs#L150
[8]: https://github.com/GreptimeTeam/greptime-proto/blob/966161508646f575801bcf05f47ed283ec231d68/proto/greptime/v1/database.proto#L50
[9]: https://github.com/GreptimeTeam/greptimedb/blob/main/src/common/grpc/src/flight.rs#L85
