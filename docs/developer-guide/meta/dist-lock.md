# Distributed Lock

## Introduction

Meta provides the ability to distribute lock externally via gRPC.

## How to use

A meta client implemented by rust is provided in [meta-client][1] crate.

[1]: https://github.com/GreptimeTeam/greptimedb/tree/develop/src/meta-client

For example:

```rust
async fn do_some_work(meta_client: MetaClient) {
    let name = b"lock_name".to_vec();
    let expire_secs = 60;

    let lock_req = LockRequest { name, expire_secs };

    let lock_result = meta_client.lock(lock_req).await.unwrap();
    let key = lock_result.key;

    info!("do some work, take 3 seconds");
    tokio::time::sleep(Duration::from_secs(3)).await;

    let unlock_req = UnlockRequest { key };

    meta_client.unlock(unlock_req).await.unwrap();
    info!("unlock success!");
}
```

More examples [here][2].

[2]: https://github.com/GreptimeTeam/greptimedb/blob/develop/src/meta-client/examples/lock.rs

For using other languages, since gRPC is cross-language, you can easily implement language-specific client.

You can find the proto definition [here][3].

[3]: https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/meta/lock.proto

Pay attention to the following points:

1. If the expiration time of distribute lock is exceeded and currently holds the lock, the lock is automatically released.
2. Distributed lock need to set a reasonable expiration time, default: 10 seconds.
3. The expiration time of the distributed lock should be shorter than the timeout of the Grpc channel. Otherwise it may cause gRPC timeout error, causing lock failure.

## Detailed design

The current implementation of distributed lock is based on [etcd][4]. And we define `Lock` trait, `EtcdLock` is one of the implementations.

[4]: https://etcd.io/docs/v3.5/dev-guide/api_concurrency_reference_v3/

Since the state of the distributed lock is maintained by etcd, both meta leader and follower nodes can provide the Lock's Grpc service.
