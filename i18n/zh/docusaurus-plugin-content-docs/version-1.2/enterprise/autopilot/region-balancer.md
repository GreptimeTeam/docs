---
keywords: [Region Balancer, Autopilot, Datanode, Region, 负载均衡, Region Migration]
description: 介绍 GreptimeDB Enterprise 的 Region Balancer 功能，以及如何配置 Region Balancer 自动平衡 Datanode 之间的 Region 写入负载和读查询 CPU 负载。
---

# Region Balancer

Region Balancer 是 Autopilot 的一个调度策略，用于自动平衡 Datanode 之间的 Region 写入负载和读查询 CPU 负载。当某些 Datanode 持续处于高负载状态时，Region Balancer 会选择合适的 Region，并提交 Region Migration 操作，将 Region 迁移到负载较低的 Datanode。

Region Balancer 运行在 Metasrv 中，并依赖 Autopilot 共享的运行时和集群统计信息。关于 Autopilot 的整体说明，请参考 [Autopilot](./overview.md)。

## 什么时候使用 Region Balancer

Region Balancer 适合以下场景：

- 部分 Datanode 的写入负载长期高于其他 Datanode；
- 希望减少手动分析热点节点和手动执行 Region Migration 的运维成本。

## 限制

Region Balancer 要求可调度的 Region 数量大于活跃 Datanode 数量。如果 Region 数量不多于活跃 Datanode 数量，即使迁移 Region，也无法让 Datanode 之间的负载变得均衡。

## 配置

Region Balancer 依赖 Autopilot 运行时和集群统计信息。下面的示例同时包含共享配置和 Region Balancer 配置：

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
write_window_stability_threshold = 2
```

其中：

- `plugins.autopilot` 控制 Autopilot 的调度周期；
- `plugins.cluster_stat` 控制 Datanode 和 Region 写入统计信息的采样与平滑；
- `plugins.region_balancer` 控制 Region Balancer 的触发条件、冷却时间和迁移数量。

共享配置项的详细说明请参考 [Autopilot 配置](./overview.md#配置)。

## 核心配置项

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `acceptable_load_ratio` | `0.12` | Datanode 写负载超过平均负载的比例阈值。例如默认值 `0.12` 表示当某个 Datanode 的写负载超过平均负载 12% 以上时，可能被视为高负载 Datanode。 |
| `min_load_threshold` | `"4MB"` | 触发平衡的最小 Datanode 写负载。该配置表示写入速率，单位为 bytes/s；配置值使用 bytes 表示，例如 `"4MB"` 表示 4MB/s。低于该阈值时，即使负载不均衡，也不会触发迁移，避免低流量场景下频繁调度。 |
| `region_migration_cooldown_period` | `"1h"` | Region 迁移后的冷却时间。在冷却时间内，同一个 Region 不会再次被迁移，避免频繁迁移。 |
| `write_window_stability_threshold` | `2` | Datanode 连续多少个历史统计窗口都满足写高负载条件后，才会触发写负载迁移。较大的值可以减少短期波动造成的误触发。 |
| `read_window_stability_threshold` | `4` | Datanode 连续多少个历史统计窗口都满足读高负载条件后，才会触发读负载迁移。较大的值可以减少短期读负载波动造成的迁移。 |

## 高级配置项

以下配置通常不需要调整，建议仅在明确了解负载特征和调度行为后修改。Region 的写负载和读负载稳定性会独立评估，并分别影响对应负载维度的迁移候选资格。

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `region_min_load_threshold` | `"10KB"` | 可迁移 Region 的最小写负载。该配置表示写入速率，单位为 bytes/s；配置值使用 bytes 表示，例如 `"10KB"` 表示 10KB/s。低于该阈值的 Region 不会作为迁移候选。 |
| `region_min_cpu_time_threshold` | `100000000.0` | Region 被视为读活跃并可参与读负载迁移的最小查询 CPU 时间速率，单位为查询 CPU 时间纳秒每秒（ns/s）；默认值等价于每秒消耗 100 ms 的查询 CPU 时间。该值同时也是将 Datanode 判定为读高负载所需的最小总读 CPU 负载。 |
| `scorer_var_bound` | `0.5` | 评分器的负载边界，用于计算迁移候选的收益。该值必须大于 `acceptable_load_ratio`。 |
| `min_write_samples` | `3` | 判断 Region 写吞吐历史稳定性所需的最少样本数。 |
| `max_write_region_history_cv` | `0.2` | Region 写吞吐历史允许的最大变异系数。超过该值的 Region 会被视为写负载不稳定。 |
| `min_read_samples` | `3` | 判断 Region 查询 CPU 时间历史稳定性所需的最少样本数。 |
| `max_read_region_history_cv` | `0.3` | Region 查询 CPU 时间历史允许的最大变异系数。超过该值的 Region 会被视为读负载不稳定。 |
| `datanode_max_unstable_or_unknown_count_ratio` | `0.5` | Datanode 上写入不稳定或未知的 Region 数量的最大比例。超过该比例的 Datanode 不会参与调度。 |
| `datanode_max_unstable_or_unknown_load_ratio` | `0.5` | Datanode 上写入不稳定或未知的 Region 负载的最大比例。超过该比例的 Datanode 不会参与调度。 |
| `max_actions_per_tick` | `2` | 每个调度周期最多提交的迁移动作数。 |
| `max_actions_per_source_datanode` | `2` | 每个源 Datanode 在一个调度周期内最多迁出的 Region 数。 |
| `max_actions_per_target_datanode` | `1` | 每个目标 Datanode 在一个调度周期内最多迁入的 Region 数。 |

## 兼容旧配置

旧版本中，Region Balancer 支持直接在 `plugins.region_balancer` 中配置以下参数：

- `tick_interval`
- `window_size`
- `ewma_alpha`

这些配置仍然兼容，但不建议在新配置中继续使用。新配置建议使用：

- `plugins.autopilot.tick_interval` 配置 Autopilot 调度周期；
- `plugins.cluster_stat.sampling_window` 配置统计窗口；
- `plugins.cluster_stat.ewma_alpha` 配置 EWMA 平滑系数。
