---
keywords: [存储引擎, Mito, LSMT, 数据模型, Region]
description: 介绍 Mito 存储引擎的核心组件、Region 模型和 SST 数据布局。
---

# 存储引擎

## 概述

Mito 是 GreptimeDB 主要的时序 Region engine，实现了 `RegionEngine` trait，并使用 [LSM tree][1] 写入链路：WAL 和 memtable 接收写入，不可变的 Parquet SST 文件保存持久化数据，后台 compaction 负责重组这些文件。

## 架构

实现代码位于 `src/mito2/src/`。`engine.rs` 分发 Region 请求，`worker/` 负责每个 Region 的写入循环，`read/` 构建扫描，`flush.rs`、`compaction/`、`manifest/` 和 `sst/` 共同实现持久化生命周期。

- **WAL** 记录尚未进入 SST 的写入，用于恢复 Region 的 memtable 状态。它通过 `LogStore` API 支持本地 raft-engine 和远端 Kafka provider。写入确认对应的持久性边界取决于 provider 配置；参见[预写日志](./wal.md)。
- **Memtable** 通过可变的 active memtable 接收写入。Flush 会将其冻结为 immutable memtable；在数据写入 SST 前，immutable memtable 仍参与读取。
- **SST 文件**是不可变的 Parquet 文件，其中的数据按照 primary key 和 time index 排序；详见 [SST 文件中的数据布局](#sst-文件中的数据布局)。
- **Compaction** 合并 SST 文件并清理过期数据。默认策略为 [TWCS][3]，按时间窗口组织文件。详见 [Compaction](/user-guide/deployments-administration/manage-data/compaction.md)。
- **Manifest** 保存带版本的 Region 元数据和 SST 文件变更，用于恢复。
- **Cache** 保存文件元数据、数据页及其他可复用的扫描状态。

[1]: https://en.wikipedia.org/wiki/Log-structured_merge-tree
[2]: https://en.wikipedia.org/wiki/Write-ahead_logging
[3]: https://cassandra.apache.org/doc/latest/cassandra/operating/compaction/twcs.html

## 数据模型

Mito 接收由 `RegionMetadata` 描述的 schema，其中包含 primary-key column list、一个非空 time-index column 和 field columns。SQL 层把 primary-key column 暴露为 tag，Mito 本身依据 column ID 和 semantic type 工作，不解析 SQL 表定义。

### Region

Region 是 Mito 的隔离、恢复和请求单元，其中每一行都遵循该 Region 的元数据。一张表可以跨多个 Region，但表路由和放置不属于存储引擎职责。

## SST 文件中的数据布局

当 memtable 被 flush 时，Mito 会把其中的行写入不可变的 [Apache Parquet](https://parquet.apache.org) SST 文件。关于 Parquet 文件格式本身以及 SST 文件如何建立索引，详见[数据持久化和索引](data-persistence-indexing.md)。

在一个 SST 文件内，行按照 `(primary key, time index)` 排序。具有相同 primary key（tag 列）的行属于同一条时间序列，会连续存储并按时间戳排序。这种局部性使得扫描单条时间序列的成本更低，也有助于提升压缩效果。对于没有 primary key 的 append-only 表，行仅按 time index 排序。

除了表中的列，Mito 还会在每个 SST 文件中存储三个内部列，以便在从多个 memtable 和 SST 文件读取时正确地合并、去重并应用删除操作：

- `__primary_key`：行的编码后 primary key（tags）。
- `__sequence`：行的 sequence number。
- `__op_type`：行的操作类型（put 或 delete）。

每个 Parquet SST 都会被切分为 row group，row group 是 Parquet 可以独立读取或跳过的单位。每个 row group 都带有列统计信息，例如最小值、最大值和 null 数量。Mito 还会为每个 SST 记录文件级元数据，包括时间范围、行数、row group 数量、可用索引以及 primary key 范围。这些统计信息会驱动下面介绍的扫描裁剪。

Mito 支持两种 SST 格式：`flat` 和 `primary_key`。`flat` 是新表的默认格式，适用于各种 primary key 基数，包括高基数 key。`primary_key` 是为了兼容旧表而保留的遗留格式。更多详情请参考 [SST format](/reference/sql/create.md#创建指定-sst-格式的表) 和[表设计指南](/user-guide/deployments-administration/performance-tuning/design-table.md#sst-格式)。

<img src="/sst-layout.svg" alt="SST layout" style={{width: '80%', margin: '0 auto'}}/>

## 扫描裁剪

Mito 会组合多个从粗到细的裁剪步骤，避免读取不可能匹配查询的数据：

1. **时间范围裁剪。** 如果文件和 memtable 的时间范围与查询时间范围不相交，就会在打开 reader 之前被跳过。对于时间序列查询，这通常是成本最低且最有效的步骤。
2. **Row group 统计信息。** 如果 row group 的 min-max 统计信息能够证明没有任何行匹配谓词，则会跳过整个 row group。
3. **索引。** 倒排索引、跳数索引和全文索引可以针对统计信息无法处理的谓词提供更精细的裁剪；feature-gated vector index 为向量搜索选择候选行。详见[数据持久化和索引](data-persistence-indexing.md)。

<img src="/scan-pruning.svg" alt="Scan pruning pipeline" style={{width: '80%', margin: '0 auto'}}/>
