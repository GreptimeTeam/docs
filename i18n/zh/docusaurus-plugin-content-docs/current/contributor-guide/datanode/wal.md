---
keywords: [预写日志, WAL, 数据持久化, 同步刷盘, 异步刷盘]
description: 介绍了 GreptimeDB 的预写日志（WAL）机制，包括其命名空间、同步/异步刷盘策略和在数据节点重启时的重放功能。
---

# 预写日志

<AnchorAlias id="introduction" />

## 介绍

Mito 在数据 flush 到 SST 文件前，先把写入应用到内存中的 MemTable。每个 Region 的写操作会先追加到预写日志（WAL），从而恢复尚未进入 SST 的数据。

Datanode 重启并重新打开 Region 时，Mito 会重放最后一个已持久化 sequence 之后的 WAL 条目，重建内存状态。WAL 通过统一的 log-store 抽象访问，可以使用本地 raft-engine 或远端 Kafka。

![WAL in Datanode](/wal.png)

## 命名空间

WAL 的命名空间用于区分来自不同 region 的条目。追加和读取操作必须提供一个命名空间。目前，region ID 被用作命名空间，因为每个 region 都有一个在数据节点重新启动时需要重构的 MemTable。

## 同步/异步刷盘

对于本地 raft-engine，`sync_write` 控制追加写是否等待日志同步到持久化存储，默认值为 `false`。异步写入延迟较低，但主机在缓冲数据同步前故障时，可能丢失最近确认的日志。Kafka WAL 的持久性由 producer 和集群配置决定，不受这个本地选项控制。
