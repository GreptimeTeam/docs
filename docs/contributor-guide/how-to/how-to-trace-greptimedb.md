---
keywords: [tracing, W3C Trace Context, RPC, instrument, runtime]
description: Propagate and instrument distributed traces in GreptimeDB code.
---

# How to trace GreptimeDB

GreptimeDB uses the Rust [`tracing`](https://docs.rs/tracing/latest/tracing/) ecosystem and OpenTelemetry context propagation. Local spans are connected automatically only while their tracing context is carried through the same asynchronous execution path. RPC and runtime boundaries require explicit propagation.

The shared implementation is [`TracingContext`](https://github.com/GreptimeTeam/greptimedb/blob/main/src/common/telemetry/src/tracing_context.rs) in `common-telemetry`. It converts the active span context to and from W3C Trace Context fields.

<AnchorAlias id="define-tracing-context-in-rpc" />

## RPC context fields

GreptimeDB protobuf headers store W3C trace fields in a `map<string, string> tracing_context` field:

- Frontend to Datanode: [`RegionRequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/region/server.proto)
- Meta clients and services: [`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/meta/common.proto)
- Client to Frontend database RPC: [`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/common.proto)

When adding an internal RPC, use the existing header type when possible. A separate tracing field with a different encoding creates a propagation path that the common helpers cannot handle.

<AnchorAlias id="pass-tracing-context-in-rpc-call" />

## Propagate context across an RPC

Capture the current context when constructing an outbound request:

```rust
let request = RegionRequest {
    header: Some(RegionRequestHeader {
        tracing_context: TracingContext::from_current_span().to_w3c(),
        ..Default::default()
    }),
    body: Some(region_request::Body::Alter(request)),
};
```

At the receiver, decode the header and attach a new local span as a child of that context:

```rust
let tracing_context = request
    .header
    .as_ref()
    .map(|header| TracingContext::from_w3c(&header.tracing_context))
    .unwrap_or_default();

let result = self
    .handle_read(request)
    .trace(tracing_context.attach(info_span!("RegionServer::handle_read")))
    .await?;
```

An absent or invalid context becomes an empty context, so request handling still works without a parent trace. Do not reuse one request's context for unrelated work.

<AnchorAlias id="use-tracinginstrument-to-instrument-the-code" />

## Instrument local work

Use `#[tracing::instrument]` at asynchronous or expensive boundaries where a span helps correlate latency and errors. The macro records arguments through `Debug` by default. Skip credentials, tokens, large batches, query payloads, and any argument whose full value is not safe or useful in telemetry.

```rust
#[tracing::instrument(skip_all, fields(region_id = %region_id))]
async fn handle_region(region_id: RegionId, request: RegionRequest) {
    region_server.handle(request).await;
}
```

Prefer a small set of stable identifiers in `fields(...)` to recording a complete request. Instrumenting every helper function creates high-volume traces without improving the request-level call graph.

<AnchorAlias id="code-instrument-across-runtime" />

## Propagate context across runtimes

Moving a future to another runtime or spawning work outside the current instrumented future can lose the active parent. Capture the context before crossing that boundary and attach it to a new span inside the spawned future:

```rust
let tracing_context = TracingContext::from_current_span();
let handle = runtime.spawn(async move {
    handler
        .handle(query)
        .trace(tracing_context.attach(info_span!("background_query")))
        .await
});
```

The context must be captured before the spawn. Keep the attached span scoped to the spawned operation so unrelated tasks do not inherit the same parent.
