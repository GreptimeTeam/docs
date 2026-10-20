---
keywords: [Configuration, Object Store WAL, GreptimeDB standalone, GreptimeDB, S3, experimental]
description: This section describes how to use the experimental object store WAL in GreptimeDB standalone, including its requirements, configuration, durability modes, cost, metrics and limitations.
---
# Object Store WAL

:::warning

The object store WAL is experimental and works in standalone mode only. Its configuration and behavior may change in future versions.

:::

The object store WAL stores the WAL in an object store such as S3, usually the same one that holds your data files. You don't need to deploy or operate any extra component. In the default `durable` mode, a write is acknowledged only after it is stored in the object store, so acknowledged writes are as durable as the object store itself. The `enqueued` mode acknowledges writes earlier and can lose some of them in a crash, see [Durability modes](#durability-modes).

The provider is named `experimental_object_store`. It is supported only in standalone mode. In cluster mode, the Metasrv does not accept this provider, and a Datanode connected to a Metasrv refuses to start with the error `Object store WAL is only supported in standalone mode`.

## Requirements

Check the following before you enable the object store WAL:

- **A new instance**: enable it when you create a standalone instance. A table keeps the WAL provider and `prefix` it was created with, so the tables of an existing instance fail to open after the instance switches to this provider, even if they were flushed first. See [Limitations](#limitations).
- **A supported object store**: the object store that holds the WAL must support conditional writes (if-not-exists) and strongly consistent listing. S3, Google Cloud Storage, Azure Blob Storage and MinIO meet both requirements. An S3-compatible store that lacks either one is not supported. The local file system storage (`type = "File"`) does not provide the guarantees described on this page. By default the WAL uses the storage configured in `[storage]`, so that storage must be one of these object stores unless you set `storage_provider`.
- **Its own location**: each standalone instance needs its own WAL location. Do not let two GreptimeDB instances use the same storage provider and `prefix`.

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
accept_missing_history = false
```

For a new instance that meets the [Requirements](#requirements), setting `provider` is enough.

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
| `max_unpersisted_age`   | In `enqueued` mode, the age of the oldest acknowledged data not yet in the object store at which new writes wait. It does not limit how old that data can get, see [Durability modes](#durability-modes). | `"8s"` |
| `on_corrupted_segment`  | What to do when part of the WAL is corrupted: `skip` or `fail`. See [Corrupted data](#corrupted-data). | `"skip"` |
| `accept_missing_history` | Whether a table opens when GreptimeDB finds that the WAL at the configured location does not hold its history, for example after the WAL location changed without its files being copied. When `true`, such a table opens without its writes that were not flushed, which are lost. Use it only when the old WAL is lost for good, see [Start with missing WAL history](#start-with-missing-wal-history). | `false` |

The options other than `provider` are used only when `provider` is `experimental_object_store`. `max_unpersisted_bytes` and `max_unpersisted_age` are used only when `ack_mode` is `enqueued`.

### Environment variables

Like any other option, the WAL options can be set with [environment variables](/user-guide/deployments-administration/configuration.md#environment-variable) using the `GREPTIMEDB_STANDALONE` prefix:

```bash
export GREPTIMEDB_STANDALONE__WAL__PROVIDER=experimental_object_store
export GREPTIMEDB_STANDALONE__WAL__PREFIX=wal
export GREPTIMEDB_STANDALONE__WAL__ACK_MODE=durable
```

### Where the WAL is stored

With the default `prefix`, a standalone instance stores its WAL under the following path in the storage provider:

```text
wal/datanodes/0/epochs/0/objects/
```

The general form is `<prefix>/datanodes/<node_id>/epochs/<generation>/objects/`. GreptimeDB creates and deletes the files under this path itself. Do not modify or delete them manually.

## Move the WAL

To move only the WAL to another location, store it in a storage provider of its own:

1. If the new location is not configured yet, add it as a storage provider in `[[storage.providers]]`, see [Storage engine provider](/user-guide/deployments-administration/configuration.md#storage-engine-provider). Keep the storage providers that your tables use unchanged.
2. Stop GreptimeDB.
3. Copy every file under `<prefix>/` from the old location to the same paths in the new location.
4. Set `storage_provider` to the `name` of the new storage provider and start GreptimeDB.

Changing the bucket or root of a storage provider that tables also use, such as the default storage in `[storage]`, moves the table data as well. Such a change needs the table data to be migrated too, which this procedure does not cover.

If the location changes without the files being copied, or if the files are deleted, GreptimeDB refuses to open a table when it finds that the table's WAL history is missing: when the location holds no WAL files, or when the newest WAL data there is older than what the table has already flushed. The table fails to open with an error saying that the WAL `does not hold the history of region`, and by default GreptimeDB fails to start. The error names the region, the `prefix` and the storage. GreptimeDB does not check that a location which already holds WAL files is the right one, for example an older copy or the WAL of another instance, so check the location before you start GreptimeDB.

### Start with missing WAL history

If the old WAL is lost for good, start GreptimeDB once with `accept_missing_history = true`. The affected tables open without their writes that were not flushed, which are lost. A warning names each affected region, and `greptime_logstore_object_store_wal_missing_history_accepted_total` counts them. Set the option back to `false` after GreptimeDB has written to the WAL following that start.

## Durability modes

`ack_mode` decides when a write is acknowledged to the client.

- **`durable`** (default): a write is acknowledged only after it is stored in the object store. Acknowledged writes survive a crash. The cost is latency: a write usually waits up to one `flush_interval` plus one object store request, and longer when the object store is slow or earlier writes are still being stored.
- **`enqueued`**: a write is acknowledged as soon as GreptimeDB accepts it, and it is written to the object store in the background. The cost is durability: if GreptimeDB crashes, acknowledged writes that have not reached the object store yet are lost.

In `enqueued` mode, `max_unpersisted_bytes` and `max_unpersisted_age` are thresholds for the acknowledged writes not yet stored in the object store: once either is reached, new writes wait. They do not limit how much data a crash can lose during an object store outage, because writes acknowledged before the outage stay in memory until the object store is reachable again, however long that takes.

When GreptimeDB stops in `enqueued` mode, it first stores the acknowledged writes that are not in the object store yet. If that fails, the writes are lost and GreptimeDB reports the error as it stops.

In both modes, data that has already been flushed to SST files is not affected by a crash.

### Write failures and recovery

In `enqueued` mode, if the object store refuses writes with an error that retrying cannot fix, such as denied access or a missing bucket, GreptimeDB keeps the acknowledged writes in memory and keeps trying to store them, waiting up to 30 seconds between attempts. A crash during this time loses them. Until an attempt succeeds, new writes fail at once with a retryable error, which HTTP ingestion APIs such as InfluxDB line protocol return as status 503. `greptime_logstore_object_store_wal_failing` is 1 during this time, and the logs show the object store error. After you fix the cause, for example the credentials or the bucket, writes resume without a restart.

In `durable` mode, the same errors make the affected writes fail.

## Latency and request cost

Every write to the object store is one request, which affects both latency and cost:

- Start with the default options, including `ack_mode = "durable"`, and change them only when measurements of your workload show a need.
- GreptimeDB writes buffered data to the object store every `flush_interval`, or earlier when the buffer reaches `max_batch_bytes`. At the default `100ms`, the timer alone produces up to 10 requests per second per node; under heavy load, writes triggered by `max_batch_bytes` add more.
- In `durable` mode, a client that sends one small write at a time usually waits for the next `flush_interval` on every write, so `flush_interval` limits how many such writes it completes per second. A write that reaches `max_batch_bytes` on its own is sent without waiting for the timer.
- A shorter `flush_interval` lowers the latency of `durable` writes when writes are sparse, and raises the number of requests in proportion. For example, `10ms` allows up to 100 timer-triggered requests per second per node.
- If a single writer needs more throughput, use `enqueued` mode and accept its durability trade-off. A shorter `flush_interval` alone does not remove the latency of the object store request.

## Corrupted data

`on_corrupted_segment` decides what happens when GreptimeDB finds corrupted data in the WAL while replaying it, for example at startup:

- **`skip`** (default): GreptimeDB skips the corrupted data, logs a warning and increments `greptime_logstore_object_store_wal_skipped_segments_total`. The affected region opens, but its unflushed writes in the corrupted data are lost. Other regions are not affected.
- **`fail`**: the affected region fails to open.

If a WAL file is damaged in a way that cannot be limited to one region, for example a truncated file, GreptimeDB fails to start regardless of this option.

## Garbage collection

GreptimeDB deletes WAL data automatically once it has been flushed to SST files, or once its table has been dropped. There is nothing to configure.

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
| `greptime_logstore_object_store_wal_create_failures_total` | Counter | Object writes that the object store did not confirm. In `durable` mode the affected writes fail; in `enqueued` mode they are retried, with backoff while the object store refuses them. |
| `greptime_logstore_object_store_wal_create_conflicts_total` | Counter | Object writes that found an unexpected existing object, usually because another process uses the same `prefix`. |
| `greptime_logstore_object_store_wal_poisoned_total` | Counter | Times the WAL hit an unrecoverable error and stopped accepting writes. |
| `greptime_logstore_object_store_wal_stalled_appends_total` | Counter | Writes that waited because earlier writes to the object store had not completed, or, in `enqueued` mode, because `max_unpersisted_bytes` or `max_unpersisted_age` was reached. |
| `greptime_logstore_object_store_wal_stalled_append_seconds` | Histogram | How long such a write waited. |
| `greptime_logstore_object_store_wal_failing` | Gauge | 1 while the object store refuses the acknowledged writes of `enqueued` mode with an error such as denied access or a missing bucket. New writes are rejected meanwhile. |
| `greptime_logstore_object_store_wal_rejected_appends_total` | Counter | Writes rejected while `failing` is 1. Table drops whose WAL record is rejected in that state are counted too; the drop itself succeeds and its record is stored later. |
| `greptime_logstore_object_store_wal_release_records_total` | Counter | Records of dropped tables' regions in the WAL. They let GreptimeDB delete the WAL data of dropped tables, also after a restart. |
| `greptime_logstore_object_store_wal_missing_history_accepted_total` | Counter | Regions opened without their WAL history because `accept_missing_history` is `true`. Their writes that were not flushed are lost. |
| `greptime_logstore_object_store_wal_indexed_objects` | Gauge | Number of WAL objects currently kept, which is what GreptimeDB reads at startup. |
| `greptime_logstore_object_store_wal_indexed_bytes` | Gauge | Total size of the WAL objects currently kept. |
| `greptime_logstore_object_store_wal_deleted_objects_total` | Counter | WAL objects deleted by garbage collection. |
| `greptime_logstore_object_store_wal_failed_deletes_total` | Counter | WAL object deletes that failed. They are retried later. |
| `greptime_logstore_object_store_wal_recovery_seconds` | Histogram | Time spent loading the WAL at startup. |
| `greptime_logstore_object_store_wal_recovered_objects_total` | Counter | WAL objects read while loading the WAL at startup. |
| `greptime_logstore_object_store_wal_read_seconds` | Histogram | Time spent reading the WAL to replay one region. |
| `greptime_logstore_object_store_wal_skipped_segments_total` | Counter | Corrupted WAL data skipped during replay. |

Set up these alerts:

- `greptime_logstore_object_store_wal_failing` above 0: the object store refuses WAL writes and new writes are rejected. Check the credentials, permissions and bucket of the storage provider.
- Any increase of `greptime_logstore_object_store_wal_poisoned_total`: the WAL has stopped accepting writes. Restart GreptimeDB after checking the logs.
- Any increase of `greptime_logstore_object_store_wal_create_conflicts_total`: check that no other process uses the same storage provider and `prefix`.
- Any increase of `greptime_logstore_object_store_wal_stalled_appends_total`: writes arrive faster than the object store can store them.
- Any increase of `greptime_logstore_object_store_wal_missing_history_accepted_total`: tables were opened without their unflushed writes. Turn `accept_missing_history` off again as described in [Start with missing WAL history](#start-with-missing-wal-history).

## Limitations

- **Standalone only**: cluster mode is not supported.
- **One instance per location**: two instances that use the same storage provider and `prefix` can fail to start, or one of them can stop accepting writes.
- **Unrecoverable errors**: after an unrecoverable error, such as finding data written by another instance, the WAL rejects all writes until GreptimeDB restarts. Denied access or a missing bucket is not such an error: in `enqueued` mode GreptimeDB keeps retrying, see [Write failures and recovery](#write-failures-and-recovery).
- **No switching of an existing instance**: a table keeps the WAL provider it was created with. Tables created under `raft_engine` or `kafka` cannot be opened after you switch an instance to `experimental_object_store`, and the reverse is also true. GreptimeDB reports `Incompatible WAL provider change` and, by default, fails to start. Even if the tables are flushed before the switch, they still cannot be opened. Choose the WAL provider when you create the instance.
- **No prefix change**: tables also keep the WAL `prefix` they were created with. After `prefix` is changed, they fail to open with the error `Object store WAL prefix mismatch`.
- **WAL location changes**: changing `storage_provider`, or the bucket or root of the storage provider it names, requires copying the WAL files to the new location first, see [Move the WAL](#move-the-wal). Without the copy, or after the files are deleted, the affected tables fail to open when GreptimeDB finds that their history is missing, and by default GreptimeDB fails to start. GreptimeDB does not detect every wrong location.
- **Crash while dropping a table**: if GreptimeDB crashes while dropping a table, or crashes after the WAL could not record a drop and before the object store accepts writes again, the dropped table's WAL data is never deleted and keeps other old WAL data from being deleted too. You can recognize this when `indexed_objects` only grows while `deleted_objects_total` stays the same. The first case is tracked in [GreptimeTeam/greptimedb#9577](https://github.com/GreptimeTeam/greptimedb/issues/9577).
