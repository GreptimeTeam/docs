---
keywords: [trace, distributed tracing, opentelemetry, jaeger, wide events, observability]
description: 介绍 GreptimeDB 中的 Trace 数据支持
---

# Traces

:::warning

本章内容目前仍处于实验阶段，在未来的版本中可能会有所调整。

:::

GreptimeDB 0.14 中加入了 Trace 数据的原生支持。本节内容我们将介绍 Trace 数据读写，
和数据建模等高级主题。

- [写入与查询](./read-write.md)
- [GreptimeDB 中的 Trace 数据建模](./data-model.md)
- [扩展 Trace 数据](./extend-trace.md)

## 查询 Trace

- [GreptimeDB Dashboard](/getting-started/installation/greptimedb-dashboard.md#traces-query)：在内置 Dashboard 中使用构建器或代码编辑器搜索 Trace 并查看 Span 记录。
- [写入与查询](./read-write.md#query)：Jaeger 兼容 API 与 SQL 查询接口。
