# How to write a gRPC SDK for GreptimeDB

GreptimeDB builds its gRPC interface on top of [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html). If you want to write a gRPC SDK for GreptimeDB in a programming language you are familiar with, read on!

> Currently, we only have gRPC SDK written in Java, and you can find more details [here](../user-guide/java-sdk.md).

First, you can find our protobuf definitions for GreptimeDB requests and responses in this [repo](https://github.com/GreptimeTeam/greptime-proto#for-sdk-developers). The section named "For SDK developers" in the README of that repo is worth reading. 

Then check the programming language you are using, to see whether Arrow Flight RPC officially supports it. Currently, it supports C++, Java, Go, C# and Rust. It might add more language supports in the meantime, so stay tuned with its [Implementation Status](https://arrow.apache.org/docs/status.html#flight-rpc). If you can't find the language you are using on it, you have to write a client from sketch (starting from Arrow Flight's raw gRPC service protobuf [definition](https://arrow.apache.org/docs/format/Flight.html#protocol-buffer-definitions)).

Now focus on the `DoGet` method of Arrow Flight gRPC service, currently all GreptimeDB requests are handled in it.

The `DoGet` method is defined like this:

```protobuf
  rpc DoGet(Ticket) returns (stream FlightData) {}
```

For sending a GreptimeDB request, just encode it into raw bytes, then wrap it into a `Ticket`. `Ticket` is simply a message carries bytes:

```protobuf
message Ticket {
  bytes ticket = 1;
}
```

It's a little complicated to handle GreptimeDB responses. `DoGet` returns a stream of `FlightData`. The definition of `FlightData` is:

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

Specifically the fields are:

- `flight_descriptor` can be ignored here.
- `data_header` must be first deserialized to `Message` (see its definition [here](https://github.com/apache/arrow/blob/master/format/Message.fbs#L134)) using [FlatBuffer](https://github.com/google/flatbuffers). The `Message`'s header type decides how the following two fields are interpreted.
- `app_metadata` carries GreptimeDB's custom data. Now this field is not empty only after client issues `InsertRequest` or `Insert Into` SQL. When it's not empty, `Message`'s header type is set to `None`. You should deserialize `app_metadata` to `FlightMetadata`. `FlightMetadata` is defined [here](https://github.com/GreptimeTeam/greptime-proto/blob/966161508646f575801bcf05f47ed283ec231d68/proto/greptime/v1/database.proto#L50).
  - Currently `FlightMetadata` only carries "Affected Rows" when writing data into GreptimeDB, just like what "Insert Into" SQL returns in MySQL. If you don't care about the affected rows result, you can omit this `app_metadata` field. (Still, the response of `DoGet` itself should be handled as well.)
- When `Message`'s header type is `Schema` or `Recordbatch`, `data_body` carries the actual data of part of the query result. You should parse all the `FlightData`s in the response stream of `DoGet` to get the complete query result. Normally, the first `FlightData` in a stream is schema, and the rests are recordbatch. You should save the first schema for later parsing the follow-up `FlightData`s.

Here we provide a pseudocode for decoding `DoGet`'s `FlightData` stream:

```text
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

You can also refer to our [Rust client](https://github.com/GreptimeTeam/greptimedb/blob/develop/src/common/grpc/src/flight.rs#L85).
