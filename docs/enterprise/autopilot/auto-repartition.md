---
keywords: [Auto Repartition, Autopilot, Repartition, Region, large Region, object storage, GC]
description: Introduces GreptimeDB Enterprise Auto Repartition and how to configure it to automatically split large Regions.
---

# Auto Repartition

Auto Repartition is an Autopilot strategy that automatically splits large Regions into smaller Regions. When a table has a large Region that may become a performance bottleneck, Auto Repartition samples data, generates new partition boundaries, and submits a Repartition action.

The split Regions can then be scheduled across multiple Datanodes to distribute potential bottlenecks. Auto Repartition reduces the operational cost of manually identifying large Regions and running Repartition. For manual Repartition, see [Repartition](/user-guide/deployments-administration/manage-data/repartition.md).

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

- Some large Regions may become performance bottlenecks.
- The original partition rule no longer matches the current data distribution.
- You want to split large Regions into smaller Regions and distribute potential bottlenecks through later scheduling.
- You want to reduce the operational cost of manually identifying large Regions and running Repartition.

## Auto Repartition for unpartitioned tables

Auto Repartition can also work with unpartitioned tables when a repartition column hint is specified. For an unpartitioned table, GreptimeDB Enterprise does not infer partition columns automatically. You must first set the preferred column for future Auto Repartition by using `ALTER TABLE`:

```sql
ALTER TABLE sensor_readings SET 'repartition.column.hint'='host';
```

To remove the hint:

```sql
ALTER TABLE sensor_readings UNSET 'repartition.column.hint';
```

The hint only records metadata for future Auto Repartition. It does not trigger Repartition immediately. After the table meets the Auto Repartition trigger conditions, GreptimeDB Enterprise can use the hinted column to generate partition boundaries and submit a Repartition action.

The repartition column hint has the following restrictions:

- It must be set with `ALTER TABLE ... SET`; setting it in `CREATE TABLE ... WITH` is not supported.
- It must specify exactly one column.
- The specified column must exist in the table.
- The specified column cannot be the time index column.
- It can only be set on a table without partition metadata.
- It must be set or unset separately from other table options.

## Limitations

Auto Repartition works for partitioned tables and unpartitioned tables with `repartition.column.hint`. For unpartitioned tables, GreptimeDB Enterprise does not infer partition columns automatically.

For more information about table partitioning and Repartition, see [Table Sharding](/user-guide/deployments-administration/manage-data/table-sharding.md) and [Repartition](/user-guide/deployments-administration/manage-data/repartition.md).

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
- `plugins.auto_repartition` controls large Region split trigger conditions, split size, and submission limits.

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
