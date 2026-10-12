---
keywords: [Configuration, Object Store WAL, GreptimeDB standalone, GreptimeDB, S3, experimental]
description: This section describes the experimental object store WAL provider for GreptimeDB standalone, including its requirements, configuration, acknowledgement modes, garbage collection, metrics and limitations.
---
# Object Store WAL

:::warning

The object store WAL is experimental and is available in Nightly builds only. It works in standalone mode only. Its configuration and behavior may change in future versions.

:::

The object store WAL keeps the WAL in an object store, such as the one that already holds your data files. The Datanode batches the WAL entries of all its regions and writes each batch as one immutable object. Every object is written with a conditional create (if-not-exists), so an existing object is never overwritten.

There is no extra component to deploy or operate, and the WAL is as durable as the object store that holds it.

The provider is named `experimental_object_store`. It is supported only in standalone mode, which runs a single Datanode. In cluster mode the Metasrv does not accept this provider, and a Datanode connected to a Metasrv refuses to start with the error `Object store WAL is only supported in standalone mode`.

For the design, see the [object store WAL RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2026-09-06-object-store-wal.md).

## Requirements

The object store must support both of the following:

- **Conditional create**: an if-not-exists write that fails when the object already exists.
- **Strongly consistent LIST**: a listing that returns every object whose write has completed.

S3, Google Cloud Storage, Azure Blob Storage and MinIO meet both requirements. An S3-compatible store that lacks either one is not supported.

The local file system storage (`type = "File"`) implements the conditional create with a temporary file and a rename, which is not atomic, and it does not sync the directory after the rename. It does not provide the guarantees described on this page.

One prefix belongs to one Datanode, and only one process at a time may open it. Do not point two GreptimeDB instances at the same storage provider and prefix.

## Configuration

Configure the WAL in the `[wal]` section of the standalone configuration file. The following example lists every option with its default value:

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

The configuration injection described in [Common Helm Chart Configurations](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md) targets the cluster chart, where this provider is rejected. If you deploy standalone with Helm, see [Deploy GreptimeDB Standalone](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-standalone.md).

### Options

