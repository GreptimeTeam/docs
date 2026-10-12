---
keywords: [配置, 对象存储 WAL, GreptimeDB 单机模式, GreptimeDB, S3, 实验性]
description: 介绍 GreptimeDB 单机模式下实验性的对象存储 WAL，包括使用前提、配置、确认模式、垃圾回收、监控指标和限制。
---
# 对象存储 WAL

:::warning

对象存储 WAL 目前是实验性功能，仅在 Nightly 构建中提供，并且只支持单机模式。它的配置和行为在后续版本中可能会调整。

:::

对象存储 WAL 把 WAL 写入对象存储，通常就是存放数据文件的那个对象存储。Datanode 会把所有 Region 的 WAL 条目攒成批次，每个批次写成一个不可变的对象。每个对象都通过条件创建（if-not-exists）写入，已存在的对象不会被覆盖。

使用对象存储 WAL 不需要额外部署和运维任何组件，WAL 的持久性与所在对象存储一致。

该 WAL 提供者的名称是 `experimental_object_store`，只支持单机模式，也就是只有一个 Datanode 的部署。集群模式下 Metasrv 不接受这个提供者；连接了 Metasrv 的 Datanode 会拒绝启动，并报错 `Object store WAL is only supported in standalone mode`。

设计细节请参阅 [对象存储 WAL RFC](https://github.com/GreptimeTeam/greptimedb/blob/main/docs/rfcs/2026-09-06-object-store-wal.md)。

## 使用前提

对象存储必须同时支持：

- **条件创建**：if-not-exists 写入，对象已存在时写入失败。
- **强一致的 LIST**：列举结果包含所有已经写入完成的对象。

S3、Google Cloud Storage、Azure Blob Storage 和 MinIO 都满足这两个条件。缺少其中任意一项的 S3 兼容存储不受支持。

本地文件系统存储（`type = "File"`）用临时文件加重命名来实现条件创建，这个过程不是原子的，重命名后也不会同步目录，因此无法提供本文所述的保证。

一个前缀只属于一个 Datanode，同一时间只能由一个进程打开。不要让两个 GreptimeDB 实例使用同一个存储提供者和前缀。

## 配置

在单机模式配置文件的 `[wal]` 部分进行配置。下面的示例列出了全部选项及其默认值：

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

[常见 Helm Chart 配置项](/user-guide/deployments-administration/deploy-on-kubernetes/common-helm-chart-configurations.md)中介绍的配置文件注入方式针对的是集群 Chart，而集群模式不支持这个提供者。如果使用 Helm 部署单机模式，请参考[部署 GreptimeDB 单机版](/user-guide/deployments-administration/deploy-on-kubernetes/deploy-greptimedb-standalone.md)。

### 选项

| 配置项                  | 描述 | 默认值 |
| ----------------------- | ---- | ------ |
| `provider`              | WAL 的提供者。设为 `experimental_object_store` 即使用对象存储 WAL。 | `"raft_engine"` |
| `storage_provider`      | 存放 WAL 对象的存储提供者名称。留空表示使用 `[storage]` 中配置的默认对象存储；否则必须与某个已配置存储提供者的 `name` 一致，参见[存储引擎提供商](/user-guide/deployments-administration/configuration.md#存储引擎提供商)。 | `""` |
| `prefix`                | WAL 对象在存储提供者中的路径前缀。必须是非空的相对路径，不能包含空路径段或 `..`。 | `"wal"` |
| `flush_interval`        | 把缓冲的条目写入对象存储的时间间隔，最小为 `10ms`。每次由定时器触发的非空写入都会创建一个对象；如果批次在下一次触发前达到 `max_batch_bytes`，会立即写出。 | `"100ms"` |
| `max_batch_bytes`       | 不等定时器、直接写出批次的大小阈值。它只是触发阈值，不是对象大小的上限。 | `"8MB"` |
| `ack_mode`              | 追加写入何时返回。`durable`：包含这些条目的对象持久化之后返回。`enqueued`：条目被接收并分配 ID 后立即返回，对象在后台创建。参见[确认模式](#确认模式)。 | `"durable"` |
| `max_unpersisted_bytes` | `enqueued` 模式下，未持久化积压达到这个大小时，新的追加写入会等待，直到有一次上传完成。不会丢弃或拒绝任何写入。 | `"64MB"` |
| `max_unpersisted_age`   | `enqueued` 模式下，最早一条未持久化条目达到这个时长时，新的追加写入会等待，直到有一次上传完成。 | `"8s"` |
| `on_corrupted_segment`  | 某个分段重新读取一次后仍无法解码时的处理方式，可选 `skip` 或 `fail`。参见[数据损坏](#数据损坏)。 | `"skip"` |

除 `provider` 外，以上选项仅在 `provider` 为 `experimental_object_store` 时生效；`max_unpersisted_bytes` 和 `max_unpersisted_age` 仅在 `ack_mode` 为 `enqueued` 时生效。

### 对象布局

WAL 对象存放在所选存储提供者的根路径下，键的格式如下：

```text
<prefix>/datanodes/<node_id>/epochs/<generation>/objects/<seq>.wal
```

单机模式下 node ID 和 generation 都是 `0`，`<seq>` 是补齐到 20 位的序列号。使用默认前缀时，第一个对象是 `wal/datanodes/0/epochs/0/objects/00000000000000000000.wal`。

### 环境变量

和其他配置项一样，WAL 选项也可以通过带 `GREPTIMEDB_STANDALONE` 前缀的[环境变量](/user-guide/deployments-administration/configuration.md#环境变量)设置：

```bash
export GREPTIMEDB_STANDALONE__WAL__PROVIDER=experimental_object_store
export GREPTIMEDB_STANDALONE__WAL__PREFIX=wal
export GREPTIMEDB_STANDALONE__WAL__ACK_MODE=durable
```

## 确认模式

`ack_mode` 决定写入何时返回给客户端。

- **`durable`**（默认）：只有在包含这些条目的对象已经持久化到对象存储后，追加写入才会返回。已确认的写入在崩溃后不会丢失，这正是 WAL 应当提供的保证。代价是延迟：一次写入要等所在批次写出、之前的所有对象都已持久化，再加上一次对象创建。
- **`enqueued`**：条目被接收后追加写入立即返回，对象在后台创建。写入不再等待对象存储，在 S3 上的测试中，这种模式的吞吐与本地 WAL 持平。代价是持久性：崩溃会丢失未持久化的积压，即已经确认、但对应对象尚未持久化的条目。

在 `enqueued` 模式下，`max_unpersisted_bytes` 和 `max_unpersisted_age` 用来在上传跟得上时限制积压的增长：任一阈值达到后，新的追加写入会等待。但在对象存储故障期间，它们并不能限制崩溃时的损失，因为已确认的条目会一直留在内存中，直到故障结束。

两种模式下，已经 flush 到 SST 文件的数据都是安全的。存储引擎在把 flush 记录到 Region manifest 之前，会先等待相应的 WAL 条目在对象存储中持久化。

## Flush 间隔与请求成本

每个对象都对应一次对象存储请求。写入稀疏时，定时器触发的写出在每个节点上每个 `flush_interval` 最多创建一个对象，默认 `100ms` 下即每秒 10 个对象。只有批次在下一次触发前达到 `max_batch_bytes` 时，才会按大小写出。在 `enqueued` 模式下，积压阈值也可能让批次提前写出。

在 `durable` 模式下，每次只发一个写入的客户端，每次写入都要等下一次写出，因此每个间隔大约只能完成一个批次。在 S3 上持续写入时，实测每个节点每分钟约创建 600 个对象。

调整 `flush_interval` 时：

- 间隔越短，稀疏 `durable` 写入的延迟越低，对象请求数的上限也按比例增加。例如 `10ms` 时每个节点每秒最多创建 100 个对象。
- 如果单个写入方需要接近本地 WAL 的吞吐，请使用 `enqueued` 模式并接受它的损失边界。缩短间隔只能减少一部分等待，无法消除对象创建本身的延迟。

## 数据损坏

每个对象中，每个 Region 各有一个分段。当某个分段校验和不匹配，或内容与对象索引不一致时，读取会重新获取一次。如果仍然无法解码，由 `on_corrupted_segment` 决定如何处理：

- **`skip`**（默认）：跳过该分段，并记录为该 Region 的一个 WAL 空洞，同时输出警告日志，并增加 `greptime_logstore_object_store_wal_skipped_segments_total` 计数。同一对象中的其他 Region 不受影响，只会丢失该 Region 在这个对象中尚未 flush 的条目。
- **`fail`**：读取失败，该 Region 无法打开。

对象的结构性损坏（例如头部或索引损坏）不受这个选项控制，它会导致 WAL 打开失败，GreptimeDB 无法启动。

## 垃圾回收

垃圾回收自动进行，没有可配置的选项。

WAL 会跟踪每个 Region 已经 flush 到的位置，据此计算出一个回收边界，并删除边界之前的对象。flush 和删除 Region 之后，边界会向前推进；等到下一个携带新边界的对象写入后，旧对象才会被删除。

因此：

- 没有新写入的前缀会一直保留旧对象，直到下一次写入。
- 有写入但很少 flush 的 Region 会拖住回收边界：从它最早一条未 flush 的条目开始，之后的对象都会保留，包括与其他 Region 共享的对象。

保留的对象越多，GreptimeDB 启动时打开 WAL 需要读取的对象也越多。

## 监控

对象存储 WAL 导出的指标都以 `greptime_logstore_object_store_wal_` 为前缀。直方图按标准方式导出 `_bucket`、`_sum` 和 `_count` 序列。

| 指标 | 类型 | 含义 |
| --- | --- | --- |
| `greptime_logstore_object_store_wal_seal_to_durable_seconds` | Histogram | 从批次写出到对象创建成功的耗时，包含等待创建槽位和重试的时间。 |
| `greptime_logstore_object_store_wal_append_ack_seconds` | Histogram | `durable` 模式下追加写入等待确认的时间，即客户端看到的写入延迟。 |
| `greptime_logstore_object_store_wal_object_bytes` | Histogram | 每个对象的大小，可以看出批次是按大小还是按定时器写出。 |
| `greptime_logstore_object_store_wal_object_entries` | Histogram | 每个对象包含的条目数。 |
| `greptime_logstore_object_store_wal_created_objects_total` | Counter | 成功的对象创建次数，包含内容相同的重试。 |
| `greptime_logstore_object_store_wal_create_failures_total` | Counter | 对象存储未确认的对象创建次数。`durable` 模式下等待中的追加写入会失败，`enqueued` 模式下会重试。 |
| `greptime_logstore_object_store_wal_create_conflicts_total` | Counter | 对象创建时发现已有内容不同的对象的次数。 |
| `greptime_logstore_object_store_wal_poisoned_total` | Counter | 遇到不可恢复错误的 WAL 实例数。 |
| `greptime_logstore_object_store_wal_stalled_appends_total` | Counter | `enqueued` 模式下因积压达到阈值而被阻塞的追加写入数。 |
| `greptime_logstore_object_store_wal_stalled_append_seconds` | Histogram | 被阻塞的追加写入在被接收或被拒绝之前等待的时间。 |
| `greptime_logstore_object_store_wal_indexed_objects` | Gauge | WAL 当前跟踪的对象数，也就是启动时打开 WAL 需要读取的对象数。 |
| `greptime_logstore_object_store_wal_indexed_bytes` | Gauge | WAL 当前跟踪的对象的总字节数。 |
| `greptime_logstore_object_store_wal_deleted_objects_total` | Counter | 垃圾回收删除的对象数。 |
| `greptime_logstore_object_store_wal_failed_deletes_total` | Counter | 删除失败的次数，会在下一次回收时重试。 |
| `greptime_logstore_object_store_wal_recovery_seconds` | Histogram | 启动时一次成功的 WAL 恢复所花的时间。 |
| `greptime_logstore_object_store_wal_recovered_objects_total` | Counter | 成功的恢复过程中读取的对象数。 |
| `greptime_logstore_object_store_wal_read_seconds` | Histogram | 为一个 Region 的重放提供读取所花的时间。 |
| `greptime_logstore_object_store_wal_skipped_segments_total` | Counter | 读取时跳过的损坏分段数。 |

建议对以下计数器的任何增长设置告警：

- `greptime_logstore_object_store_wal_poisoned_total`：WAL 已停止接受写入，需要重启。
- `greptime_logstore_object_store_wal_create_conflicts_total`：前缀下出现了另一个写入方或过期对象。请检查是否有其他进程在使用同一前缀。
- `greptime_logstore_object_store_wal_stalled_appends_total`：`enqueued` 模式下写入速度超过了上传速度。

## 限制

- **仅支持单机模式**：不支持集群模式。
- **每个前缀只能有一个写入方**：前缀不能在多个 Datanode 或多个进程之间共享。条件创建可以防止覆盖，但两个进程使用同一前缀时，可能在启动时失败，也可能一直运行到其中一个发现对方写入的对象后停止接受写入。
- **WAL 进入不可用状态**：遇到不可恢复的错误（例如发现另一个写入方创建的冲突对象）后，WAL 的所有操作都会失败，直到 GreptimeDB 重启。
- **不能原地切换提供者**：每个 Region 都会记录创建时使用的 WAL 提供者。在 `raft_engine` 或 `kafka` 下创建的 Region，在实例使用 `experimental_object_store` 时无法打开；在 `experimental_object_store` 下创建的 Region，换成其他提供者后同样无法打开。打开时会报错 `Incompatible WAL provider change`，默认情况下 GreptimeDB 无法启动。事先 flush 也无济于事，因为检查依据的是 Region 记录的提供者，而不是是否有未 flush 的数据。请在创建单机实例时就选定提供者。
- **不能修改前缀**：每个 Region 还会记录其 WAL 的前缀。如果记录的前缀与当前配置不一致，Region 打开时会报错 `Object store WAL prefix mismatch`。

## 最佳实践

- 除非有实测依据，否则保持默认配置，包括 `ack_mode = "durable"`。
- 除非有明确理由，否则让 `storage_provider` 留空，把 WAL 和数据放在同一个对象存储中。
- 在创建实例时选定 WAL 提供者，之后不要再修改 `provider`、`storage_provider` 或 `prefix`。
- 对 `poisoned_total`、`create_conflicts_total` 和 `stalled_appends_total` 设置告警。
