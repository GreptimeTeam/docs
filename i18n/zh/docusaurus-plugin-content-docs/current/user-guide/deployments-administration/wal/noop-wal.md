---
keywords: [配置, Noop WAL, GreptimeDB Datanode, GreptimeDB, 集群模式]
description: 介绍如何在集群模式下为 GreptimeDB Datanode 组件配置 Noop WAL。
---
# Noop WAL

Noop WAL 是专为配置的 WAL 提供者暂时不可用的情况而设计的特殊 WAL 提供者。它是一个无操作 WAL 提供者，实际上不存储任何 WAL 数据。

## 可用性

Noop WAL **仅在分布式（集群）模式下可用**，不适用于单机模式。

## 使用场景

- **WAL 暂时不可用**: 当您配置的 WAL 提供者（例如 Kafka）暂时不可用时，可以将 Datanode 切换为使用 Noop WAL，以保持集群的运行。
- **测试和开发**: 适用于不需要 WAL 持久化的测试场景。

## 数据丢失警告

**使用 Noop WAL 时，所有未刷新的数据将在 Datanode 关闭或重启时丢失。** 此提供者应仅在正常 WAL 提供者不可用时临时使用，不建议在生产环境中使用，除非是紧急情况。

## 配置

要为集群中的 Datanode 配置 Noop WAL：

```toml
[wal]
provider = "noop"
```

在 GreptimeDB 集群中，WAL 提供者配置需要在两个地方进行:

1. **Metasrv** - 负责为新 Region 生成 WAL 提供者元数据。Metasrv 的 WAL 提供者应设置为 `raft_engine` 或 `kafka`。Noop WAL 不能在 Metasrv 上配置。
2. **Datanode** - 负责读写 WAL 数据。这是配置 Noop WAL 的地方。

当 WAL 提供者暂时不可用时，您只需将 Datanode 的 WAL 提供者配置为 `noop` 即可保持集群正常运行。Metasrv 继续使用其配置的 WAL 提供者（`raft_engine` 或 `kafka`）。

## 重要提示

- Noop WAL 仅在分布式（集群）模式下可用。它不能在单机模式下使用。
- Noop WAL 不能在 Metasrv 上配置。它仅适用于 Datanode 配置。
- Metasrv 的 WAL 提供者应设置为 `raft_engine` 或 `kafka`。
- 切换到 Noop WAL 时，请确保有数据恢复计划。
- 为了最小化数据丢失，请使用 `admin flush_table()` 或 `admin flush_region()` 定期刷新 Region。
- 一旦正常 WAL 提供者恢复可用，请尽快切换回使用它。
