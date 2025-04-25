---
keywords: [存储引擎, Mito, LSMT, 数据模型, Region]
description: 详细介绍了 GreptimeDB 的存储引擎架构、数据模型和 region 的概念，重点描述了 Mito 存储引擎的优化和组件。
---

# 存储引擎

## 概述

`存储引擎` 负责存储数据库的数据。Mito 是我们默认使用的存储引擎，基于 [LSMT][1]（Log-structured Merge-tree）。我们针对处理时间序列数据的场景做了很多优化，因此 mito 这个存储引擎并不适用于通用用途。

## 架构
下图展示了存储引擎的架构和处理数据的流程。

![Architecture](/storage-engine-arch.png)

该架构与传统的 LSMT 引擎相同：

- [WAL][2]
  - 为尚未刷盘的数据提供高持久性保证。
  - 基于 `LogStore` API 实现，不关心底层存储介质。
  - WAL 的日志记录可以存储在本地磁盘上，也可以存储在实现了 `LogStore` API 的分布式日志服务中。
- Memtable
  - 数据首先写入 `active memtable`，又称 `mutable memtable`。
  - 当 `mutable memtable` 已满时，它将变为只读的 `immutable memtable`。
- SST
  - SST 的全名为有序字符串表（`Sorted String Table`）。
  - `immutable memtable` 刷到持久存储后形成一个 SST 文件。
- Compactor
  - `Compactor` 通过 compaction 操作将小的 SST 合并为大的 SST。
  - 默认使用 [TWCS][3] 策略进行合并
- Manifest
  - `Manifest` 存储引擎的元数据，例如 SST 的元数据。
- Cache
  - 加速查询操作。

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree
[2]: https://en.wikipedia.org/wiki/Write-ahead_logging
[3]: https://cassandra.apache.org/doc/latest/cassandra/operating/compaction/twcs.html

## 数据模型

存储引擎提供的数据模型介于 `key-value` 模型和表模型之间

```txt
tag-1, ..., tag-m, timestamp -> field-1, ..., field-n
```

每一行数据包含多个 tag 列，一个 timestamp 列和多个 field 列
- `0 ~ m` 个 tag 列
  - tag 列是可空的
  - 在建表时通过 `PRIMARY KEY` 指定
- 必须包含一个 timestamp 列
  - timestamp 列非空
  - 在建表时通过 `TIME INDEX` 指定
- `0 ~ n` 个 field 列
  - field 列是可空的
- 数据按照 tag 列和 timestamp 列有序存储

## Region

数据在存储引擎中以 `region` 的形式存储，`region` 是引擎中的一个逻辑隔离存储单元。`region` 中的行必须具有相同的 `schema`（模式），该 `schema` 定义了 `region` 中的 tag 列，timestamp 列和 field 列。数据库中表的数据存储在一到多个 `region` 中。
