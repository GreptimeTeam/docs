---
keywords: [memtable, Mito engine, 写缓冲, flush, 时间分区, BulkMemtable]
description: 介绍 Mito 如何在 memtable 中组织 Region 的可变数据，以及如何将这些数据写入 SST 文件。
---

# Memtable 设计

Memtable 是 Mito 为每个 Region 维护的内存写缓冲。数据 flush 为 SST 文件前，读取可以先从 memtable 获取这些数据。Region version 确定 scan 可以读取的 memtable 和 SST 文件；配合 committed sequence 上限，scan 可以在写入和 flush 推进当前 version 时保持一致性。

## 写入和 flush 生命周期

对于使用 WAL 的常规写入，Mito 按以下顺序处理：

```text
写请求
   |
   v
追加 WAL -> mutable memtable -> 发布 committed sequence
                   |
                 freeze
                   v
            immutable memtable -> 写入 SST -> manifest edit
```

Region worker 先分配 sequence number 和 WAL entry ID，再将 mutation 追加到[预写日志](wal.md)。如果追加失败，Mito 不会更新 memtable。Memtable 更新成功后，Mito 发布 committed sequence，新的读取随后可以看到这些数据。配置了 `skip_wal` 的 Region 会跳过 WAL，但 memtable 更新和可见性顺序不变。

Flush 在启动后台 SST 写入前，先冻结 mutable memtable 并安装一组新的 mutable memtable。后续写入可以继续进行，也不会修改已经冻结的数据。Flush 将 immutable memtable 写为 SST 文件，再持久化包含新文件、flushed WAL checkpoint 和 sequence checkpoint 的 manifest edit。只有 manifest edit 持久化成功后，Mito 才会从当前 Region version 中移除已 flush 的 memtable。Flush 失败时，immutable memtable 会保留，供后续任务重试。

## Region version 和时间分区

每个 Region 包含一个 mutable `TimePartitions` 容器，其中可以有多个 memtable：

```text
Region version
├─ mutable TimePartitions
│  ├─ [t0, t1) -> memtable
│  └─ [t1, t2) -> memtable
├─ immutable memtables
└─ SST files
```

Mito 根据 time index 的值把每行数据路由到对应分区。分区使用左闭右开的时间范围，并按照固定时长对齐。该时长跟随 Region 的 compaction time window；在取得 compaction time window 前，Mito 使用一天作为初始值。乱序写入可能在最新分区之外创建更早的分区。

冻结 Region 时，Mito 会同时冻结所有 mutable 时间分区，把其中的 memtable 移入 immutable 列表，再创建新的 `TimePartitions` 容器。Flush 失败可能留下多代 immutable memtable，因此读取和后续 flush 不能假定列表中只有一个对象。

## Memtable 实现

Mito 根据 Region 的 SST format、primary key encoding 和 memtable 选项选择实现：

```text
flat SST format（默认）或 sparse primary-key encoding -> BulkMemtable
memtable.type=bulk                                   -> BulkMemtable，并强制 flat SST
primary_key SST + dense encoding（遗留）             -> 遗留实现
```

使用默认 engine 配置时，没有显式指定 SST format 的 Region 会使用 `flat`，因此通常走 `BulkMemtable` 路径，本页其余内容也以它为准。这些规则用于排除不兼容的组合：flat format 或 sparse primary key encoding 必须使用 `BulkMemtable`；显式选择 bulk 实现则会强制使用 flat format。

### BulkMemtable

`BulkMemtable` 使用 flat Arrow 布局把写入保存为 part，而不是将数据行插入按时间序列组织的缓冲区：

```text
BulkMemtable
├─ unordered_part
│  └─ 小批量 BulkPart
└─ parts
   ├─ BulkPart        (Arrow RecordBatch)
   ├─ MultiBulkPart   (未编码的 RecordBatch)
   └─ EncodedBulkPart (内存中的 Parquet 数据)
```

小 part 先积累在 `unordered_part` 中，较大的 part 则直接进入 `parts`。后台 memtable compaction 对符合条件的 part 执行 merge sort，生成 `MultiBulkPart` 或编码为 `EncodedBulkPart`。Scan 利用 part 的统计信息裁剪 range；flush 可以将已编码的 range 写入 SST，无需再次解码和编码数据行。设计动机和性能数据见 [Scaling Time Series to Millions of Cardinalities: GreptimeDB's Flat Format](https://greptime.cn/blogs/2025-12-22-flat-format)。

### 遗留实现

使用遗留 `primary_key` SST format 且为 dense primary key encoding 的 Region 仍然使用 `TimeSeriesMemtable`，它按编码后的 primary key 对数据行分组，而不是保存 flat part。如果 Region 没有 primary key 列，同一个 builder 会创建 `SimpleBulkMemtable`。两者都是为已有表保留的兼容代码，`primary_key` format 退役后可能一并移除；新的工作应面向 bulk 和 flat 路径。

已经删除的 `partition_tree` memtable 不是第三种实现。Option parser 仍接受 `memtable.type=partition_tree` 以兼容旧配置，但不会恢复该实现。Region 最终使用 bulk 和 flat 路径。

## 读取快照

Scan 通过一次 `VersionControl` 快照同时取得 Region version 和 committed sequence，并先确定 version，再应用 sequence 上限。如果单独读取 sequence 后再获取 version，flush 或 compaction 可能在两次读取之间移除旧输入，使 scan 得到不完整的快照。

选定的 version 提供 mutable memtable、immutable memtable 和 SST 文件。Mito 先按照时间范围裁剪数据源，再使用 scan 的 projection、predicate 和 sequence range 从各 memtable 获取 range。Scan 将这些 range 与 SST range 合并，并在所有数据源上应用相同的排序、删除和 merge 语义。即使新的 Region version 已经移除某个 memtable，scan 持有的引用也会让该 memtable 存活到本次读取结束。

## 内存压力

每个 memtable 通过 engine 的 write-buffer manager 记录估算的堆内存分配量。冻结 memtable 后，这部分内存不再计入 mutable memory，但在所有引用释放前仍计入总用量。因此，mutable memory 只反映仍可接收写入的数据，总用量仍包含活跃 scan 保留的内存。

全局 write-buffer 达到限制后，worker 会选择 Region 执行 flush。如果内存用量持续超过配置限制，Mito 会阻塞写入，并在达到更高阈值后拒绝写入。可选的 Region 级限制会单独约束热点 Region，避免其阻塞无关 Region。定期任务、手动请求和 Region 生命周期操作也可以触发 flush。

## 修改约束

修改 memtable 代码时必须保持以下性质：

- 对于使用 WAL 的 Region，先追加 WAL，再把数据安装到 memtable；只有安装成功后才能发布 committed sequence。
- SST 文件和 manifest edit 持久化前，冻结的 memtable 必须保持可读，并能在 flush 失败后重试。
- 从同一个 `VersionControl` 快照取得 Region version 和 committed sequence，不得先单独读取 sequence 再获取 version。
- 保留 scan 和 flush 在 memtable range 与 SST range 之间执行统一删除、去重和 merge 所需的排序及元数据。
- 通过 write-buffer manager 记录内存分配，并且只在底层内存不再可能被引用时释放计数。
