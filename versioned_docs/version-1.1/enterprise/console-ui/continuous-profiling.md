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

The profile table defaults to `public._gt_memory_profiles` and is created with a default TTL of 30 days. The monitor queries `process_resident_memory_bytes`, `greptime_memory_limit_in_bytes`, and `process_start_time_seconds`, then captures profiles from `POST /debug/prof/mem?output=proto`.

The dashboard apiserver exposes APIs to list, capture, download, and render memory profiles. List responses include `profile_id` and omit the raw profile payload.

The Management Console lists captured profiles with filters for Pod, App, Role, and time range. Each row provides actions to open the flamegraph, compare with a base profile, or download the raw pprof file.

![Memory Profile list](/profile-page.png)

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles?start=1760000000000000000&end=1760003600000000000&pod=demo-datanode-0&role=datanode&app=greptime-datanode&limit=100'

curl -X POST 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/capture' \
  -H 'Content-Type: application/json' \
  -d '{"pod":"demo-datanode-0"}'

curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<profile_id>'
```

You can download a target-minus-base memory diff profile in pprof proto format. The diff follows `go tool pprof -base` semantics: the base profile is scaled by `-1` and merged into the target profile.

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<target_profile_id>/diff?base_profile_id=<base_profile_id>' \
  -o memory-profile-diff.pprof

go tool pprof -http=:0 memory-profile-diff.pprof
```

You can also render flamegraph HTML directly from a captured memory profile. Set `base_profile_id` to render a target-minus-base diff flamegraph.

![Memory Profile flamegraph](/flame-ui.png)

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<target_profile_id>/flamegraph?sample_index=inuse_space' \
  -o memory-flamegraph.html

curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<target_profile_id>/flamegraph?base_profile_id=<base_profile_id>&sample_index=inuse_space' \
  -o memory-diff-flamegraph.html
```

Supported `sample_index` values are `inuse_space`, `inuse_objects`, `alloc_space`, and `alloc_objects`. The default is `inuse_space`.

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

The profile table defaults to `public._gt_cpu_profiles` and is created with a default TTL of 30 days. The monitor queries `rate(process_cpu_seconds_total[1m])`, `greptime_cpu_limit_in_millicores`, and `process_start_time_seconds`, then captures profiles from `POST /debug/prof/cpu?output=proto&seconds=<seconds>&frequency=<frequency>`.

The dashboard apiserver exposes APIs to list, manually capture, and download CPU profiles:

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/cpu-profiles?start=1760000000000000000&end=1760003600000000000&pod=demo-datanode-0&role=datanode&limit=100'

curl -X POST 'http://localhost:19095/api/v1/instances/ns_demo/cpu-profiles/capture' \
  -H 'Content-Type: application/json' \
  -d '{"pod":"demo-datanode-0"}'

curl 'http://localhost:19095/api/v1/instances/ns_demo/cpu-profiles/<profile_id>/download' \
  -o cpu.pprof

go tool pprof -http=:0 cpu.pprof
```

Manual capture ignores threshold state but still requires the pod to be discoverable from the corresponding CPU or memory metrics.
