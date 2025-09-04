---
keywords: [Go SDK, gRPC 协议, 数据库连接, 示例代码, 认证信息]
description: 介绍如何使用 GreptimeDB Go SDK 通过 gRPC 协议连接到 GreptimeCloud，并提供了连接信息和示例代码。
---

# Go SDK

GreptimeDB Go SDK 使用 gRPC 与数据库通信，
请参考 [Go SDK 文档](https://docs.greptime.com/user-guide/ingest-data/for-iot/grpc-sdks/go)查看更多 SDK 使用的相关内容。

请使用以下信息连接到 GreptimeCloud：

- Host: `<host>`
- Port: `5001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

下方的代码片段展示了如何使用 Go SDK 建立一个 `client` 连接对象：

```go
cfg := greptime.NewConfig("<host>").
    WithDatabase("<dbname>").
    WithPort(5001).
    WithInsecure(false).
    WithAuth("<username>", "<password>")

cli, err := greptime.NewClient(cfg)
if err != nil {
    panic("failed to init client")
}
```
