---
keywords: [配置, 对象存储 WAL, GreptimeDB 单机模式, GreptimeDB, S3, 实验性]
description: 介绍如何在 GreptimeDB 单机模式下使用实验性的对象存储 WAL，包括使用前提、配置、持久性模式、成本、监控指标和限制。
---
# 对象存储 WAL

:::warning

对象存储 WAL 目前是实验性功能，仅在 Nightly 构建中提供，并且只支持单机模式。它的配置和行为在后续版本中可能会调整。

:::

对象存储 WAL 把 WAL 存放在 S3 等对象存储中，通常就是存放数据文件的那个对象存储。使用它不需要额外部署和运维任何组件，WAL 的持久性与对象存储本身一致。

该 WAL 提供者的名称是 `experimental_object_store`，只支持单机模式。集群模式下 Metasrv 不接受这个提供者；连接了 Metasrv 的 Datanode 会拒绝启动，并报错 `Object store WAL is only supported in standalone mode`。

如果想了解其内部实现，请参阅 [对象存储 WAL RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2026-09-06-object-store-wal.md)。

## 使用前提

对象存储需要支持条件写入（if-not-exists）和强一致的列举（LIST）。S3、Google Cloud Storage、Azure Blob Storage 和 MinIO 都满足要求；缺少其中任意一项的 S3 兼容存储不受支持。本地文件系统存储（`type = "File"`）无法提供本文所述的保证。

每个单机实例都需要独立的 WAL 存放位置。不要让两个 GreptimeDB 实例使用同一个存储提供者和 `prefix`。

## 配置

在单机模式配置文件的 `[wal]` 部分进行配置。下面的示例启用了对象存储 WAL，其余选项均为默认值：

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

大多数情况下，只需设置 `provider`。

[常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)中介绍的配置文件注入方式针对的是集群 Chart，而集群模式不支持这个提供者。如果使用 Helm 部署单机模式，请参考[部署 GreptimeDB 单机版](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-standalone.md)。

### 选项