| Configuration Option    | Description | Default Value |
| ----------------------- | ----------- | ------------- |
| `provider`              | The provider of the WAL. Set it to `experimental_object_store` to use the object store WAL. | `"raft_engine"` |
| `storage_provider`      | The name of the storage provider that holds the WAL objects. An empty name selects the default object store configured in `[storage]`. Otherwise, it must match the `name` of a configured storage provider, see [Storage engine provider](/user-guide/deployments-administration/configuration.md#storage-engine-provider). | `""` |
| `prefix`                | The path prefix of the WAL objects inside the storage provider. It must be a non-empty relative path without empty or `..` components. | `"wal"` |
| `flush_interval`        | The interval of flushing buffered entries to the object store. It must be at least `10ms`. Each non-empty timer-triggered flush creates one object. A batch that reaches `max_batch_bytes` before the next tick is flushed immediately. | `"100ms"` |
| `max_batch_bytes`       | The batch size at which buffered entries are flushed without waiting for the timer. It is a threshold, not an upper bound on the object size. | `"8MB"` |
| `ack_mode`              | When an append returns. `durable`: after the object holding its entries is durable. `enqueued`: once its entries are admitted and their IDs are assigned, while the object is created in the background. See [Acknowledgement modes](#acknowledgement-modes). | `"durable"` |
| `max_unpersisted_bytes` | In `enqueued` mode, the size of the unpersisted backlog at which new appends stall until an upload completes. Nothing is dropped or rejected. | `"64MB"` |
| `max_unpersisted_age`   | In `enqueued` mode, the age of the oldest unpersisted entry at which new appends stall until an upload completes. | `"8s"` |
| `on_corrupted_segment`  | What a read does with a segment that still does not decode after a second fetch. `skip` or `fail`. See [Corrupted data](#corrupted-data). | `"skip"` |

The options other than `provider` are used only when `provider` is `experimental_object_store`. `max_unpersisted_bytes` and `max_unpersisted_age` are used only when `ack_mode` is `enqueued`.

### Object layout

The WAL objects are stored under the root of the selected storage provider, with keys of the following form:

```text
<prefix>/datanodes/<node_id>/epochs/<generation>/objects/<seq>.wal
```

Standalone uses node ID `0` and generation `0`, and `<seq>` is a sequence number padded to 20 digits. With the default prefix, the first object is `wal/datanodes/0/epochs/0/objects/00000000000000000000.wal`.

### Environment variables

Like any other option, the WAL options can be set with [environment variables](/user-guide/deployments-administration/configuration.md#environment-variable) using the `GREPTIMEDB_STANDALONE` prefix:

```bash
export GREPTIMEDB_STANDALONE__WAL__PROVIDER=experimental_object_store
export GREPTIMEDB_STANDALONE__WAL__PREFIX=wal
export GREPTIMEDB_STANDALONE__WAL__ACK_MODE=durable
```

## Acknowledgement modes

`ack_mode` decides when a write returns to the client.

- **`durable`** (default): an append returns only after the object holding its entries is durable in the object store. An acknowledged write survives a crash, which is what a WAL is expected to guarantee. The cost is latency: a write waits for its batch to be flushed, for every earlier object to become durable, and for one object create.
- **`enqueued`**: an append returns as soon as its entries are admitted, and the object is created in the background. Writes do not wait for the object store. In measurements on S3, this mode matched the throughput of the local WAL. The cost is durability: a crash loses the unpersisted backlog, that is, the acknowledged entries whose objects are not yet durable.

In `enqueued` mode, `max_unpersisted_bytes` and `max_unpersisted_age` limit how far the backlog can grow while uploads keep up: new appends stall once either threshold is reached. They do not bound what a crash can lose during an object store outage, because acknowledged entries stay in memory for as long as the outage lasts.

Data that has already been flushed to SST files is safe in both modes. Before it records a flush in the region manifest, the storage engine waits until the flushed WAL entries are durable in the object store.

## Flush interval and request cost

Every object costs one request to the object store. When writes are sparse, timer-triggered flushes create at most one object per `flush_interval` per node, which is 10 objects per second at the default `100ms`. A batch is flushed on size only when it reaches `max_batch_bytes` before the next tick. In `enqueued` mode, the backlog thresholds can also flush a batch earlier.

In `durable` mode, a client that sends one write at a time waits for the next flush on every write, so it gets about one batch per interval. Under sustained load on S3, the measured rate was about 600 object creates per minute per node.

When tuning `flush_interval`:

- A shorter interval lowers the latency of sparse `durable` writes and raises the maximum number of object requests in proportion. For example, `10ms` allows up to 100 objects per second per node.
- If a single writer needs throughput close to the local WAL, use `enqueued` mode and accept its loss bound. A shorter interval removes part of the wait, but not the latency of the object create.

## Corrupted data

Each object holds one segment per region. When a segment fails its checksum, or its content does not match the object's index, the read fetches it once more. If it still does not decode, `on_corrupted_segment` decides what happens:

- **`skip`** (default): the segment is skipped and recorded as a WAL hole of its region. A warning is logged and `greptime_logstore_object_store_wal_skipped_segments_total` is incremented. Other regions in the same object are not affected. Only the unflushed entries of that region in that object are lost.
- **`fail`**: the read fails, so the region does not open.

Structural corruption of an object, such as a damaged header or index, is not handled by this option. It fails the WAL when it is opened, so GreptimeDB does not start.

## Garbage collection

Garbage collection is automatic and has no configuration options.

The WAL tracks how far each region has been flushed. From these flushed positions it derives a reclaim boundary, and it deletes the objects below that boundary. The boundary advances after flushes and after a region is dropped. Objects are deleted once the next object carrying the advanced boundary has been written.

As a consequence:

- A prefix that receives no writes keeps its old objects until the next write.
- A region that is written to but rarely flushed holds back the boundary. Objects after its oldest unflushed entry are kept, including those shared with other regions.

The more objects are kept, the more objects GreptimeDB reads when it opens the WAL at startup.

## Observability

The object store WAL exports metrics with the prefix `greptime_logstore_object_store_wal_`. Histograms are exported with the standard `_bucket`, `_sum` and `_count` series.

| Metric | Type | Meaning |
| --- | --- | --- |
| `greptime_logstore_object_store_wal_seal_to_durable_seconds` | Histogram | Time from flushing a batch until its object is created, slot waits and retries included. |
| `greptime_logstore_object_store_wal_append_ack_seconds` | Histogram | Time an append waits for its acknowledgement in `durable` mode, the write latency the client sees. |
| `greptime_logstore_object_store_wal_object_bytes` | Histogram | Size of each object, which shows whether batches are flushed on size or on the timer. |
| `greptime_logstore_object_store_wal_object_entries` | Histogram | Number of entries in each object. |
| `greptime_logstore_object_store_wal_created_objects_total` | Counter | Object creates that succeeded, identical retries included. |
| `greptime_logstore_object_store_wal_create_failures_total` | Counter | Object creates the object store did not confirm. They fail the waiting appends in `durable` mode and are retried in `enqueued` mode. |
| `greptime_logstore_object_store_wal_create_conflicts_total` | Counter | Object creates that found an existing object with different content. |
| `greptime_logstore_object_store_wal_poisoned_total` | Counter | WAL instances that hit an unrecoverable error. |
| `greptime_logstore_object_store_wal_stalled_appends_total` | Counter | Appends held back in `enqueued` mode because the backlog reached a threshold. |
| `greptime_logstore_object_store_wal_stalled_append_seconds` | Histogram | How long such an append is held back before it is admitted or refused. |
| `greptime_logstore_object_store_wal_indexed_objects` | Gauge | Number of objects the WAL currently tracks, which is what opening the WAL at startup would read. |
| `greptime_logstore_object_store_wal_indexed_bytes` | Gauge | Bytes of the objects the WAL currently tracks. |
| `greptime_logstore_object_store_wal_deleted_objects_total` | Counter | Objects deleted by garbage collection. |
| `greptime_logstore_object_store_wal_failed_deletes_total` | Counter | Object deletes that failed. They are retried at the next collection. |
| `greptime_logstore_object_store_wal_recovery_seconds` | Histogram | Time a successful WAL recovery at startup took. |
| `greptime_logstore_object_store_wal_recovered_objects_total` | Counter | Objects read by successful recoveries. |
| `greptime_logstore_object_store_wal_read_seconds` | Histogram | Time a read took to serve the replay of one region. |
| `greptime_logstore_object_store_wal_skipped_segments_total` | Counter | Corrupted segments skipped by reads. |

Alert on any increase of these counters:

- `greptime_logstore_object_store_wal_poisoned_total`: the WAL has stopped accepting writes and needs a restart.
- `greptime_logstore_object_store_wal_create_conflicts_total`: another writer or a stale object was found under the prefix. Check that no other process uses the same prefix.
- `greptime_logstore_object_store_wal_stalled_appends_total`: in `enqueued` mode, writes arrive faster than the uploads complete.

## Limitations

- **Standalone only**: cluster mode is not supported.
- **One writer per prefix**: a prefix cannot be shared between Datanodes or between processes. Conditional creates prevent overwrites, but two processes on one prefix can fail at startup, or run until one of them finds an object written by the other and stops accepting writes.
- **Poisoned WAL**: after an unrecoverable error, such as a conflicting object from another writer, the WAL fails every operation until GreptimeDB restarts.
- **No in-place provider switch**: each region records the WAL provider it was created with. Regions created under `raft_engine` or `kafka` cannot be opened while the instance runs `experimental_object_store`, and regions created under `experimental_object_store` cannot be opened under another provider. The open fails with the error `Incompatible WAL provider change`, and by default GreptimeDB fails to start. Flushing the regions first does not change this, because the check uses the recorded provider, not the unflushed data. Choose the provider when you create a standalone instance.
- **No prefix change**: each region also records the prefix of its WAL. A region whose recorded prefix differs from the configured one fails to open with the error `Object store WAL prefix mismatch`.

## Best practices

- Keep the default options, including `ack_mode = "durable"`, unless you have measured a reason to change them.
- Keep the WAL in the same object store as the data by leaving `storage_provider` empty, unless you have a reason to separate them.
- Choose the WAL provider when you create the instance, and do not change `provider`, `storage_provider` or `prefix` afterwards.
- Alert on `poisoned_total`, `create_conflicts_total` and `stalled_appends_total`.
