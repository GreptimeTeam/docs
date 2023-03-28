# gRPC

There are two gRPC services in GreptimeDB. One is defined by GreptimeDB itself, and the other is built on top
of [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html).

GreptimeDB's own gRPC service definition can be found at
our "[greptime-proto repo](https://github.com/GreptimeTeam/greptime-proto)". You can also
use [grpcurl](https://github.com/fullstorydev/grpcurl) to see it:

```text
~ grpcurl -plaintext 127.0.0.1:4001 list
greptime.v1.GreptimeDatabase

~ grpcurl -plaintext 127.0.0.1:4001 list greptime.v1.GreptimeDatabase
greptime.v1.GreptimeDatabase.Handle
greptime.v1.GreptimeDatabase.HandleRequests

~ grpcurl -plaintext 127.0.0.1:4001 describe greptime.v1.GreptimeDatabase.Handle
greptime.v1.GreptimeDatabase.Handle is a method:
rpc Handle ( .greptime.v1.GreptimeRequest ) returns ( .greptime.v1.GreptimeResponse );

~ grpcurl -plaintext 127.0.0.1:4001 describe greptime.v1.GreptimeDatabase.HandleRequests 
greptime.v1.GreptimeDatabase.HandleRequests is a method:
rpc HandleRequests ( stream .greptime.v1.GreptimeRequest ) returns ( .greptime.v1.GreptimeResponse );
```

Please note that currently service `GreptimeDatabase` can only handle insert requests. For query and DDL requests, you
can use our gRPC service that is built on top
of [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html). Arrow Flight is an RPC framework for
high-performance data services based on Arrow data. You can refer to its official site for more details.

## SDK

We offer the following officially supported SDK:

- [Java](../java-sdk/java-sdk)

Currently, we are actively working on developing SDKs for other programming languages. If you are interested, you are
welcome to write a SDK for GreptimeDB. You can start
from "[How to write a gRPC SDK for GreptimeDB](../../developer-guide/how-to/how-to-write-sdk.md)", thank you!
