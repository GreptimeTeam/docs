---
keywords: [配置, Noop WAL, GreptimeDB Datanode, GreptimeDB, 集群模式]
description: 介绍如何在集群模式下为 GreptimeDB Datanode 组件配置 Noop WAL。
---
# Noop WAL

Noop WAL 是一种特殊的 WAL 提供者，用于 WAL 暂时不可用时的紧急情况。它不会存储任何 WAL 数据。

## 可用性

Noop WAL **仅在集群模式下可用**，单机模式不支持。

## 使用场景

- **WAL 暂时不可用**：当 WAL 提供者（如 Kafka）暂时不可用时，可以将 Datanode 切换到 Noop WAL 保持集群运行。
- **测试和开发**：适用于不需要 WAL 持久化的测试场景。

## 数据丢失警告

**使用 Noop WAL 时，Datanode 关闭或重启会导致所有未刷新的数据丢失。** 仅应在 WAL 提供者不可用时临时使用，不建议用于生产环境，除非是紧急情况。

## 配置

为 Datanode 配置 Noop WAL：

```toml
[wal]
provider = "noop"
```

在 GreptimeDB 集群中，WAL 配置分为两部分：

- **Metasrv** - 负责为新 Region 生成 WAL 元数据，应配置为 `raft_engine` 或 `kafka`。
- **Datanode** - 负责 WAL 数据读写，可在 WAL 提供者不可用时配置为 `noop`。

注意：Noop WAL 只能配置在 Datanode 上，Metasrv 不支持。使用 Noop WAL 时，Metasrv 仍使用原配置的 WAL 提供者。

## 最佳实践

- 定期使用 `admin flush_table()` 或 `admin flush_region()` 刷新 Region，减少数据丢失。
- WAL 提供者恢复后，尽快切换回正常配置。
