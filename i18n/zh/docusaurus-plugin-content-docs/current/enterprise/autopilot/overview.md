---
keywords: [Autopilot, Region Balancer, Auto Repartition, Region, Datanode, 负载均衡, 重分区]
description: 介绍 GreptimeDB Enterprise 的 Autopilot 功能，包括 Region Balancer 和 Auto Repartition 的使用场景及共享配置。
---

# 概述

Autopilot 是 GreptimeDB Enterprise 中用于自动优化集群负载和数据分布的能力。它运行在 Metasrv 中，通过持续收集 Datanode 和 Region 的写入统计信息，在满足条件时自动提交调度动作，减少人工排查热点和手动调整集群的运维成本。

Autopilot 当前包括以下能力：

- **Region Balancer**：自动迁移热点 Region，使 Datanode 之间的写入负载更均衡。
- **Auto Repartition**：自动拆分热点 Region，提高热点表的写入并行度。

## 工作方式

Autopilot 由共享的运行时、集群统计信息和不同的调度策略组成：

- **运行时**：按照固定间隔触发一次调度周期。
- **集群统计信息**：通过 Datanode heartbeat 收集 Region 写入统计信息，并对短期波动进行平滑。
- **调度策略**：根据统计信息判断是否需要迁移 Region 或拆分热点 Region。
- **执行器**：将调度策略生成的动作提交给对应的执行流程，例如 Region Migration 或 Repartition。

当同时启用 Region Balancer 和 Auto Repartition 时，它们共享同一套 Autopilot 运行时和集群统计信息。

## 什么时候使用 Autopilot

Autopilot 适合以下场景：

- 集群中部分 Datanode 的写入负载长期明显高于其他 Datanode；
- 某些 Region 长期成为热点，限制了表的写入吞吐；
- 新增或移除 Datanode 后，希望自动重新平衡 Region 分布；
- 希望减少手动分析热点 Region、手动执行 Region Migration 或 Repartition 的运维成本。

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
- 如需自动拆分热点 Region，请参考 [Auto Repartition](./auto-repartition.md)。
