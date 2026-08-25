---
keywords: [tracing, W3C Trace Context, RPC, instrument, runtime]
description: 介绍 GreptimeDB 代码中的分布式 trace 传递和埋点方法。
---

# How to trace GreptimeDB

GreptimeDB 使用 Rust [`tracing`](https://docs.rs/tracing/latest/tracing/) 生态和 OpenTelemetry context propagation。只有 tracing context 沿同一条异步执行路径传递时，本地 span 才会自动建立父子关系；跨 RPC 或 runtime 时必须显式传递。

公共实现在 `common-telemetry` 的 [`TracingContext`](https://github.com/GreptimeTeam/greptimedb/blob/main/src/common/telemetry/src/tracing_context.rs) 中，负责在当前 span context 和 W3C Trace Context 字段之间转换。

<AnchorAlias id="在-rpc-中定义-tracing-上下文" />

## RPC 中的 context 字段

GreptimeDB 的 protobuf header 使用 `map<string, string> tracing_context` 保存 W3C trace 字段：

- Frontend 到 Datanode：[`RegionRequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/region/server.proto)
- Meta client 和 service：[`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/meta/common.proto)
- Client 到 Frontend database RPC：[`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/common.proto)

增加内部 RPC 时应尽量复用已有 header type。另建 tracing 字段或采用不同编码，会产生公共 helper 无法处理的传递路径。

<AnchorAlias id="在-rpc-调用中传递-tracing-上下文" />

## 跨 RPC 传递 context

构造出站请求时获取当前 context：

```rust
let request = RegionRequest {
    header: Some(RegionRequestHeader {
        tracing_context: TracingContext::from_current_span().to_w3c(),
        ..Default::default()
    }),
    body: Some(region_request::Body::Alter(request)),
};
```

接收端解析 header，并把新的本地 span 挂到该 context 下：

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

Header 缺失或 context 无效时会得到空 context，请求仍可在没有 parent trace 的情况下执行。不能把一个请求的 context 复用于无关工作。

<AnchorAlias id="使用-tracinginstrument-对监测代码进行埋点" />

## 使用 `tracing::instrument` 创建 span

在异步边界或开销较大的操作上使用 `#[tracing::instrument]`，便于关联延迟和错误。该宏默认通过 `Debug` 记录参数。凭据、token、大 batch、查询 payload 以及不适合进入 telemetry 的完整参数必须跳过。

```rust
#[tracing::instrument(skip_all, fields(region_id = %region_id))]
async fn handle_region(region_id: RegionId, request: RegionRequest) {
    region_server.handle(request).await;
}
```

`fields(...)` 中应记录少量稳定标识符，不要记录完整请求。为每个 helper 都添加 span 会增加大量 trace 数据，却不能改善请求级调用链。

<AnchorAlias id="跨越-runtime-的代码埋点" />

## 跨 runtime 传递 context

把 future 移到另一个 runtime，或在当前 instrumented future 之外 spawn 任务时，可能丢失当前 parent。跨越边界前先获取 context，再在新 future 中挂载 span：

```rust
let tracing_context = TracingContext::from_current_span();
let handle = runtime.spawn(async move {
    handler
        .handle(query)
        .trace(tracing_context.attach(info_span!("background_query")))
        .await
});
```

Context 必须在 spawn 前获取。挂载的 span 只应覆盖该异步操作，避免无关任务继承同一个 parent。
