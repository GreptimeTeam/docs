# Write-Ahead Logging

## Introduction

Our storage engine is inspired by the Log-structured Merge Tree (LSMT). Mutating operations are
applied to a MemTable instead of persisting to disk, which significantly improves performance but
also brings durability-related issues, especially when the Datanode crashes unexpectedly. Similar
to all LSMT-like storage engines, GreptimeDB uses a write-ahead log (WAL) to ensure data durability
and is safe from crashing.

WAL is an append-only file group. All INSERT, UPDATE and DELETE operations are transformed into
operation entries and then appended to WAL. Once operation entries are persisted to the underlying
file, the operation can be further applied to MemTable.

When the Datanode restarts, operation entries in WAL are replayed to reconstruct the correct
in-memory state.

![WAL in Datanode]()

> NOTE: IMAGE IS MISSING

## Namespace

Namespace of WAL is used to separate entries from different tables (different regions). Append and
read operations must provide a Namespace. Currently, region ID is used as the Namespace, because
each region has a MemTable that needs to be reconstructed when Datanode restarts.

## Synchronous/Asynchronous flush

By default, appending to WAL is synchronous, which means the writer waits until the entry is
flushed to the disk. This setting provides the highest durability, but also has the poorest
performance. WAL uses group flush to alleviate sync flush overhead. In the near future, we will add
asynchronous flush support to boost write performance when data durability is not the main concern.
