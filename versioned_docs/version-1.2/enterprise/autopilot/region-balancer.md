---
keywords: [Region Balancer, Autopilot, Datanode, Region, load balancing, Region Migration]
description: Introduces GreptimeDB Enterprise Region Balancer and how to configure it to automatically balance Region write load and read query CPU load across Datanodes.
---

# Region Balancer

Region Balancer is an Autopilot strategy that automatically balances Region write load and read query CPU load across Datanodes. When some Datanodes remain under high load, Region Balancer selects suitable Regions and submits Region Migration actions to move them to lower-load Datanodes.

Region Balancer runs in Metasrv and depends on the shared Autopilot runtime and cluster statistics. For an overview of Autopilot, see [Autopilot](./overview.md).

## When to use Region Balancer

Region Balancer is useful in the following scenarios:

- Some Datanodes have a write load that remains higher than others.
- You want to reduce the operational cost of manually identifying hot nodes and running Region Migration.

## Limitations

Region Balancer requires the number of schedulable Regions to be greater than the number of active Datanodes. If the number of Regions is not greater than the number of active Datanodes, moving Regions cannot make the load evenly distributed across Datanodes.

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
write_window_stability_threshold = 2
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
| `write_window_stability_threshold` | `2` | The number of historical statistics windows in which a Datanode must continuously satisfy the write-high-load condition before write-driven migration is triggered. A larger value reduces false positives caused by short-term fluctuations. |
| `read_window_stability_threshold` | `4` | The number of historical statistics windows in which a Datanode must continuously satisfy the read-high-load condition before read-driven migration is triggered. A larger value reduces migrations caused by short-term read-load fluctuations. |

## Advanced options

The following options usually do not need to be changed. Adjust them only when you understand the workload characteristics and scheduling behavior. Region write and read stability are evaluated independently and affect migration candidates for their respective load dimensions.

| Option | Default | Description |
| --- | --- | --- |
| `region_min_load_threshold` | `"10KB"` | The minimum write load for a Region to be considered movable. This option represents a write rate in bytes/s. The configured value is written as a byte size. For example, `"10KB"` means 10KB/s. Regions below this threshold are not selected as migration candidates. |
| `region_min_cpu_time_threshold` | `100000000.0` | The minimum query CPU time rate for a Region to be considered read-active and eligible for read-driven rebalancing. The unit is query CPU-time nanoseconds per second (ns/s); the default equals 100 ms of query CPU time per second. It also acts as the minimum total Datanode read CPU load required to classify a Datanode as read-high-load. |
| `scorer_var_bound` | `0.5` | The load bound used by the scorer to evaluate migration candidates. This value must be greater than `acceptable_load_ratio`. |
| `min_write_samples` | `3` | The minimum number of write-throughput history samples required to evaluate Region write stability. |
| `max_write_region_history_cv` | `0.2` | The maximum acceptable coefficient of variation for a Region's write-throughput history. Regions above this value are considered write-unstable. |
| `min_read_samples` | `3` | The minimum number of query CPU time history samples required to evaluate Region read stability. |
| `max_read_region_history_cv` | `0.3` | The maximum acceptable coefficient of variation for a Region's query CPU time history. Regions above this value are considered read-unstable. |
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
