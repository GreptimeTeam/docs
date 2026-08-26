---
keywords: [tracing, 分布式追踪, tracing 上下文, RPC 调用, 代码埋点]
description: 介绍如何在 GreptimeDB 中使用 Rust 的 tracing 框架进行代码埋点，包括在 RPC 中定义和传递 tracing 上下文的方法。
---

# How to trace GreptimeDB

GreptimeDB 使用 Rust 的 [tracing](https://docs.rs/tracing/latest/tracing/) 框架进行代码埋点，tracing 的具体原理和使用方法参见 tracing 的官方文档。

通过将 `trace_id` 等信息在整个分布式数据链路上透传，使得我们能够记录整个分布式链路的函数调用链，知道每个被追踪函数的调用时间等相关信息，从而对整个系统进行诊断。

## 在 RPC 中定义 tracing 上下文

因为 tracing 框架并没有原生支持分布式追踪，我们需要手动将 `trace_id` 等信息在 RPC 消息中传递，从而正确的识别函数的调用关系。我们使用基于 [w3c 的标准](https://www.w3.org/TR/trace-context/#traceparent-header-field-values) 将相关信息编码为 `tracing_context` ，将消息附在 RPC 的 header 中。主要定义在：

- `frontend` 与 `datanode` 交互：`tracing_context` 定义在 [`RegionRequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/region/server.proto) 中
- `frontend` 与 `metasrv` 交互：`tracing_context`  定义在  [`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/meta/common.proto) 中
- Client 与 `frontend` 交互：`tracing_context`  定义在  [`RequestHeader`](https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/common.proto) 中

## 在 RPC 调用中传递 tracing 上下文

我们构建了一个 `TracingContext` 结构体，封装了与 tracing 上下文有关的操作。[相关代码](https://github.com/GreptimeTeam/greptimedb/blob/main/src/common/telemetry/src/tracing_context.rs)

GreptimeDB 在使用 `TracingContext::from_current_span()` 获取当前 tracing 上下文，使用 `to_w3c()` 方法将 tracing 上下文编码为符合 w3c 的格式，并将其附在 RPC 消息中，从而使 tracing 上下文正确的在分布式组件之中传递。

下面的例子说明了如何获取当前 tracing 上下文，并在构造 RPC 消息时正确传递参数，从而使 tracing 上下文正确的在分布式组件之中传递。


```rust
let request = RegionRequest {
    header: Some(RegionRequestHeader {
        tracing_context: TracingContext::from_current_span().to_w3c(),
        ..Default::default()
    }),
    body: Some(region_request::Body::Alter(request)),
};
```

在 RPC 消息的接收方，需要将 tracing 上下文正确解码，并且使用该上下文构建第一个 `span` 对函数调用进行追踪。比如下面的代码就将接收到的 RPC 消息中的 `tracing_context` 使用 `TracingContext::from_w3c` 方法正确解码。并使用 `attach` 方法将新建的 `info_span!("RegionServer::handle_read")`  附上了上下文消息，从而能够跨分布式组件对调用进行追踪。 

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

## 使用 `tracing::instrument` 对监测代码进行埋点

我们使用 tracing 提供的 `instrument` 宏对代码进行埋点，只要将 `instrument` 宏标记在需要进行埋点的函数即可。 `instrument` 宏会每次将函数调用的参数以 `Debug` 的形式打印到 span 中。对于没有实现 `Debug` trait 的参数，或者结构体过大、参数过多，最后导致 span 过大，希望避免这些情况就需要使用 `skip_all`，跳过所有的参数打印。

```rust
#[tracing::instrument(skip_all)]
async fn instrument_function(....) {
    ...
}
```

## 跨越 runtime 的代码埋点

Rust 的 tracing 库会自动处理埋点函数间的嵌套关系，但如果某个函数的调用跨越 runtime 的话，tracing 不能自动对这类调用进行追踪，我们需要手动跨越 runtime 去传递上下文。

```rust
let tracing_context = TracingContext::from_current_span();
let handle = runtime.spawn(async move {
    handler
        .handle(query)
        .trace(tracing_context.attach(info_span!("xxxxx")))
    ...
});
```

比如上面这段代码需要跨越 runtime 去进行 tracing，我们先通过 `TracingContext::from_current_span()` 获取当前 tracing 上下文，通过在另外一个 runtime 里新建一个 span，并将 span 附着在当前上下文中，我们就完成了跨越 runtime 的代码埋点，正确追踪到了调用链。
