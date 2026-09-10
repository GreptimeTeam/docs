# gRPC

GreptimeDB 提供了 [gRPC SDK](/user-guide/ingest-data/for-iot/grpc-sdks/overview.md)，用于高效和高性能的数据摄入。

如果没有适用于你的编程语言的 SDK，你可以按照贡献者指南[创建自己的 SDK](/contributor-guide/how-to/how-to-write-sdk.md)。

## 跳过插入请求的 WAL

要跳过普通插入请求的预写日志（WAL）写入，请在 `x-greptime-hints` gRPC 元数据中传递
`insert_skip_wal=true` hint。此设置仅对当前请求生效，不会修改表选项。
进程重启时，尚未 flush 的跳过 WAL 的数据会丢失。

将该 hint 设置为 `false` 或省略它，即可写入 WAL。
