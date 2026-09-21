---
keywords: [gRPC, SDK, 数据写入, WAL]
description: 介绍如何通过 gRPC SDK 写入数据，以及为单个写入请求禁用 WAL。
---

# gRPC

GreptimeDB 提供了 [gRPC SDK](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md)，用于高效和高性能的数据摄入。

如果没有适用于你的编程语言的 SDK，你可以按照贡献者指南[创建自己的 SDK](/contributor-guide/how-to/how-to-write-sdk.md)。

## 为单个写入请求禁用 WAL

在 `x-greptime-hints` gRPC 元数据中设置 `insert_skip_wal=true`，可为当前写入请求禁用预写日志（WAL）。

此设置仅对当前请求生效，不会修改[表级 `skip_wal` 选项](/reference/sql/create.md#创建禁用-wal-的表)。
将 `insert_skip_wal` 设置为 `false` 或省略该 hint 时，若表级 `skip_wal` 为 `true`，仍不写入 WAL。

:::warning
禁用 WAL 后，进程重启会导致尚未刷盘的数据丢失。请仅在数据可以从源端重新写入时使用。
:::
