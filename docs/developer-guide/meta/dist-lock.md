# Distributed Lock

## Introduction

`Meta` provides the functionality of distributed locks via gRPC.

## How to use

The [meta-client][1] crate provides a Rust-based meta client implementation.

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

Because gRPC is cross-language, it is easy to implement clients for other programming languages.

You can find the protocol buffer definition [here][3].

[3]: https://github.com/GreptimeTeam/greptime-proto/blob/main/proto/greptime/v1/meta/lock.proto

Pay attention to the following points:

1. The distributed lock will be automatically released if it exceeds its expiration time and is still being held.
2. When using distributed locks, you must set a suitable expiration time, default: 10 seconds.
3. Distributed lock's expiration time should be shorter than the 'gRPC' channel's timeout; otherwise, it may cause a 'gRPC' timeout error, resulting in lock failure.

## Detailed design

The current implementation of distributed lock is based on [etcd][4]. We have defined the `Lock` trait, and `EtcdLock` is one of the available implementations.

[4]: https://etcd.io/docs/v3.5/dev-guide/api_concurrency_reference_v3/

Since `etcd` maintains the state of the distributed lock, both the `Meta` leader and its follower nodes can provide the Lock's `gRPC` service.
