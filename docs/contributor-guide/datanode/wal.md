---
keywords: [write-ahead log, WAL, recovery, raft-engine, Kafka]
description: Mito's write-ahead log abstraction, recovery path, and durability settings.
---

# Write-Ahead Logging

## Introduction

Mito applies writes to an in-memory memtable before they are flushed to SST files. To recover data that has not reached an SST, it appends each Region's write operations to a write-ahead log (WAL) before applying them to the memtable.

On Region open or Datanode restart, Mito replays WAL entries after the last persisted sequence and rebuilds the in-memory state. Sequence numbers are assigned per Region and are also used for deduplication and snapshot reads.

The WAL is accessed through the `LogStore` abstraction. Datanode supports a local `raft_engine` provider and a remote Kafka provider; the storage engine does not assume that the log is a local file. Provider construction is in `src/datanode/src/datanode.rs`, while Mito's WAL integration is in `src/mito2/src/wal.rs` and its write worker.

## Namespace

WAL entries are isolated by Region. Append and read operations use the Region ID as their namespace, allowing recovery to replay exactly the log for the Region being opened. A table may contain several Regions, so the WAL namespace is not a table identifier.

## Synchronous/Asynchronous flush

For the local `raft_engine` provider, `sync_write` controls whether an append waits for the log to be synced to durable storage. It defaults to `false`. Asynchronous writes reduce latency but can lose recently acknowledged entries if the host or storage fails before the buffered log is synced. Setting `sync_write = true` strengthens that durability boundary at the cost of additional write latency.

Kafka WAL durability depends on the Kafka producer and cluster settings rather than the local `sync_write` option. Code that acknowledges a write must preserve the ordering between WAL append and memtable mutation for every provider.
