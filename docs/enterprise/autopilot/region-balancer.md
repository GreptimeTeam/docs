---
keywords: [Region Balancer, Autopilot, Datanode, Region, load balancing, Region Migration]
description: Introduces GreptimeDB Enterprise Region Balancer and how to configure it to automatically balance Region write load across Datanodes.
---

# Region Balancer

Region Balancer is an Autopilot strategy that automatically balances Region write load across Datanodes. When some Datanodes remain under high load, Region Balancer selects suitable Regions and submits Region Migration actions to move them to lower-load Datanodes.

Region Balancer runs in Metasrv and depends on the shared Autopilot runtime and cluster statistics. For an overview of Autopilot, see [Autopilot](./overview.md).

## When to use Region Balancer

Region Balancer is useful in the following scenarios:

- Some Datanodes have a write load that remains higher than others.
- You add or remove Datanodes and want Region distribution to be rebalanced automatically.
- You want to reduce the operational cost of manually identifying hot nodes and running Region Migration.

## Configuration

Region Balancer depends on the Autopilot runtime and cluster statistics. The following example includes both shared configuration and Region Balancer configuration:

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
```

In this example:

- `plugins.autopilot` controls the Autopilot scheduling interval.
- `plugins.cluster_stat` controls sampling and smoothing for Datanode and Region write statistics.
- `plugins.region_balancer` controls Region Balancer trigger conditions, cooldown, and migration limits.

For details about shared configuration, see [Autopilot configuration](./overview.md#configuration).

## Core options

| Option | Default | Description |
| --- | --- | --- |
| `acceptable_load_ratio` | `0.12` | The load ratio threshold above the average Datanode write load. For example, the default value `0.12` means a Datanode may be considered high-load when its write load is more than 12% above the average. |
| `min_load_threshold` | `"4MB"` | The minimum Datanode write load required to trigger balancing. This option represents a write rate in bytes/s. The configured value is written as a byte size. For example, `"4MB"` means 4MB/s. If the load is below this threshold, migration is not triggered even if the load is imbalanced. This avoids unnecessary scheduling under low traffic. |
| `region_migration_cooldown_period` | `"1h"` | The cooldown period after a Region migration. During the cooldown period, the same Region will not be migrated again. |
| `window_stability_threshold` | `2` | The number of historical statistics windows that must continuously satisfy the high-load condition before migration is triggered. A larger value reduces false positives caused by short-term fluctuations. |

## Advanced options

The following options usually do not need to be changed. Adjust them only when you understand the workload characteristics and scheduling behavior.

| Option | Default | Description |
| --- | --- | --- |
| `region_min_load_threshold` | `"10KB"` | The minimum write load for a Region to be considered movable. This option represents a write rate in bytes/s. The configured value is written as a byte size. For example, `"10KB"` means 10KB/s. Regions below this threshold are not selected as migration candidates. |
| `scorer_var_bound` | `0.5` | The load bound used by the scorer to evaluate migration candidates. This value must be greater than `acceptable_load_ratio`. |
| `min_samples` | `3` | The minimum number of historical samples required to evaluate Region write stability. |
| `max_region_history_cv` | `0.2` | The maximum coefficient of variation allowed for Region write history. Regions above this value are considered unstable. |
| `datanode_max_unstable_or_unknown_count_ratio` | `0.5` | The maximum ratio of unstable or unknown Regions on a Datanode. Datanodes above this ratio are excluded from scheduling. |
| `datanode_max_unstable_or_unknown_load_ratio` | `0.5` | The maximum ratio of unstable or unknown Region load on a Datanode. Datanodes above this ratio are excluded from scheduling. |
| `max_actions_per_tick` | `2` | The maximum number of migration actions submitted in one scheduling cycle. |
| `max_actions_per_source_datanode` | `2` | The maximum number of Regions moved out from one source Datanode in one scheduling cycle. |
| `max_actions_per_target_datanode` | `1` | The maximum number of Regions moved into one target Datanode in one scheduling cycle. |

## Legacy options

Earlier versions supported configuring the following options directly under `plugins.region_balancer`:

- `tick_interval`
- `window_size`
- `ewma_alpha`

These options are still compatible, but they are not recommended for new configurations. Use the following shared options instead:

- `plugins.autopilot.tick_interval` for the Autopilot scheduling interval.
- `plugins.cluster_stat.sampling_window` for the statistics window.
- `plugins.cluster_stat.ewma_alpha` for the EWMA smoothing factor.
