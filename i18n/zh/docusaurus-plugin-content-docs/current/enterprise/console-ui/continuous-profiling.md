---
keywords: [企业版, 管理控制台, 持续性能剖析, CPU Profile, Memory Profile, pprof]
description: 在 GreptimeDB 企业版管理控制台中配置和使用持续性能剖析，采集 CPU 和内存 Profile。
---

# 持续性能剖析

管理控制台的持续性能剖析（Continuous Profiling）可以监控 GreptimeDB 各组件的资源使用情况，并将 pprof 格式的内存和 CPU Profile 存储到监控用的 GreptimeDB 实例中。该功能可以帮助运维人员排查内存增长、高 CPU 使用率和性能回退问题，而无需手动登录到每个组件所在节点。

持续性能剖析在 dashboard apiserver 中配置，并以集群为粒度工作。启用后，监控器会扫描来自集群指标的组件序列，首先采集首次发现的组件；后续当资源使用量按配置的步长增长，或超过配置阈值后达到新的高水位时，再采集新的 Profile。

## 内存 Profile

在 dashboard apiserver 配置中启用内存 Profile 监控：

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

Profile 表默认是 `public._gt_memory_profiles`，创建时默认 TTL 为 30 天。监控器会查询 `process_resident_memory_bytes`、`greptime_memory_limit_in_bytes` 和 `process_start_time_seconds`，然后通过组件端点 `POST /debug/prof/mem?output=proto` 采集 Profile。

dashboard apiserver 提供用于列出、采集、下载和渲染内存 Profile 的 API。列表响应会包含 `profile_id`，但不包含原始 Profile 载荷。

管理控制台会以列表形式展示已采集的 Profile，并支持按 Pod、App、Role 和时间范围筛选。每一行都提供打开火焰图、与 base Profile 比较，或下载原始 pprof 文件的操作。

![内存 Profile 列表](/profile-page.png)

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles?start=1760000000000000000&end=1760003600000000000&pod=demo-datanode-0&role=datanode&app=greptime-datanode&limit=100'

curl -X POST 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/capture' \
  -H 'Content-Type: application/json' \
  -d '{"pod":"demo-datanode-0"}'

curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<profile_id>'
```

你可以下载 target-minus-base 的内存差异 Profile，格式为 pprof proto。该差异遵循 `go tool pprof -base` 语义：base Profile 会按 `-1` 缩放后合并到 target Profile 中。

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<target_profile_id>/diff?base_profile_id=<base_profile_id>' \
  -o memory-profile-diff.pprof

go tool pprof -http=:0 memory-profile-diff.pprof
```

你也可以直接从已采集的内存 Profile 渲染火焰图 HTML。设置 `base_profile_id` 后，会渲染 target-minus-base 的差异火焰图。

![内存 Profile 火焰图](/flame-ui.png)

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<target_profile_id>/flamegraph?sample_index=inuse_space' \
  -o memory-flamegraph.html

curl 'http://localhost:19095/api/v1/instances/ns_demo/memory-profiles/<target_profile_id>/flamegraph?base_profile_id=<base_profile_id>&sample_index=inuse_space' \
  -o memory-diff-flamegraph.html
```

支持的 `sample_index` 值包括 `inuse_space`、`inuse_objects`、`alloc_space` 和 `alloc_objects`。默认值为 `inuse_space`。

## CPU Profile

在 dashboard apiserver 配置中启用 CPU Profile 监控：

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

Profile 表默认是 `public._gt_cpu_profiles`，创建时默认 TTL 为 30 天。监控器会查询 `rate(process_cpu_seconds_total[1m])`、`greptime_cpu_limit_in_millicores` 和 `process_start_time_seconds`，然后通过组件端点 `POST /debug/prof/cpu?output=proto&seconds=<seconds>&frequency=<frequency>` 采集 Profile。

dashboard apiserver 提供用于列出、手动采集和下载 CPU Profile 的 API：

```bash
curl 'http://localhost:19095/api/v1/instances/ns_demo/cpu-profiles?start=1760000000000000000&end=1760003600000000000&pod=demo-datanode-0&role=datanode&limit=100'

curl -X POST 'http://localhost:19095/api/v1/instances/ns_demo/cpu-profiles/capture' \
  -H 'Content-Type: application/json' \
  -d '{"pod":"demo-datanode-0"}'

curl 'http://localhost:19095/api/v1/instances/ns_demo/cpu-profiles/<profile_id>/download' \
  -o cpu.pprof

go tool pprof -http=:0 cpu.pprof
```

手动采集会忽略阈值状态，但仍要求对应 Pod 能够从 CPU 或内存指标中被发现。
