# Go

## 安装 SDK

```sh
go get github.com/GreptimeTeam/greptimedb-client-go
```

## 创建数据库对象

```go
package example

import (
    greptime "github.com/GreptimeTeam/greptimedb-client-go"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
)

func InitClient() *greptime.Client {
    options := []grpc.DialOption{
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    }
    // To connect a database that needs authentication, for example, those on Greptime Cloud,
    // `Username` and `Password` are needed when connecting to a database that requires authentication.
    // Leave the two fields empty if connecting a database without authentication.
    cfg := greptime.NewCfg("127.0.0.1").
        WithDatabase("public").      // change to your real database
        WithPort(4001).              // default port
        WithAuth("", "").            // `Username` and `Password`
        WithDialOptions(options...). // specify your gRPC dail options
        WithCallOptions()            // specify your gRPC call options

    client, err := greptime.NewClient(cfg)
    if err != nil {
        panic("failed to init client")
    }
    return client
}
```

请参考 [Go SDK in reference](/v0.4/reference/sdk/go.md) 以获得更多信息.

## 写入数据

请参考 [写入数据](../../write-data/sdk-libraries/go.md).

## 读取数据

请参考 [读取数据](../../query-data/sdk-libraries/go.md).
