---
keywords: [write-ahead logging, WAL, data durability, LSMT, synchronous flush, asynchronous flush]
description: Introduction to Write-Ahead Logging (WAL) in GreptimeDB, its purpose, architecture, and operational modes.
---

# Write-Ahead Logging

## Introduction

Mito buffers writes in memtables before flushing them to SST files. It first appends each Region's mutations to the write-ahead log (WAL), so data that has not reached an SST can be recovered.

The WAL uses a common log-store abstraction with local raft-engine and remote Kafka providers.

## Write and Recovery Cycle

The order of a normal write is:

1. The Region worker assigns sequence numbers and a WAL entry ID.
2. It appends the mutations to the WAL. If the append fails, the mutations are not applied to the memtable.
3. After the append succeeds, Mito writes the mutations to the memtable and publishes the new committed sequence.
4. A flush writes immutable SST files and persists a manifest edit containing the new files and `flushed_entry_id`.
5. After the manifest edit is durable, WAL entries through `flushed_entry_id` are marked obsolete. The log store may reclaim them later.

The manifest is the recovery boundary. On a normal reopen, Mito rebuilds the Region from the manifest and replays WAL entries starting at `flushed_entry_id + 1`. Region transitions may supply a later replay checkpoint, but they never replay entries before the persisted flush boundary.

## Namespace

WAL entries are isolated by Region, not by table. Each append and read identifies a Region namespace so one Region can be replayed or truncated independently. The local raft-engine provider uses the Region ID as its namespace ID. Kafka keeps Region identity within the provider's topic-backed log.

## Synchronous/Asynchronous flush

For the local raft-engine provider, `sync_write` controls whether an append waits for the log to be synced to durable storage. It defaults to `false`. Asynchronous writes reduce latency but can lose recently acknowledged entries if the host fails before buffered data is synced. Kafka WAL durability is controlled by its producer and cluster settings instead of this local option.
