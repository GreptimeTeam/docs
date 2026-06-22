---
keywords: [enterprise, management console, continuous profiling, CPU profile, memory profile, pprof]
description: Configure and use Continuous Profiling in the GreptimeDB Enterprise Management Console to capture CPU and memory profiles.
---

# Continuous Profiling

Continuous Profiling in the Management Console monitors GreptimeDB component resource usage and stores pprof-format memory and CPU profiles in the monitoring GreptimeDB instance. It helps operators investigate memory growth, high CPU usage, and performance regressions without manually logging in to each component.

Continuous Profiling is configured on the dashboard apiserver and works at the cluster level. When enabled, the monitor scans component series from cluster metrics, captures the first seen component, and captures later profiles when resource usage grows by the configured step or reaches a new high above the configured threshold.

## Memory Profiles

Enable memory profile monitoring in the dashboard apiserver configuration:

```yaml
monitoring:
  greptimedb:
    url: http://monitoring-greptimedb:4000
  memory_profile:
    enabled: true
    memory_profiles_database: public
    memory_profiles_table: _gt_memory_profiles
    memoryProfileStepMB: 100
    highMemoryThresholdMB: 1024
```

The profile table defaults to `public._gt_memory_profiles` and is created with a default TTL of 30 days. The monitor uses memory usage, memory limit, and process start time metrics to decide when to capture a new profile.

The Management Console lists captured memory profiles with filters for Pod, App, Role, and time range. Use **Capture** to manually capture a profile for a component when you need an on-demand snapshot.

![Memory Profile list](/profile-page.png)

The table shows when the profile was captured, the component App and Pod, the component endpoint, memory usage, usage percentage, and profile status. Use the row actions to open a flamegraph, compare the profile with a base profile, or download the raw pprof file for offline analysis.

The flamegraph view renders a captured profile in the browser. The top toolbar supports common pprof interactions such as ordering, switching between **Left Heavy** and **Sandwich** views, importing and exporting profile data, and adjusting the display theme.

![Memory Profile flamegraph](/flame-ui.png)

## CPU Profiles

Enable CPU profile monitoring in the dashboard apiserver configuration:

```yaml
monitoring:
  greptimedb:
    url: http://monitoring-greptimedb:4000
  cpu_profile:
    enabled: true
    cpu_profiles_database: public
    cpu_profiles_table: _gt_cpu_profiles
    cpuProfileStepMillicores: 100
    highCPUThresholdMillicores: 800
    seconds: 5
    frequency: 99
```

The profile table defaults to `public._gt_cpu_profiles` and is created with a default TTL of 30 days. The monitor uses CPU usage, CPU limit, and process start time metrics to decide when to capture a new profile.

The **CPU Profile** page follows the same interaction pattern as Memory Profile. Use Pod, App, Role, and time range filters to find profile records. Use **Capture** for an on-demand CPU profile, and use row actions to open the flamegraph or download the raw pprof file for offline analysis.

Manual capture ignores threshold state but still requires the pod to be discoverable from the corresponding CPU metrics.
