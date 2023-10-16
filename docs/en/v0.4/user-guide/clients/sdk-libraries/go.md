# Go

## Install

```sh
go get github.com/GreptimeTeam/greptimedb-client-go@v0.1.2
```

## Create a Client

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

See [Go SDK in reference](../../../reference/sdk/go.md) to get more configurations.

## Write Data

Please refer to [write data](../../write-data/sdk-libraries/go.md).

## Query Data

Please refer to [Query data](../../query-data/sdk-libraries/go.md).
