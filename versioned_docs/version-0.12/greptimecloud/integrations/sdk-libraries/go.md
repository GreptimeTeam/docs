---
keywords: [Go SDK, gRPC, database connection, authentication, GreptimeCloud]
description: Instructions on how to use the GreptimeDB Go SDK to connect to GreptimeCloud using gRPC.
---

# Go SDK

The GreptimeDB Go ingester library utilizes gRPC for writing data to the database. For how to use the library, please refer to the [Go library documentation](https://docs.greptime.com/user-guide/ingest-data/for-iot/grpc-sdks/go).

To connect to GreptimeCloud, using information below:

- Host: `<host>`
- Port: `5001`
- Database: `<dbname>`
- Username: `<username>`
- Password: `<password>`

The following code shows how to create a `client`.

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
