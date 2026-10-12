---
keywords: [Configuration, Object Store WAL, GreptimeDB standalone, GreptimeDB, S3, experimental]
description: This section describes how to use the experimental object store WAL in GreptimeDB standalone, including its requirements, configuration, durability modes, cost, metrics and limitations.
---
# Object Store WAL

:::warning

The object store WAL is experimental and is available in Nightly builds only. It works in standalone mode only. Its configuration and behavior may change in future versions.

:::

The object store WAL stores the WAL in an object store such as S3, usually the same one that holds your data files. You don't need to deploy or operate any extra component, and the WAL is as durable as the object store itself.

The provider is named `experimental_object_store`. It is supported only in standalone mode. In cluster mode, the Metasrv does not accept this provider, and a Datanode connected to a Metasrv refuses to start with the error `Object store WAL is only supported in standalone mode`.

If you are interested in how it works internally, see the [object store WAL RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2026-09-06-object-store-wal.md).

## Requirements

The object store must support conditional writes (if-not-exists) and strongly consistent listing. S3, Google Cloud Storage, Azure Blob Storage and MinIO meet both requirements. An S3-compatible store that lacks either one is not supported. The local file system storage (`type = "File"`) does not provide the guarantees described on this page.

Each standalone instance needs its own WAL location. Do not let two GreptimeDB instances use the same storage provider and `prefix`.

## Configuration

Configure the WAL in the `[wal]` section of the standalone configuration file. The following example enables the object store WAL and shows the default values of its other options:

```toml
[wal]
provider = "experimental_object_store"
storage_provider = ""
prefix = "wal"
flush_interval = "100ms"
max_batch_bytes = "8MB"
ack_mode = "durable"
max_unpersisted_bytes = "64MB"
max_unpersisted_age = "8s"
on_corrupted_segment = "skip"
```

In most cases, setting `provider` is enough.

The configuration injection described in [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) targets the cluster chart, where this provider is not supported. If you deploy standalone with Helm, see [Deploy GreptimeDB Standalone](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-standalone.md).

### Options

