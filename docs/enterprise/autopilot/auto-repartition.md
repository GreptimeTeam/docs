---
keywords: [Auto Repartition, Autopilot, Repartition, Region, hot Region, object storage, GC]
description: Introduces GreptimeDB Enterprise Auto Repartition and how to configure it to automatically split hot Regions.
---

# Auto Repartition

Auto Repartition is an Autopilot strategy that automatically splits hot Regions. When some Regions in a table have a write load that remains significantly higher than the target load, Auto Repartition samples data, generates new partition boundaries, and submits a Repartition action.

Auto Repartition helps improve write parallelism for hot tables and reduces the operational cost of manually identifying hot Regions and running Repartition. For manual Repartition, see [Repartition](/user-guide/deployments-administration/manage-data/repartition.md).

## Prerequisites

:::warning WARNING
Auto Repartition depends on GreptimeDB Repartition. It is only available in distributed clusters and requires:

- [Shared object storage](/user-guide/deployments-administration/configuration.md#storage-options), such as AWS S3.
- [GC](/user-guide/deployments-administration/manage-data/gc.md) enabled on Metasrv and all Datanodes.

Otherwise, Repartition cannot be executed.
:::

Object storage stores Region files. GC reclaims old files after their references are released, which prevents files still in use from being deleted during Repartition.

## When to use Auto Repartition

Auto Repartition is useful in the following scenarios:

- Some Regions remain hot for a long time.
- The original partition rule no longer matches the current data distribution.
- You want to automatically improve write parallelism for hot tables.
- You want to reduce the operational cost of manually identifying hot Regions and running Repartition.

## Configuration

Auto Repartition depends on the Autopilot runtime and cluster statistics. The following example includes both shared configuration and Auto Repartition configuration:

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

In this example:

- `plugins.autopilot` controls the Autopilot scheduling interval.
- `plugins.cluster_stat` controls sampling and smoothing for Datanode and Region write statistics.
- `plugins.auto_repartition` controls hot Region split trigger conditions, split size, and submission limits.

For details about shared configuration, see [Autopilot configuration](./overview.md#configuration).

## Core options

| Option | Default | Description |
| --- | --- | --- |
| `split_trigger_ratio` | `1.8` | The load ratio required before a Region is considered for splitting. For example, the default value `1.8` means split planning starts only when a Region reaches more than 1.8 times the target per-Region write load. |
| `max_split_parts` | `3` | The maximum number of child Regions a single Region can be split into. |
| `table_repartition_cooldown_period` | `"60s"` | The table-level Repartition cooldown period. After a Repartition request is submitted successfully, the same table will not submit another Repartition request during this period. |
| `max_actions_per_tick` | `4` | The maximum number of Repartition actions submitted in one scheduling cycle. |
| `max_actions_per_table_per_tick` | `2` | The maximum number of Repartition actions submitted for one table in one scheduling cycle. |

## Advanced options

The following options usually do not need to be changed. Adjust them only when you understand the table distribution and split-point selection behavior.

| Option | Default | Description |
| --- | --- | --- |
| `sampling_budget` | `"10MB"` | The maximum amount of data sampled when computing split points for one Region. A larger budget may improve split-point quality but increases planning cost. |
| `split_segment_min_ratio` | `0.7` | The minimum allowed segment-size ratio when validating a split recommendation. |
| `split_segment_max_ratio` | `1.3` | The maximum allowed segment-size ratio when validating a split recommendation. |
| `min_samples` | `3` | The minimum number of historical samples required to evaluate Region write stability. |
| `max_region_history_cv` | `0.2` | The maximum coefficient of variation allowed for Region write history. Regions above this value are considered unstable. |
