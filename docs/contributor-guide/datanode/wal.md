---
keywords: [write-ahead logging, WAL, data durability, LSMT, synchronous flush, asynchronous flush]
description: Introduction to Write-Ahead Logging (WAL) in GreptimeDB, its purpose, architecture, and operational modes.
---

# Write-Ahead Logging

## Introduction

Our storage engine is inspired by the Log-structured Merge Tree (LSMT). Mutating operations are
applied to a MemTable instead of persisting to disk, which significantly improves performance but
also brings durability-related issues, especially when the Datanode crashes unexpectedly. Similar
to all LSMT-like storage engines, GreptimeDB uses a write-ahead log (WAL) to ensure data durability
and is safe from crashing.

WAL is an append-only file group. All `INSERT`, `UPDATE` and `DELETE` operations are transformed into
operation entries and then appended to WAL. Once operation entries are persisted to the underlying
file, the operation can be further applied to MemTable.

When the Datanode restarts, operation entries in WAL are replayed to reconstruct the correct
in-memory state.

![WAL in Datanode](/wal.png)

## Namespace

Namespace of WAL is used to separate entries from different tables (different regions). Append and
read operations must provide a Namespace. Currently, region ID is used as the Namespace, because
each region has a MemTable that needs to be reconstructed when Datanode restarts.

## Synchronous/Asynchronous flush

By default, appending to WAL is asynchronous, which means the writer will not wait until entries are
flushed to disk. This setting provides higher performance, but may lose data when running host shutdown unexpectedly. In the other hand, synchronous flush provides higher durability at the cost of performance.

In v0.4 version, the new region worker architecture can use batching to alleviate the overhead of sync flush.