| Configuration Option    | Description | Default Value |
| ----------------------- | ----------- | ------------- |
| `provider`              | The provider of the WAL. Set it to `experimental_object_store` to use the object store WAL. | `"raft_engine"` |
| `storage_provider`      | The storage provider that stores the WAL. Leave it empty to use the default object store configured in `[storage]`. Otherwise, set it to the `name` of a configured storage provider, see [Storage engine provider](/user-guide/deployments-administration/configuration.md#storage-engine-provider). | `""` |
| `prefix`                | The path under which the WAL is stored in the storage provider. It must be a non-empty relative path without empty or `..` components. | `"wal"` |
| `flush_interval`        | How often buffered writes are written to the object store. It must be at least `10ms`. See [Latency and request cost](#latency-and-request-cost). | `"100ms"` |
| `max_batch_bytes`       | The amount of buffered data at which it is written to the object store without waiting for `flush_interval`. | `"8MB"` |
| `ack_mode`              | When a write is acknowledged: `durable` or `enqueued`. See [Durability modes](#durability-modes). | `"durable"` |
| `max_unpersisted_bytes` | In `enqueued` mode, the amount of acknowledged data not yet in the object store at which new writes wait. | `"64MB"` |
| `max_unpersisted_age`   | In `enqueued` mode, how long acknowledged data may stay out of the object store before new writes wait. | `"8s"` |
| `on_corrupted_segment`  | What to do when part of the WAL is corrupted: `skip` or `fail`. See [Corrupted data](#corrupted-data). | `"skip"` |

The options other than `provider` are used only when `provider` is `experimental_object_store`. `max_unpersisted_bytes` and `max_unpersisted_age` are used only when `ack_mode` is `enqueued`.

### Where the WAL is stored

With the default `prefix`, a standalone instance stores its WAL under the following path in the storage provider:

```text
wal/datanodes/0/epochs/0/objects/
```

The general form is `<prefix>/datanodes/<node_id>/epochs/<generation>/objects/`. GreptimeDB creates and deletes the files under this path itself. Do not modify or delete them manually.

### Environment variables

Like any other option, the WAL options can be set with [environment variables](/user-guide/deployments-administration/configuration.md#environment-variable) using the `GREPTIMEDB_STANDALONE` prefix:

```bash
export GREPTIMEDB_STANDALONE__WAL__PROVIDER=experimental_object_store
export GREPTIMEDB_STANDALONE__WAL__PREFIX=wal
export GREPTIMEDB_STANDALONE__WAL__ACK_MODE=durable
```

## Durability modes

`ack_mode` decides when a write is acknowledged to the client.

- **`durable`** (default): a write is acknowledged only after it is stored in the object store. Acknowledged writes survive a crash. The cost is latency: a write usually waits up to one `flush_interval` plus one object store request, and longer when the object store is slow or earlier writes are still being stored.
- **`enqueued`**: a write is acknowledged as soon as GreptimeDB accepts it, and it is written to the object store in the background. In measurements on S3, this mode reached the same throughput as the local WAL. The cost is durability: if GreptimeDB crashes, acknowledged writes that have not reached the object store yet are lost.

In `enqueued` mode, `max_unpersisted_bytes` and `max_unpersisted_age` slow down new writes when the object store falls behind, so that the amount of data waiting to be stored does not keep growing. They do not limit how much data a crash can lose during an object store outage, because writes acknowledged before the outage stay in memory until the object store is reachable again.

In both modes, data that has already been flushed to SST files is not affected by a crash.

## Latency and request cost

Every write to the object store is one request, which affects both latency and cost:

- GreptimeDB writes buffered data to the object store every `flush_interval`, or earlier when the buffer reaches `max_batch_bytes`. At the default `100ms`, the timer alone produces up to 10 requests per second per node; under heavy load, writes triggered by `max_batch_bytes` add more.
- On S3, each request took about 50 ms at the median. Under sustained load, about 600 requests per minute per node were measured.
- In `durable` mode, a client that sends one write at a time completes about one write per `flush_interval`.

When tuning:

- A shorter `flush_interval` lowers the latency of `durable` writes when writes are sparse, and raises the number of requests in proportion. For example, `10ms` allows up to 100 timer-triggered requests per second per node.
- If you need throughput close to the local WAL from a single writer, use `enqueued` mode and accept its durability trade-off. A shorter `flush_interval` alone does not remove the latency of the object store request.

## Corrupted data

`on_corrupted_segment` decides what happens when GreptimeDB finds corrupted data in the WAL while replaying it, for example at startup:

- **`skip`** (default): GreptimeDB skips the corrupted data, logs a warning and increments `greptime_logstore_object_store_wal_skipped_segments_total`. The affected region opens, but its unflushed writes in the corrupted data are lost. Other regions are not affected.
- **`fail`**: the affected region fails to open.

If a WAL file is damaged in a way that cannot be limited to one region, for example a truncated file, GreptimeDB fails to start regardless of this option.

## Garbage collection

GreptimeDB deletes WAL data automatically once it has been flushed to SST files. There is nothing to configure.

Things to know:

- Old WAL data is deleted after the next write that follows a flush, so an instance that receives no writes keeps its old WAL data until it receives writes again.
- A table that keeps receiving writes but is rarely flushed prevents WAL data from being deleted, also for other tables. This increases storage usage and startup time. Flush such tables regularly, for example with [`ADMIN flush_table`](/reference/sql/admin.md).

## Observability

The object store WAL exports metrics with the prefix `greptime_logstore_object_store_wal_`. Histograms are exported with the standard `_bucket`, `_sum` and `_count` series.

| Metric | Type | Meaning |
| --- | --- | --- |
| `greptime_logstore_object_store_wal_seal_to_durable_seconds` | Histogram | Time to write buffered data to the object store. |
| `greptime_logstore_object_store_wal_append_ack_seconds` | Histogram | Time a write waits for the WAL in `durable` mode. It is one part of the total write latency. |
| `greptime_logstore_object_store_wal_object_bytes` | Histogram | Size of each object written to the object store. |
| `greptime_logstore_object_store_wal_object_entries` | Histogram | Number of WAL entries in each object. |
| `greptime_logstore_object_store_wal_created_objects_total` | Counter | Objects written successfully. |
| `greptime_logstore_object_store_wal_create_failures_total` | Counter | Object writes that the object store did not confirm. In `durable` mode the affected writes fail; in `enqueued` mode they are retried. |
| `greptime_logstore_object_store_wal_create_conflicts_total` | Counter | Object writes that found an unexpected existing object, usually because another process uses the same `prefix`. |
| `greptime_logstore_object_store_wal_poisoned_total` | Counter | Times the WAL hit an unrecoverable error and stopped accepting writes. |
| `greptime_logstore_object_store_wal_stalled_appends_total` | Counter | Writes slowed down in `enqueued` mode because the object store fell behind. |
| `greptime_logstore_object_store_wal_stalled_append_seconds` | Histogram | How long such a write waited. |
| `greptime_logstore_object_store_wal_indexed_objects` | Gauge | Number of WAL objects currently kept, which is what GreptimeDB reads at startup. |
| `greptime_logstore_object_store_wal_indexed_bytes` | Gauge | Total size of the WAL objects currently kept. |
| `greptime_logstore_object_store_wal_deleted_objects_total` | Counter | WAL objects deleted by garbage collection. |
| `greptime_logstore_object_store_wal_failed_deletes_total` | Counter | WAL object deletes that failed. They are retried later. |
| `greptime_logstore_object_store_wal_recovery_seconds` | Histogram | Time spent loading the WAL at startup. |
| `greptime_logstore_object_store_wal_recovered_objects_total` | Counter | WAL objects read while loading the WAL at startup. |
| `greptime_logstore_object_store_wal_read_seconds` | Histogram | Time spent reading the WAL to replay one region. |
| `greptime_logstore_object_store_wal_skipped_segments_total` | Counter | Corrupted WAL data skipped during replay. |

Alert on any increase of these counters:

- `greptime_logstore_object_store_wal_poisoned_total`: the WAL has stopped accepting writes. Restart GreptimeDB after checking the logs.
- `greptime_logstore_object_store_wal_create_conflicts_total`: check that no other process uses the same storage provider and `prefix`.
- `greptime_logstore_object_store_wal_stalled_appends_total`: in `enqueued` mode, writes arrive faster than the object store can store them.

## Limitations

- **Standalone only**: cluster mode is not supported.
- **One instance per location**: two instances that use the same storage provider and `prefix` can fail to start, or one of them can stop accepting writes.
- **Unrecoverable errors**: after an unrecoverable error, such as finding data written by another instance, the WAL rejects all writes until GreptimeDB restarts.
- **No switching of an existing instance**: a table keeps the WAL provider it was created with. Tables created under `raft_engine` or `kafka` cannot be opened after you switch an instance to `experimental_object_store`, and the reverse is also true. GreptimeDB reports `Incompatible WAL provider change` and, by default, fails to start. Flushing the tables before switching does not help. Choose the WAL provider when you create the instance.
- **No prefix change**: tables also keep the WAL `prefix` they were created with. After `prefix` is changed, they fail to open with the error `Object store WAL prefix mismatch`.

## Best practices

- Keep the default options, including `ack_mode = "durable"`, unless you have measured a reason to change them.
- Keep the WAL in the same object store as the data by leaving `storage_provider` empty, unless you have a reason to separate them.
- Choose the WAL provider when you create the instance, and do not change `provider`, `storage_provider` or `prefix` afterwards.
- Flush tables that receive writes but rarely flush on their own, so that old WAL data can be deleted.
- Alert on `poisoned_total`, `create_conflicts_total` and `stalled_appends_total`.
