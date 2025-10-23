---
keywords: [Configuration, Noop WAL, GreptimeDB Datanode, GreptimeDB, cluster mode]
description: This section describes how to configure the Noop WAL for GreptimeDB Datanode component in cluster mode.
---
# Noop WAL

Noop WAL is a special WAL provider designed for emergency situations where the configured WAL provider becomes temporarily unavailable. It is a no-operation WAL provider that does not actually store any WAL data.

## Availability

Noop WAL is **only available in distributed (cluster) mode**, not in standalone mode.

## Use Cases

- **Temporary WAL Unavailability**: When your configured WAL provider (e.g., Kafka) becomes temporarily unavailable, you can switch the Datanode to use Noop WAL to keep the cluster operational.
- **Testing and Development**: Useful for testing scenarios where WAL persistence is not required.

## Data Loss Warning

**When using Noop WAL, all unflushed data will be lost when the Datanode is shutdown or restarted.** This provider should only be used temporarily when the normal WAL provider is unavailable and is not recommended for production use except in emergency situations.

## Configuration

To configure Noop WAL for a Datanode in a cluster:

```toml
[wal]
provider = "noop"
```

In a GreptimeDB cluster, WAL provider configuration is needed in two places:

1. **Metasrv** - Responsible for generating WAL provider metadata for new regions. The Metasrv WAL provider should be set to either `raft_engine` or `kafka`. Noop WAL cannot be configured on Metasrv.
2. **Datanode** - Responsible for reading and writing WAL data. This is where you configure Noop WAL.

When the WAL provider is temporarily unavailable, you only need to configure the Datanode's WAL provider as `noop` to keep the cluster functional. The Metasrv continues using its configured WAL provider (`raft_engine` or `kafka`).

## Important Notes

- Noop WAL is only available in distributed (cluster) mode. It cannot be used in standalone mode.
- Noop WAL cannot be configured on Metasrv. It is only available for Datanode configuration.
- The Metasrv WAL provider should be set to either `raft_engine` or `kafka`.
- When switching to Noop WAL, ensure that you have a data recovery plan in place.
- To minimize data loss, flush regions regularly using `admin flush_table()` or `admin flush_region()`.
- Once the normal WAL provider is available again, switch back to using it as soon as possible.
