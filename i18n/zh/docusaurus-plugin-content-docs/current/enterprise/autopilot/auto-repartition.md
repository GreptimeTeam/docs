---
keywords: [Auto Repartition, Autopilot, Repartition, Region, 重分区, 大 Region, 对象存储, GC]
description: 介绍 GreptimeDB Enterprise 的 Auto Repartition 功能，以及如何配置 Auto Repartition 自动拆分大 Region。
---

# Auto Repartition

Auto Repartition 是 Autopilot 的一个调度策略，用于自动将大 Region 拆分为多个小 Region。当某个表中存在可能成为性能瓶颈的大 Region 时，Auto Repartition 会基于采样结果生成新的分区边界，并提交 Repartition 操作。

拆分后的 Region 可以被调度到不同 Datanode 上，从而打散潜在的负载瓶颈。Auto Repartition 可以减少手动发现大 Region 和手动执行重分区的运维成本。关于手动重分区的说明，请参考[重分区](/user-guide/deployments-administration/manage-data/repartition.md)。

## 前置条件

:::warning 警告
Auto Repartition 依赖 GreptimeDB 的重分区能力，仅支持分布式集群，并且需要：

- 使用[共享对象存储](/user-guide/deployments-administration/configuration.md#storage-options)，例如 AWS S3；
- 在 Metasrv 和所有 Datanode 上启用 [GC](/user-guide/deployments-administration/manage-data/gc.md)。

否则无法执行重分区。
:::

对象存储用于保存 Region 文件，GC 负责在引用释放后再回收旧文件，避免重分区过程中误删仍在使用的数据。

## 什么时候使用 Auto Repartition

Auto Repartition 适合以下场景：

- 某些大 Region 可能成为性能瓶颈；
- 表的原有分区规则已经不能匹配当前数据分布；
- 希望将大 Region 拆分为多个小 Region，并通过后续调度打散潜在的负载瓶颈；
- 希望减少手动分析大 Region 和手动执行 Repartition 的运维成本。

## 未分区表的 Auto Repartition

当指定了重分区列 hint 时，Auto Repartition 也可以作用于未分区表。对于未分区表，GreptimeDB Enterprise 不会自动推断分区列。你需要先通过 `ALTER TABLE` 设置后续 Auto Repartition 使用的候选列：

```sql
ALTER TABLE sensor_readings SET 'repartition.column.hint' = 'host';
```

取消该 hint：

```sql
ALTER TABLE sensor_readings UNSET 'repartition.column.hint';
```

该 hint 只会记录供后续 Auto Repartition 使用的元信息，不会立即触发重分区。当表满足 Auto Repartition 的触发条件后，GreptimeDB Enterprise 可以使用该 hint 指定的列生成分区边界，并提交 Repartition 操作。

重分区列 hint 有以下限制：

- 必须通过 `ALTER TABLE ... SET` 设置；不支持在 `CREATE TABLE ... WITH` 中设置。
- 只能指定一个列。
- 指定的列必须存在于表中。
- 指定的列不能是 time index 列。
- 只能在没有 partition metadata 的表上设置。
- 必须单独设置或取消，不能和其他 table options 一起修改。

## 限制

Auto Repartition 支持已分区表，以及设置了 `repartition.column.hint` 的未分区表。对于未分区表，GreptimeDB Enterprise 不会自动推断分区列。

关于表分区和重分区的说明，请参考[表分片](/user-guide/deployments-administration/manage-data/table-sharding.md)和[重分区](/user-guide/deployments-administration/manage-data/repartition.md)。

## 配置

Auto Repartition 依赖 Autopilot 运行时和集群统计信息。下面的示例同时包含共享配置和 Auto Repartition 配置：

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
[plugins.auto_repartition]
split_trigger_ratio = 1.8
max_split_parts = 3
table_repartition_cooldown_period = "60s"
max_actions_per_tick = 4
max_actions_per_table_per_tick = 2
```

其中：

- `plugins.autopilot` 控制 Autopilot 的调度周期；
- `plugins.cluster_stat` 控制 Datanode 和 Region 写入统计信息的采样与平滑；
- `plugins.auto_repartition` 控制大 Region 拆分的触发条件、拆分规模和提交数量。

共享配置项的详细说明请参考 [Autopilot 配置](./overview.md#配置)。

## 核心配置项

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `split_trigger_ratio` | `1.8` | Region 写负载达到目标单 Region 写负载多少倍后，才会考虑拆分。例如默认值 `1.8` 表示当某个 Region 的写负载达到目标值的 1.8 倍以上时，才会进入拆分规划。 |
| `max_split_parts` | `3` | 单个 Region 最多拆分成多少个子 Region。 |
| `table_repartition_cooldown_period` | `"60s"` | 表级重分区冷却时间。一次重分区请求提交成功后，同一张表在冷却时间内不会再次提交重分区请求。 |
| `max_actions_per_tick` | `4` | 每个调度周期最多提交的重分区动作数。 |
| `max_actions_per_table_per_tick` | `2` | 每张表在每个调度周期内最多提交的重分区动作数。 |

## 高级配置项

以下配置通常不需要调整，建议仅在明确了解表的数据分布和拆分点选择行为后修改。

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `sampling_budget` | `"10MB"` | 为单个 Region 计算拆分点时最多采样的数据量。较大的采样量可能提升拆分点质量，但也会增加规划成本。 |
| `split_segment_min_ratio` | `0.7` | 校验拆分建议时，允许的最小分段大小比例。 |
| `split_segment_max_ratio` | `1.3` | 校验拆分建议时，允许的最大分段大小比例。 |
| `min_samples` | `3` | 判断 Region 写入稳定性所需的最少历史样本数。 |
| `max_region_history_cv` | `0.2` | Region 写入历史的最大变异系数。超过该值的 Region 会被视为写入不稳定。 |
