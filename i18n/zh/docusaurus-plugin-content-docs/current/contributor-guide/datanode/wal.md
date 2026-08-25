---
keywords: [预写日志, WAL, 恢复, raft-engine, Kafka]
description: 介绍 Mito 的 WAL 抽象、恢复路径和持久性配置。
---

# 预写日志

<AnchorAlias id="introduction" />

## 介绍

Mito 在把数据刷写为 SST 文件前，先将写入应用到内存中的 memtable。为了恢复尚未进入 SST 的数据，每个 Region 的写操作会先追加到预写日志（WAL），再写入 memtable。

打开 Region 或重启 Datanode 时，Mito 从已持久化的最后一个 sequence 之后开始重放 WAL，重建内存状态。Sequence number 在 Region 内分配，同时用于去重和 snapshot read。

存储引擎通过 `LogStore` 抽象访问 WAL。Datanode 支持本地 `raft_engine` provider 和远端 Kafka provider，因此 WAL 并不等同于本地文件。Provider 在 `src/datanode/src/datanode.rs` 中构建，Mito 的 WAL 接入位于 `src/mito2/src/wal.rs` 及写入 worker。

## 命名空间

WAL 按 Region 隔离。追加和读取操作使用 Region ID 作为 namespace，使恢复过程只重放当前 Region 的日志。一张表可以包含多个 Region，因此 WAL namespace 不是 Table ID。

## 同步/异步刷盘

对于本地 `raft_engine` provider，`sync_write` 控制追加操作是否等待日志同步到持久化存储，默认值为 `false`。异步写入延迟较低，但主机或存储在日志同步前发生故障时，最近已确认的 entry 可能丢失。设置 `sync_write = true` 可以加强这一持久性边界，同时会增加写入延迟。

Kafka WAL 的持久性取决于 Kafka producer 和集群配置，而不是本地 `sync_write` 选项。无论使用哪一种 provider，确认写入的代码都必须保持先追加 WAL、再修改 memtable 的顺序。
