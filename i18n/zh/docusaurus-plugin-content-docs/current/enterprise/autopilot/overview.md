---
keywords: [Autopilot, Region Balancer, Auto Repartition, Region, Datanode, 负载均衡, 重分区]
description: 介绍 GreptimeDB Enterprise 的 Autopilot 功能，包括 Region Balancer 和 Auto Repartition 的使用场景及共享配置。
---

# 概述

Autopilot 是 GreptimeDB Enterprise 中用于自动优化集群负载和数据分布的能力。它运行在 Metasrv 中，通过持续收集 Datanode 和 Region 的写入统计信息，在满足条件时自动提交调度动作，减少人工排查热点和手动调整集群的运维成本。

Autopilot 当前包括以下能力：

- **Region Balancer**：自动迁移热点 Region，使 Datanode 之间的写入负载更均衡。
- **Auto Repartition**：自动将大 Region 拆分为多个小 Region，避免单个大 Region 成为性能瓶颈。拆分后的 Region 可以被调度到不同 Datanode 上，从而打散潜在的负载瓶颈。

## 工作方式

Autopilot 由共享的运行时、集群统计信息和不同的调度策略组成：

- **运行时**：按照固定间隔触发一次调度周期。
- **集群统计信息**：通过 Datanode heartbeat 收集 Region 写入统计信息，并对短期波动进行平滑。
- **调度策略**：根据统计信息判断是否需要迁移 Region 或拆分大 Region。
- **执行器**：将调度策略生成的动作提交给对应的执行流程，例如 Region Migration 或 Repartition。

当同时启用 Region Balancer 和 Auto Repartition 时，它们共享同一套 Autopilot 运行时和集群统计信息。

## 什么时候使用 Autopilot

Autopilot 适合以下场景：

- 集群中部分 Datanode 的写入负载长期明显高于其他 Datanode；
- 某些大 Region 可能成为性能瓶颈，需要拆分成多个小 Region；
- 希望减少手动分析负载瓶颈、手动执行 Region Migration 或 Repartition 的运维成本。

## 限制

不同 Autopilot 策略有各自的适用限制：

- Region Balancer 要求可调度的 Region 数量大于活跃 Datanode 数量。否则即使迁移 Region，也无法让 Datanode 之间的负载变得均衡。
- Auto Repartition 支持已分区表，以及设置了 `repartition.column.hint` 的未分区表。对于未分区表，GreptimeDB Enterprise 不会自动推断分区列。关于表分区和重分区的说明，请参考[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md)和[重分区](/user-guide/deployments-administration/manage-data/repartition.md)。

## 配置

Autopilot 的配置分为共享配置和策略配置：

- `plugins.autopilot`：配置 Autopilot 运行时。
- `plugins.cluster_stat`：配置 Datanode 和 Region 写入统计信息的采样和平滑方式。
- `plugins.region_balancer`：启用并配置 Region Balancer。
- `plugins.auto_repartition`：启用并配置 Auto Repartition。

下面的示例展示了同时启用 Region Balancer 和 Auto Repartition 的推荐配置：

```toml
[[plugins]]
[plugins.autopilot]
tick_interval = "45s"

[[plugins]]
[plugins.cluster_stat]
sampling_window = "45s"
max_history_windows = 5
ewma_alpha = 0.2

[[plugins]]
[plugins.region_balancer]
acceptable_load_ratio = 0.12
min_load_threshold = "4MB"
region_migration_cooldown_period = "1h"
window_stability_threshold = 2

[[plugins]]
[plugins.auto_repartition]
split_trigger_ratio = 1.8
max_split_parts = 3
table_repartition_cooldown_period = "60s"
max_actions_per_tick = 4
max_actions_per_table_per_tick = 2
```

如果只需要其中一个策略，可以只配置对应的 `plugins.region_balancer` 或 `plugins.auto_repartition`。

## Autopilot 运行时配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `tick_interval` | `"45s"` | Autopilot 的调度周期。较短的周期可以更快响应负载变化，但可能增加调度开销。 |

## 集群统计配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `sampling_window` | `"45s"` | 每个统计窗口的时间跨度。较大的窗口会平滑短期波动，但响应会更慢。 |
| `max_history_windows` | `5` | 保留的历史统计窗口数量。Region Balancer 和 Auto Repartition 会基于历史窗口判断负载是否稳定。 |
| `ewma_alpha` | `0.2` | EWMA 平滑系数。值越大，统计结果越偏向最新观测值；值越小，统计结果越平滑。 |

## 下一步

- 如需自动平衡 Datanode 之间的写入负载，请参考 [Region Balancer](./region-balancer.md)。
- 如需自动拆分大 Region，请参考 [Auto Repartition](./auto-repartition.md)。
