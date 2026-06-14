---
keywords: [Configuration, Noop WAL, GreptimeDB Datanode, GreptimeDB, cluster mode]
description: This section describes how to configure the Noop WAL for GreptimeDB Datanode component in cluster mode.
---
# Noop WAL

Noop WAL is a special WAL provider for emergency situations when the configured WAL provider becomes temporarily unavailable. It does not store any WAL data.

## Availability

Noop WAL is **only available in cluster mode**, not in standalone mode.

## Use Cases

- **Temporary WAL Unavailability**: When the WAL provider (e.g., Kafka) is temporarily unavailable, switch the Datanode to Noop WAL to keep the cluster running.
- **Testing and Development**: Useful for testing scenarios where WAL persistence is not required.

## Data Loss Warning

**When using Noop WAL, all unflushed data will be lost when the Datanode is shutdown or restarted.** Only use this provider temporarily when the normal WAL provider is unavailable. Not recommended for production use except in emergency situations.

## Configuration

To configure Noop WAL for a Datanode:

```toml
[wal]
provider = "noop"
```

In a GreptimeDB cluster, WAL configuration has two parts:

- **Metasrv** - Generates WAL metadata for new regions. Should be set to `raft_engine` or `kafka`.
- **Datanode** - Reads and writes WAL data. Configure as `noop` when the WAL provider is unavailable.

Note: Noop WAL can only be configured on Datanode, not on Metasrv. When using Noop WAL on Datanode, Metasrv continues using its configured WAL provider.

## Best Practices

- Flush regions regularly using `admin flush_table()` or `admin flush_region()` to minimize data loss.
- Switch back to the normal WAL provider as soon as it becomes available.
