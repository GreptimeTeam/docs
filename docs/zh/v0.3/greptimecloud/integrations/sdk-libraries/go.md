# Go SDK

GreptimeDB Go SDK 使用 gRPC 与数据库通信，
请参考 [Go SDK 文档](https://docs.greptime.com/user-guide/clients/sdk-libraries/go)查看更多 SDK 使用的相关内容。

请使用以下信息连接到 GreptimeCloud：

- Host: `<host>`
- Port: `4001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

下方的代码片段展示了如何使用 Go SDK 建立一个 `client` 连接对象：

```go
options := []grpc.DialOption{
    grpc.WithTransportCredentials(insecure.NewCredentials()),
}

cfg := greptime.NewCfg("<host>").
    WithDatabase("<dbname>").
    WithPort(4001).              // default port
    WithAuth("<username>", "*Your GreptimeCloud service password*").
    WithDialOptions(options...). // specify your gRPC dail options
    WithCallOptions()            // specify your gRPC call options

client, err := greptime.NewClient(cfg)
if err != nil {
    panic("failed to init client")
}
```
