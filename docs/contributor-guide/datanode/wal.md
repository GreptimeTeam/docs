---
keywords: [write-ahead logging, WAL, data durability, LSMT, synchronous flush, asynchronous flush]
description: Introduction to Write-Ahead Logging (WAL) in GreptimeDB, its purpose, architecture, and operational modes.
---

# Write-Ahead Logging

## Introduction

Mito applies writes to an in-memory MemTable before the data is flushed to SST files. It first appends each Region's write operations to the write-ahead log (WAL), so data that has not reached an SST can be recovered.

When a Region is reopened after a Datanode restart, Mito replays WAL entries after the last persisted sequence to rebuild its in-memory state. The WAL is accessed through a common log-store abstraction and can use local raft-engine storage or a remote Kafka cluster.

![WAL in Datanode](/wal.png)

## Namespace

Namespace of WAL is used to separate entries from different tables (different regions). Append and
read operations must provide a Namespace. Currently, region ID is used as the Namespace, because
each region has a MemTable that needs to be reconstructed when Datanode restarts.

## Synchronous/Asynchronous flush

For the local raft-engine provider, `sync_write` controls whether an append waits for the log to be synced to durable storage. It defaults to `false`. Asynchronous writes reduce latency but can lose recently acknowledged entries if the host fails before buffered data is synced. Kafka WAL durability is controlled by its producer and cluster settings instead of this local option.
