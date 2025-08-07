---
keywords: [tracing, distributed tracing, trace_id, RPC, instrument, span, runtime]
description: Describes how to use Rust's tracing framework in GreptimeDB for distributed tracing, including defining tracing context in RPC, passing it, and instrumenting code.
---

# How to trace GreptimeDB

GreptimeDB uses Rust's [tracing](https://docs.rs/tracing/latest/tracing/) framework for code instrument. For the specific details and usage of tracing, please refer to the official documentation of tracing.

By transparently transmitting `trace_id` and other information on the entire distributed system, we can record the function call chain of the entire distributed link, know the time of each tracked function take and other related information, so as to monitor the entire system.

## Define tracing context in RPC

Because the tracing framework does not natively support distributed tracing, we need to manually pass information such as `trace_id` in the RPC message to correctly identify the function calling relationship. We use standards based on [w3c](https://www.w3.org/TR/trace-context/#traceparent-header-field-values) to encode relevant information into `tracing_context` and attach the message to the RPC header. Mainly defined in:

- `frontend` interacts with `datanode`: `tracing_context` is defined in [`RegionRequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/region/server.proto)
- `frontend` interacts with `metasrv`: `tracing_context` is defined in [`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/meta/common.proto)
- Client interacts with `frontend`: `tracing_context` is defined in [`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/common.proto)

## Pass tracing context in RPC call

We build a `TracingContext` structure that encapsulates operations related to the tracing context. [Related code](https://github.com/GreptimeTeam/greptimedb/blob/main/src/common/telemetry/src/tracing_context.rs)

GreptimeDB uses `TracingContext::from_current_span()` to obtain the current tracing context, uses the `to_w3c()` method to encode the tracing context into a w3c-compliant format, and attaches it to the RPC message, so that the tracing context is correctly distributed passed within the component.

The following example illustrates how to obtain the current tracing context and pass the parameters correctly when constructing the RPC message, so that the tracing context is correctly passed among the distributed components.


```rust
let request = RegionRequest {
     header: Some(RegionRequestHeader {
         tracing_context: TracingContext::from_current_span().to_w3c(),
         ..Default::default()
     }),
     body: Some(region_request::Body::Alter(request)),
};
```

On the receiver side of the RPC message, the tracing context needs to be correctly decoded and used to build the first `span` to trace the function call. For example, the following code will correctly decode the `tracing_context` in the received RPC message using the `TracingContext::from_w3c` method. And use the `attach` method to attach the context message to the newly created `info_span!("RegionServer::handle_read")`, so that the call can be tracked across distributed components.

```rust
...
let tracing_context = request
     .header
     .as_ref()
     .map(|h| TracingContext::from_w3c(&h.tracing_context))
     .unwrap_or_default();
let result = self
     .handle_read(request)
     .trace(tracing_context.attach(info_span!("RegionServer::handle_read")))
     .await?;
...
```

## Use `tracing::instrument` to instrument the code

We use the `instrument` macro provided by tracing to instrument the code. We only need to annotate the `instrument` macro in the function that needs to be instrument. The `instrument` macro will print every function parameter on each function call into the span in the form of `Debug`. For parameters that do not implement the `Debug` trait, or the structure is too large and has too many parameters, resulting in a span that is too large. If you want to avoid these situations, you need to use `skip_all` to skip printing all parameters.

```rust
#[tracing::instrument(skip_all)]
async fn instrument_function(....) {
     ...
}
```

## Code instrument across runtime

Rust's tracing library will automatically handle the nested relationship between instrument functions in the same runtime, but if a function call across the runtime, tracing library cannot automatically trace such calls, and we need to manually pass the context across the runtime.

```rust
let tracing_context = TracingContext::from_current_span();
let handle = runtime.spawn(async move {
     handler
         .handle(query)
         .trace(tracing_context.attach(info_span!("xxxxx")))
     ...
});
```

For example, the above code needs to perform tracing across runtimes. We first obtain the current tracing context through `TracingContext::from_current_span()`, create a span in another runtime, and attach the span to the current context, and we are done. The hidden code points that span the runtime are eliminated, and the call chain is correctly traced.