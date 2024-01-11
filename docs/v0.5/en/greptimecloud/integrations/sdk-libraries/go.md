# Go SDK

The GreptimeDB Go ingester library utilizes gRPC for writing data to the database. For how to use the library, please refer to the [Go library documentation](https://docs.greptime.com/user-guide/client-libraries/go).

To connect to GreptimeCloud, using information below:

- Host: `<host>`
- Port: `4001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

The following code shows how to create a `client`.

```go
options := []grpc.DialOption{
    grpc.WithTransportCredentials(insecure.NewCredentials()),
}

cfg := greptime.NewCfg("<host>").
    WithDatabase("<dbname>").
    WithPort(4001).              // default port
    WithAuth("<username>", "<password>").
    WithDialOptions(options...). // specify your gRPC dail options
    WithCallOptions()            // specify your gRPC call options

client, err := greptime.NewClient(cfg)
if err != nil {
    panic("failed to init client")
}
```
