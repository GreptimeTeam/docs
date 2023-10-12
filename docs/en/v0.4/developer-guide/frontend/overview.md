# Overview

The `Frontend` executes requests from clients, and performs some tasks in the cloud
, like tenant management, authorization validation, flow control, etc.

The `Frontend` can expose multiple endpoints for reading and writing data in various protocols. You
can refer to [Clients][1] for more details.

The following picture shows a typical deployment of GreptimeDB in the cloud. The `Frontend` instances
form a cluster to serve the requests from clients:

![frontend](/frontend.png)

## Details

- [Table Sharding][2]
- [Distributed Querying][3]

[1]: /user-guide/clients/overview.md
[2]: ./table-sharding.md
[3]: ./distributed-querying.md
