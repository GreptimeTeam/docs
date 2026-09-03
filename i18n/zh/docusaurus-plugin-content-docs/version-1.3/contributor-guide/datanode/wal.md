---
keywords: [预写日志, WAL, 数据持久化, 同步刷盘, 异步刷盘]
description: 介绍了 GreptimeDB 的预写日志（WAL）机制，包括其命名空间、同步/异步刷盘策略和在数据节点重启时的重放功能。
---

# 预写日志

<AnchorAlias id="introduction" />

## 介绍

Mito 在将数据 flush 为 SST 文件前，先在 [memtable](memtable.md) 中缓冲写入。每个 Region 的 mutation 会先追加到预写日志（WAL），从而恢复尚未进入 SST 的数据。

WAL 通过统一的 log-store 抽象访问，可以使用本地 raft-engine 或远端 Kafka。

## 写入与恢复流程

正常写入遵循以下顺序：

1. Region worker 分配 sequence number 和 WAL entry ID。
2. 将 mutation 追加到 WAL。追加失败时，不会把 mutation 写入 memtable。
3. WAL 追加成功后，Mito 将 mutation 写入 memtable，并发布新的 committed sequence。
4. Flush 将不可变 memtable 写为 SST 文件，并持久化包含新文件和 `flushed_entry_id` 的 manifest edit。
5. Manifest edit 持久化后，`flushed_entry_id` 及以前的 WAL entry 被标记为 obsolete；log store 可以稍后再回收物理空间。

Manifest 是恢复边界。正常重新打开 Region 时，Mito 根据 manifest 重建 Region，并从 `flushed_entry_id + 1` 开始重放 WAL。Region 状态切换可以指定更晚的 replay checkpoint，但不会重放早于已持久化 flush 边界的 entry。

## 命名空间

WAL entry 按 Region 隔离，而不是按表隔离。追加和读取都需要指定 Region namespace，使单个 Region 可以独立重放或截断。本地 raft-engine 使用 Region ID 作为 namespace ID；Kafka provider 则在基于 topic 的日志中保留 Region 标识。

## 同步/异步刷盘

对于本地 raft-engine，`sync_write` 控制追加写是否等待日志同步到持久化存储，默认值为 `false`。异步写入延迟较低，但主机在缓冲数据同步前故障时，可能丢失最近确认的 entry。Kafka WAL 的持久性由 producer 和集群配置决定，不受这个本地选项控制。
