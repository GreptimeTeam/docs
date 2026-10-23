---
keywords: [配置, 对象存储 WAL, GreptimeDB 单机模式, GreptimeDB, S3, 实验性]
description: 介绍如何在 GreptimeDB 单机模式下使用实验性的对象存储 WAL，包括使用前提、配置、持久性模式、成本、故障排查和限制。
---
# 对象存储 WAL

:::warning

对象存储 WAL 目前是实验性功能，只支持单机模式。它的配置和行为在后续版本中可能会调整。

:::

对象存储 WAL 把 WAL 存放在 S3 等对象存储中，通常就是存放数据文件的那个对象存储。使用它不需要额外部署和运维任何组件。在默认的 `durable` 模式下，写入持久化到对象存储之后才会确认，因此已确认写入的持久性与对象存储本身一致。`enqueued` 模式会更早确认写入，崩溃时可能丢失其中一部分，参见[持久性模式](#持久性模式)。

该 WAL 提供者的名称是 `experimental_object_store`，只支持单机模式。集群模式下 Metasrv 不接受这个提供者；连接了 Metasrv 的 Datanode 会拒绝启动，并报错 `Object store WAL is only supported in standalone mode`。

## 使用前提

启用对象存储 WAL 之前，请确认以下几点：

- **新实例**：请在创建单机实例时启用。表会沿用创建时的 WAL 提供者和 `prefix`，因此已有实例切换到这个提供者后，原有的表将无法打开，即使事先 flush 过也一样。参见[限制](#限制)。
- **受支持的对象存储**：存放 WAL 的对象存储需要支持条件创建（只在对象不存在时才写入）和强一致的列举（LIST），参见[受支持的对象存储](#受支持的对象存储)。缺少其中任意一项的 S3 兼容存储不受支持。本地文件系统存储（`type = "File"`）无法提供本文所述的保证。默认情况下 WAL 使用 `[storage]` 中配置的存储，因此除非设置了 `storage_provider`，该存储必须满足上述要求。
- **独立的存放位置**：每个单机实例都需要独立的 WAL 存放位置。不要让两个 GreptimeDB 实例使用同一个存储提供商和 `prefix`。

### 受支持的对象存储

每个 WAL 文件都通过条件创建写入，`type = "S3"` 发送的是 `If-None-Match: *`。有些对象存储接受这个条件却不执行，直接覆盖已有对象。在这样的存储上，WAL 可能覆盖自己的文件，丢失已确认的写入，而且不报任何错误。

GreptimeDB 在启动时、读取 WAL 之前检查这一点：在 `<prefix>/datanodes/<node_id>/epochs/<generation>/probes/` 下用唯一的名字创建同一个对象两次，对象存储必须拒绝第二次创建，然后删除这个对象。如果对象存储接受了第二次创建，GreptimeDB 拒绝启动，报 `Invalid WAL object store` 错误，说明对象存储在条件创建时覆盖了已有对象。每次启动这项检查需要两次写入和一次删除。如果删除失败，GreptimeDB 会记录一条警告，对象会留下来；GreptimeDB 不会读取它，可以手动删除。这项检查能发现忽略条件的存储，但发现不了只在部分情况下执行条件的存储，所以还请核对下面的版本要求。

已知支持条件创建的对象存储：

| 对象存储 | `type` | 说明 |
| --- | --- | --- |
| Amazon S3 | `S3` | S3 on Outposts 除外。 |
| Cloudflare R2 | `S3` | |
| Azure Blob Storage | `Azblob` | |
| Google Cloud Storage | `Gcs` | 请使用 `type = "Gcs"`。它的 S3 兼容端点会忽略条件。 |
| 阿里云 OSS | `Oss` | 使用未开启版本控制的 bucket。 |
| MinIO | `S3` | RELEASE.2024-05-07T06-41-25Z 及以后的版本。 |
| Ceph RGW | `S3` | 未开启版本控制的 bucket；开启版本控制的 bucket 需要 Tentacle v20.2.1 及以后的版本。 |
| SeaweedFS | `S3` | 4.18 及以后的版本；有多个 filer 时需要 4.46 及以后的版本。 |
| OpenStack Swift（s3api） | `S3` | 2.36.0 及以后的版本。 |

其他对象存储和版本的已知限制：

- 以下存储会忽略条件、直接覆盖对象：通过 S3 兼容端点访问的 Google Cloud Storage、NetApp StorageGRID 12.0 及更早版本、Garage、Scality CloudServer、RELEASE.2024-05-07T06-41-25Z 之前的 MinIO，以及 Tentacle v20.2.1 之前 Ceph RGW 开启版本控制的 bucket。
- 以下存储会拒绝条件，GreptimeDB 因此无法启动：通过 `type = "S3"` 访问的阿里云 OSS，以及 2.36.0 之前的 OpenStack Swift s3api。
- 阿里云 OSS、腾讯云 COS 和火山引擎 TOS 的文档说明，它们各自的禁止覆盖请求头在开启版本控制的 bucket 上不起作用。`type = "Oss"` 时 GreptimeDB 发送的就是 OSS 的这个请求头，因此不要使用开启版本控制的 bucket。
- MinIO 社区版在拿不到读 quorum 时可能跳过条件。修复（[minio/minio#21653](https://github.com/minio/minio/pull/21653)）没有进入任何社区版二进制发布。

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

对于满足[使用前提](#使用前提)的新实例，只需设置 `provider`。

### 选项

| 配置项                  | 描述 | 默认值 |
| ----------------------- | ---- | ------ |
| `provider`              | WAL 的提供者。设为 `experimental_object_store` 即使用对象存储 WAL。 | `"raft_engine"` |
| `storage_provider`      | 存放 WAL 的存储提供商。留空表示使用 `[storage]` 中配置的默认对象存储；否则填写某个已配置存储提供商的 `name`，参见[存储引擎提供商](/user-guide/deployments-administration/configuration.md#存储引擎提供商)。 | `""` |
| `prefix`                | WAL 在存储提供商中的存放路径。必须是非空的相对路径，不能包含空路径段或 `..`。 | `"wal"` |
| `flush_interval`        | 把缓冲的写入持久化到对象存储的时间间隔，最小为 `10ms`。参见[延迟与请求成本](#延迟与请求成本)。 | `"100ms"` |
| `max_batch_bytes`       | 缓冲数据达到这个大小时立即持久化到对象存储，不再等待 `flush_interval`。 | `"8MB"` |
| `ack_mode`              | 写入何时确认：`durable` 或 `enqueued`。参见[持久性模式](#持久性模式)。 | `"durable"` |
| `max_unpersisted_bytes` | `enqueued` 模式下，已确认但尚未持久化到对象存储的数据达到这个大小时，新的写入会等待。 | `"64MB"` |
| `max_unpersisted_age`   | `enqueued` 模式下，已确认但尚未持久化到对象存储的数据滞留时间达到这个时长时，新的写入会等待。它并不限制这些数据最长滞留多久，参见[持久性模式](#持久性模式)。 | `"8s"` |
| `on_corrupted_segment`  | WAL 中有数据损坏时的处理方式：`skip` 或 `fail`。参见[数据损坏](#数据损坏)。 | `"skip"` |
| `accept_missing_history` | 当 GreptimeDB 发现配置的 WAL 位置中没有某张表的 WAL 历史时（例如更换了 WAL 位置但没有复制文件），是否仍然打开这张表。设为 `true` 时，这类表会打开，但未 flush 到 SST 文件的写入会丢失。仅在旧的 WAL 已彻底丢失时使用，参见[在 WAL 历史缺失时启动](#在-wal-历史缺失时启动)。 | `false` |

除 `provider` 外，以上选项仅在 `provider` 为 `experimental_object_store` 时生效；`max_unpersisted_bytes` 和 `max_unpersisted_age` 仅在 `ack_mode` 为 `enqueued` 时生效。

### WAL 的存放位置

使用默认 `prefix` 时，单机实例的 WAL 存放在存储提供商的以下路径下：

```text
wal/datanodes/0/epochs/0/objects/
```

通用格式为 `<prefix>/datanodes/<node_id>/epochs/<generation>/objects/`。该路径下的文件由 GreptimeDB 自行创建和删除，请勿手动修改或删除。

## 迁移 WAL

如果只想把 WAL 迁移到其他位置，请为它单独使用一个存储提供商：

1. 如果新位置尚未配置，先在 `[[storage.providers]]` 中把它添加为存储提供商，参见[存储引擎提供商](/user-guide/deployments-administration/configuration.md#存储引擎提供商)。表所使用的存储提供商保持不变。
2. 停止 GreptimeDB。
3. 把旧位置 `<prefix>/` 下的所有文件复制到新位置的相同路径下。
4. 把 `storage_provider` 设为新存储提供商的 `name`，然后启动 GreptimeDB。

如果修改的是表也在使用的存储提供商（例如 `[storage]` 中的默认存储）的 bucket 或根路径，表数据的位置也会随之改变。这种情况还需要迁移表数据，不在本流程的范围内。

如果更换了位置但没有复制文件，或者这些文件被删除，GreptimeDB 在发现某张表的 WAL 历史缺失时会拒绝打开这张表，即该位置没有任何 WAL 文件，或者那里最新的 WAL 数据比这张表已经 flush 到 SST 文件的数据还旧。此时报错中会提示 WAL `does not hold the history of region`，默认情况下 GreptimeDB 无法启动。报错信息会给出对应的 Region、`prefix` 和存储。对于已经存在 WAL 文件的位置，GreptimeDB 不会检查它是否是正确的位置（例如旧的副本或其他实例的 WAL），因此启动前请确认位置无误。

### 在 WAL 历史缺失时启动

如果旧的 WAL 已经彻底丢失，可以设置 `accept_missing_history = true` 启动一次 GreptimeDB。受影响的表会打开，但未 flush 到 SST 文件的写入会丢失。每个受影响的 Region 都会输出一条警告，并计入 `greptime_logstore_object_store_wal_missing_history_accepted_total`。在这次启动之后、GreptimeDB 向 WAL 写入过数据后，请把该选项改回 `false`。

## 持久性模式

`ack_mode` 决定写入何时向客户端确认。

- **`durable`**（默认）：写入持久化到对象存储之后才确认，已确认的写入在崩溃后不会丢失。代价是延迟：一次写入通常要等待最多一个 `flush_interval`，再加上一次对象存储请求的时间；对象存储较慢或之前的写入尚未持久化完成时，等待会更久。
- **`enqueued`**：GreptimeDB 接收写入后立即确认，再在后台把数据持久化到对象存储。代价是持久性：GreptimeDB 崩溃时，已确认但尚未持久化到对象存储的写入会丢失。

在 `enqueued` 模式下，`max_unpersisted_bytes` 和 `max_unpersisted_age` 是针对已确认但尚未持久化到对象存储的写入的阈值：达到阈值后，新的写入会等待。但在对象存储故障期间，它们并不能限制崩溃时的损失，因为故障前已确认的写入会一直留在内存中，无论故障持续多久，直到对象存储恢复。

在 `enqueued` 模式下停止 GreptimeDB 时，会先把尚未持久化的已确认写入持久化到对象存储。如果持久化失败，这些写入会丢失，GreptimeDB 在停止时会报告该错误。

两种模式下，已经 flush 到 SST 文件的数据都不受崩溃影响。

### 写入失败与恢复

在 `enqueued` 模式下，如果对象存储以重试也无法解决的错误拒绝写入，例如没有访问权限或 bucket 不存在，GreptimeDB 会把已确认的写入保留在内存中，并持续尝试将其持久化到对象存储，两次尝试之间最多间隔 30 秒。这期间如果发生崩溃，这些写入会丢失。在某次尝试成功之前，新的写入会立即失败并返回可重试的错误，InfluxDB 行协议等 HTTP 写入接口返回的状态码为 503。这期间 `greptime_logstore_object_store_wal_failing` 为 1，建议在它大于 0 时告警；日志中也会记录对象存储返回的错误。修复问题（例如凭证或 bucket）之后，写入会自动恢复，无需重启。

在 `durable` 模式下，同样的错误只会让相关写入失败。

## 延迟与请求成本

每次持久化到对象存储都是一次请求，既影响延迟，也影响成本：

- 请先使用默认配置（包括 `ack_mode = "durable"`），只有在针对实际负载的测量表明有需要时才调整。
- GreptimeDB 每隔 `flush_interval` 把缓冲的数据持久化到对象存储；缓冲达到 `max_batch_bytes` 时会提前持久化。在默认的 `100ms` 下，仅定时持久化每个节点每秒最多产生 10 次请求；负载较高时，由 `max_batch_bytes` 触发的持久化还会增加请求数。
- 在 `durable` 模式下，每次只发一个小批量写入的客户端，通常每次写入都要等到下一个 `flush_interval`，因此这类写入每秒能完成的数量受 `flush_interval` 限制。单次写入本身就达到 `max_batch_bytes` 时，会立即持久化，不必等待定时器。
- 写入稀疏时，缩短 `flush_interval` 可以降低 `durable` 写入的延迟，请求数也会按比例增加。例如 `10ms` 时，定时持久化每个节点每秒最多产生 100 次请求。
- 如果单个写入方需要更高的吞吐，请使用 `enqueued` 模式并接受它在持久性上的取舍。只缩短 `flush_interval` 无法消除对象存储请求本身的延迟。

## 数据损坏

`on_corrupted_segment` 决定 GreptimeDB 在重放 WAL（例如启动时）发现数据损坏后如何处理：

- **`skip`**（默认）：跳过损坏的数据，输出警告日志，并增加 `greptime_logstore_object_store_wal_skipped_segments_total` 计数。受影响的 Region 可以正常打开，但其位于损坏数据中、尚未 flush 到 SST 文件的写入会丢失。其他 Region 不受影响。
- **`fail`**：受影响的 Region 无法打开。

如果 WAL 文件的损坏无法限定在单个 Region 内，例如文件被截断，无论该选项如何设置，GreptimeDB 都无法启动。

## 垃圾回收

数据 flush 到 SST 文件后，或者所属的表被删除后，GreptimeDB 会自动删除对应的 WAL 数据，无需任何配置。

需要注意：

- 旧的 WAL 数据在 flush 之后的下一次写入时才会删除。因此没有新写入的实例会一直保留旧的 WAL 数据，直到再次有写入。
- 持续有写入但很少 flush 的表会让 WAL 数据无法删除，其他表的 WAL 数据也会受影响。这会增加存储占用和启动时间。对于这类表，请定期执行 flush，例如使用 [`ADMIN flush_table`](/reference/sql/admin.md)。
- 如果 `greptime_logstore_object_store_wal_indexed_objects` 持续增长，而 `greptime_logstore_object_store_wal_deleted_objects_total` 不再变化，说明垃圾回收没有进展。请检查是否存在这类表，或者是否出现了[限制](#限制)中“删除表时发生崩溃”的情况。

## 限制

- **仅支持单机模式**：不支持集群模式。
- **一个位置只能对应一个实例**：两个实例使用同一个存储提供商和 `prefix` 时，可能无法启动，或者其中一个停止接受写入。`greptime_logstore_object_store_wal_create_conflicts_total` 增长就是这种情况的迹象。
- **不可恢复的错误**：遇到不可恢复的错误（例如发现其他实例写入的数据）后，WAL 会拒绝所有写入，直到 GreptimeDB 重启，同时 `greptime_logstore_object_store_wal_poisoned_total` 会增长。重启前请先检查日志。没有访问权限或 bucket 不存在不属于这类错误：在 `enqueued` 模式下 GreptimeDB 会持续重试，参见[写入失败与恢复](#写入失败与恢复)。
- **已有实例不能切换提供者**：表会沿用创建时的 WAL 提供者。在 `raft_engine` 或 `kafka` 下创建的表，在实例切换到 `experimental_object_store` 后无法打开，反之亦然。GreptimeDB 会报错 `Incompatible WAL provider change`，默认情况下无法启动。即使切换前已执行 flush，仍无法打开这些表。请在创建实例时就选定 WAL 提供者。
- **不能修改前缀**：表也会沿用创建时的 WAL `prefix`。修改 `prefix` 后，这些表打开时会报错 `Object store WAL prefix mismatch`。
- **更改 WAL 存储位置**：更改 `storage_provider`，或它所指向存储提供商的 bucket、根路径时，需要先把 WAL 文件复制到新位置，参见[迁移 WAL](#迁移-wal)。如果没有复制，或者这些文件被删除，GreptimeDB 发现历史缺失的表将无法打开，默认情况下 GreptimeDB 无法启动。GreptimeDB 并不能识别所有错误的位置。
- **删除表时发生崩溃**：如果 GreptimeDB 在删除表的过程中崩溃，或者在 WAL 未能记录删除操作之后、对象存储恢复接受写入之前崩溃，被删除表的 WAL 数据将不会被删除，还会导致其他旧的 WAL 数据也无法删除。此时可以看到 `greptime_logstore_object_store_wal_indexed_objects` 持续增长，而 `greptime_logstore_object_store_wal_deleted_objects_total` 不再变化。第一种情况由 [GreptimeTeam/greptimedb#9577](https://github.com/GreptimeTeam/greptimedb/issues/9577) 跟踪。
