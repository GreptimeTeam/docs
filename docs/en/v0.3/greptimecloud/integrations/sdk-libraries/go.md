# Go SDK

The GreptimeDB Go SDK uses gRPC to communicate with the database. For more information on how to use the SDK, please refer to the [Go SDK documentation](https://docs.greptime.com/user-guide/clients/sdk-libraries/go).

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
    WithPort(4001).
    WithAuth("<username>", "*Your GreptimeCloud service password*").
    WithDialOptions(options...). // specify your gRPC dail options
    WithCallOptions()            // specify your gRPC call options

client, err := greptime.NewClient(cfg)
if err != nil {
    panic("failed to init client")
}
```