| 配置项                  | 描述 | 默认值 |
| ----------------------- | ---- | ------ |
| `provider`              | WAL 的提供者。设为 `experimental_object_store` 即使用对象存储 WAL。 | `"raft_engine"` |
| `storage_provider`      | 存放 WAL 的存储提供者。留空表示使用 `[storage]` 中配置的默认对象存储；否则填写某个已配置存储提供者的 `name`，参见[存储引擎提供商](/user-guide/deployments-administration/configuration.md#存储引擎提供商)。 | `""` |
| `prefix`                | WAL 在存储提供者中的存放路径。必须是非空的相对路径，不能包含空路径段或 `..`。 | `"wal"` |
| `flush_interval`        | 把缓冲的写入写到对象存储的时间间隔，最小为 `10ms`。参见[延迟与请求成本](#延迟与请求成本)。 | `"100ms"` |
| `max_batch_bytes`       | 缓冲数据达到这个大小时立即写到对象存储，不再等待 `flush_interval`。 | `"8MB"` |
| `ack_mode`              | 写入何时确认：`durable` 或 `enqueued`。参见[持久性模式](#持久性模式)。 | `"durable"` |
| `max_unpersisted_bytes` | `enqueued` 模式下，已确认但尚未写入对象存储的数据达到这个大小时，新的写入会等待。 | `"64MB"` |
| `max_unpersisted_age`   | `enqueued` 模式下，已确认的数据未写入对象存储的时间达到这个时长时，新的写入会等待。它并不限制这些数据最长滞留多久，参见[持久性模式](#持久性模式)。 | `"8s"` |
| `on_corrupted_segment`  | WAL 中有数据损坏时的处理方式：`skip` 或 `fail`。参见[数据损坏](#数据损坏)。 | `"skip"` |
| `accept_missing_history` | 当 GreptimeDB 发现配置的 WAL 位置中没有某张表的 WAL 历史时（例如更换了 WAL 位置但没有复制文件），是否仍然打开这张表。设为 `true` 时，这类表会在丢失未 flush 写入的情况下打开。仅用于 WAL 丢失后的恢复，参见[迁移 WAL](#迁移-wal)。 | `false` |

除 `provider` 外，以上选项仅在 `provider` 为 `experimental_object_store` 时生效；`max_unpersisted_bytes` 和 `max_unpersisted_age` 仅在 `ack_mode` 为 `enqueued` 时生效。

### WAL 的存放位置

使用默认 `prefix` 时，单机实例的 WAL 存放在存储提供者的以下路径下：

```text
wal/datanodes/0/epochs/0/objects/
```

通用格式为 `<prefix>/datanodes/<node_id>/epochs/<generation>/objects/`。该路径下的文件由 GreptimeDB 自行创建和删除，请勿手动修改或删除。

### 迁移 WAL

如果只想把 WAL 迁移到其他位置，请为它单独使用一个存储提供者：

1. 如果新位置尚未配置，先在 `[[storage.providers]]` 中把它添加为存储提供者，参见[存储引擎提供商](/user-guide/deployments-administration/configuration.md#存储引擎提供商)。表所使用的存储提供者保持不变。
2. 停止 GreptimeDB。
3. 把旧位置 `<prefix>/` 下的所有文件复制到新位置的相同路径下。
4. 把 `storage_provider` 设为新存储提供者的 `name`，然后启动 GreptimeDB。

这样所有表都能带着全部写入正常打开。

如果修改的是表也在使用的存储提供者（例如 `[storage]` 中的默认存储）的 bucket 或根路径，表数据的位置也会随之改变。这种情况还需要迁移表数据，不在本流程的范围内。

如果更换了位置但没有复制文件，或者这些文件被删除，GreptimeDB 在发现某张表的 WAL 历史缺失时会拒绝打开这张表，即该位置没有任何 WAL 文件，或者那里最新的 WAL 数据比这张表已经 flush 的数据还旧。此时报错中会提示 WAL `does not hold the history of region`，默认情况下 GreptimeDB 无法启动。报错信息会给出对应的 Region、`prefix` 和存储。对于已经存在 WAL 文件的位置，GreptimeDB 不会检查它是否是正确的位置（例如旧的副本或其他实例的 WAL），因此启动前请确认位置无误。

如果旧的 WAL 已经彻底丢失，可以设置 `accept_missing_history = true` 启动一次 GreptimeDB。受影响的表会打开，但未 flush 的写入会丢失。每个受影响的 Region 都会输出一条警告，并计入 `greptime_logstore_object_store_wal_missing_history_accepted_total`。在这次启动之后、GreptimeDB 向 WAL 写入过数据后，请把该选项改回 `false`。

### 环境变量

和其他配置项一样，WAL 选项也可以通过带 `GREPTIMEDB_STANDALONE` 前缀的[环境变量](/user-guide/deployments-administration/configuration.md#环境变量)设置：

```bash
export GREPTIMEDB_STANDALONE__WAL__PROVIDER=experimental_object_store
export GREPTIMEDB_STANDALONE__WAL__PREFIX=wal
export GREPTIMEDB_STANDALONE__WAL__ACK_MODE=durable
```

## 持久性模式

`ack_mode` 决定写入何时向客户端确认。

- **`durable`**（默认）：写入保存到对象存储之后才确认，已确认的写入在崩溃后不会丢失。代价是延迟：一次写入通常要等待最多一个 `flush_interval`，再加上一次对象存储请求的时间；对象存储较慢或之前的写入尚未保存完成时，等待会更久。
- **`enqueued`**：GreptimeDB 接收写入后立即确认，数据在后台写到对象存储。在 S3 上的测试中，这种模式的吞吐与本地 WAL 持平。代价是持久性：GreptimeDB 崩溃时，已确认但尚未写到对象存储的写入会丢失。

在 `enqueued` 模式下，当对象存储跟不上写入速度时，`max_unpersisted_bytes` 和 `max_unpersisted_age` 会让新的写入放慢，避免待写入的数据持续增长。但在对象存储故障期间，它们并不能限制崩溃时的损失，因为故障前已确认的写入会一直留在内存中，无论故障持续多久，直到对象存储恢复。

在 `enqueued` 模式下停止 GreptimeDB 时，会先上传尚未保存的已确认写入。如果上传失败，这些写入会丢失，GreptimeDB 在停止时会报告该错误。

在 `enqueued` 模式下，如果对象存储以重试也无法解决的错误拒绝写入，例如没有访问权限或 bucket 不存在，GreptimeDB 会把已确认的写入保留在内存中并持续重试，两次尝试之间最多间隔 30 秒。这期间如果发生崩溃，这些写入会丢失。在某次重试成功之前，新的写入会立即失败并返回可重试的错误，InfluxDB 行协议等 HTTP 写入接口返回的状态码为 503。这期间 `greptime_logstore_object_store_wal_failing` 为 1，日志中会记录对象存储返回的错误。修复问题（例如凭证或 bucket）之后，写入会自动恢复，无需重启。在 `durable` 模式下，同样的错误只会让相关写入失败。

两种模式下，已经 flush 到 SST 文件的数据都不受崩溃影响。

## 延迟与请求成本

每次写入对象存储都是一次请求，既影响延迟，也影响成本：

- GreptimeDB 每隔 `flush_interval` 把缓冲的数据写到对象存储；缓冲达到 `max_batch_bytes` 时会提前写出。在默认的 `100ms` 下，仅定时写出每个节点每秒最多产生 10 次请求；负载较高时，由 `max_batch_bytes` 触发的写出还会增加请求数。
- 在 S3 上，每次请求的中位耗时约为 50 ms。持续写入时，实测每个节点每分钟约 600 次请求。
- 在 `durable` 模式下，每次只发一个写入的客户端，大约每个 `flush_interval` 只能完成一次写入。

调优建议：

- 写入稀疏时，缩短 `flush_interval` 可以降低 `durable` 写入的延迟，请求数也会按比例增加。例如 `10ms` 时，定时写出每个节点每秒最多产生 100 次请求。
- 如果单个写入方需要接近本地 WAL 的吞吐，请使用 `enqueued` 模式并接受它在持久性上的取舍。只缩短 `flush_interval` 无法消除对象存储请求本身的延迟。

## 数据损坏

`on_corrupted_segment` 决定 GreptimeDB 在重放 WAL（例如启动时）发现数据损坏后如何处理：

- **`skip`**（默认）：跳过损坏的数据，输出警告日志，并增加 `greptime_logstore_object_store_wal_skipped_segments_total` 计数。受影响的 Region 可以正常打开，但其位于损坏数据中、尚未 flush 的写入会丢失。其他 Region 不受影响。
- **`fail`**：受影响的 Region 无法打开。

如果 WAL 文件的损坏无法限定在单个 Region 内，例如文件被截断，无论该选项如何设置，GreptimeDB 都无法启动。

## 垃圾回收

数据 flush 到 SST 文件后，或者所属的表被删除后，GreptimeDB 会自动删除对应的 WAL 数据，无需任何配置。

需要注意：

- 旧的 WAL 数据在 flush 之后的下一次写入时才会删除。因此没有新写入的实例会一直保留旧的 WAL 数据，直到再次有写入。
- 持续有写入但很少 flush 的表会让 WAL 数据无法删除，其他表的 WAL 数据也会受影响。这会增加存储占用和启动时间。对于这类表，请定期执行 flush，例如使用 [`ADMIN flush_table`](/reference/sql/admin.md)。

## 监控

对象存储 WAL 导出的指标都以 `greptime_logstore_object_store_wal_` 为前缀。直方图按标准方式导出 `_bucket`、`_sum` 和 `_count` 序列。

| 指标 | 类型 | 含义 |
| --- | --- | --- |
| `greptime_logstore_object_store_wal_seal_to_durable_seconds` | Histogram | 把缓冲数据写到对象存储的耗时。 |
| `greptime_logstore_object_store_wal_append_ack_seconds` | Histogram | `durable` 模式下写入等待 WAL 的时间，是整体写入延迟的一部分。 |
| `greptime_logstore_object_store_wal_object_bytes` | Histogram | 每个写到对象存储的对象的大小。 |
| `greptime_logstore_object_store_wal_object_entries` | Histogram | 每个对象包含的 WAL 条目数。 |
| `greptime_logstore_object_store_wal_created_objects_total` | Counter | 成功写入的对象数。 |
| `greptime_logstore_object_store_wal_create_failures_total` | Counter | 对象存储未确认的对象写入次数。`durable` 模式下相关写入会失败，`enqueued` 模式下会重试；对象存储拒绝写入期间会逐步拉长重试间隔。 |
| `greptime_logstore_object_store_wal_create_conflicts_total` | Counter | 写入对象时发现意外已存在对象的次数，通常是有其他进程使用了同一个 `prefix`。 |
| `greptime_logstore_object_store_wal_poisoned_total` | Counter | WAL 遇到不可恢复错误并停止接受写入的次数。 |
| `greptime_logstore_object_store_wal_stalled_appends_total` | Counter | 因之前写往对象存储的数据尚未完成，或在 `enqueued` 模式下达到 `max_unpersisted_bytes` 或 `max_unpersisted_age`，而需要等待的写入数。 |
| `greptime_logstore_object_store_wal_stalled_append_seconds` | Histogram | 这类写入等待的时间。 |
| `greptime_logstore_object_store_wal_failing` | Gauge | `enqueued` 模式下，对象存储以没有访问权限、bucket 不存在等错误拒绝已确认的写入时为 1。这期间新的写入会被拒绝。 |
| `greptime_logstore_object_store_wal_rejected_appends_total` | Counter | `failing` 为 1 期间被拒绝的写入数。这期间删除表时 WAL 记录被拒绝的情况也计入其中；删除表本身会成功，记录会在之后保存。 |
| `greptime_logstore_object_store_wal_release_records_total` | Counter | WAL 中记录的已删除表的 Region 数。GreptimeDB 依据这些记录删除已删除表的 WAL 数据，重启后同样有效。 |
| `greptime_logstore_object_store_wal_missing_history_accepted_total` | Counter | 因 `accept_missing_history` 为 `true` 而在缺少 WAL 历史的情况下打开的 Region 数，这些 Region 未 flush 的写入已丢失。 |
| `greptime_logstore_object_store_wal_indexed_objects` | Gauge | 当前保留的 WAL 对象数，也就是启动时需要读取的对象数。 |
| `greptime_logstore_object_store_wal_indexed_bytes` | Gauge | 当前保留的 WAL 对象的总大小。 |
| `greptime_logstore_object_store_wal_deleted_objects_total` | Counter | 垃圾回收删除的 WAL 对象数。 |
| `greptime_logstore_object_store_wal_failed_deletes_total` | Counter | 删除失败的 WAL 对象数，之后会重试。 |
| `greptime_logstore_object_store_wal_recovery_seconds` | Histogram | 启动时加载 WAL 的耗时。 |
| `greptime_logstore_object_store_wal_recovered_objects_total` | Counter | 启动时加载 WAL 读取的对象数。 |
| `greptime_logstore_object_store_wal_read_seconds` | Histogram | 为重放一个 Region 读取 WAL 的耗时。 |
| `greptime_logstore_object_store_wal_skipped_segments_total` | Counter | 重放时跳过的损坏 WAL 数据数。 |

建议设置以下告警：

- `greptime_logstore_object_store_wal_failing` 大于 0：对象存储拒绝了 WAL 写入，新的写入会被拒绝。请检查存储提供者的凭证、权限和 bucket。
- `greptime_logstore_object_store_wal_poisoned_total` 有任何增长：WAL 已停止接受写入。检查日志后重启 GreptimeDB。
- `greptime_logstore_object_store_wal_create_conflicts_total` 有任何增长：检查是否有其他进程使用了同一个存储提供者和 `prefix`。
- `greptime_logstore_object_store_wal_stalled_appends_total` 有任何增长：写入速度超过了对象存储的写入能力。
- `greptime_logstore_object_store_wal_missing_history_accepted_total` 有任何增长：有表在丢失未 flush 写入的情况下被打开。请按照[迁移 WAL](#迁移-wal)中的说明关闭 `accept_missing_history`。

## 限制

- **仅支持单机模式**：不支持集群模式。
- **一个位置只能对应一个实例**：两个实例使用同一个存储提供者和 `prefix` 时，可能无法启动，或者其中一个停止接受写入。
- **不可恢复的错误**：遇到不可恢复的错误（例如发现其他实例写入的数据）后，WAL 会拒绝所有写入，直到 GreptimeDB 重启。没有访问权限或 bucket 不存在不属于这类错误：在 `enqueued` 模式下 GreptimeDB 会持续重试，参见[持久性模式](#持久性模式)。
- **已有实例不能切换提供者**：表会沿用创建时的 WAL 提供者。在 `raft_engine` 或 `kafka` 下创建的表，在实例切换到 `experimental_object_store` 后无法打开，反之亦然。GreptimeDB 会报错 `Incompatible WAL provider change`，默认情况下无法启动。切换前先 flush 也无济于事。请在创建实例时就选定 WAL 提供者。
- **不能修改前缀**：表也会沿用创建时的 WAL `prefix`。修改 `prefix` 后，这些表打开时会报错 `Object store WAL prefix mismatch`。
- **WAL 历史只存在于其文件所在的位置**：修改 `storage_provider`，或它所指向存储提供者的 bucket、根路径后没有复制 WAL 文件，或者这些文件被删除时，GreptimeDB 发现历史缺失的表将无法打开，默认情况下 GreptimeDB 无法启动。GreptimeDB 并不能识别所有错误的位置。参见[迁移 WAL](#迁移-wal)。
- **删除表时发生崩溃**：如果 GreptimeDB 在删除表的过程中崩溃，或者在 WAL 未能记录删除操作之后、对象存储恢复接受写入之前崩溃，被删除表的 WAL 数据将不会被删除，还会导致其他旧的 WAL 数据也无法删除。此时可以看到 `indexed_objects` 持续增长，而 `deleted_objects_total` 不再变化。第一种情况由 [GreptimeTeam/greptimedb#9577](https://github.com/GreptimeTeam/greptimedb/issues/9577) 跟踪。

## 最佳实践

- 除非有实测依据，否则保持默认配置，包括 `ack_mode = "durable"`。
- 除非有明确理由，否则让 `storage_provider` 留空，把 WAL 和数据放在同一个对象存储中。
- 在创建实例时选定 WAL 提供者，之后不要再修改 `provider` 或 `prefix`。如需迁移 WAL，请按照[迁移 WAL](#迁移-wal)中的步骤操作。
- 对于持续有写入但很少自动 flush 的表，定期执行 flush，以便旧的 WAL 数据可以被删除。
- 对 `failing`、`poisoned_total`、`create_conflicts_total` 和 `stalled_appends_total` 设置告警。
