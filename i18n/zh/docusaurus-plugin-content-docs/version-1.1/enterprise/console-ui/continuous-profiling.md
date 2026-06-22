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

Profile 表默认是 `public._gt_memory_profiles`，创建时默认 TTL 为 30 天。监控器会根据内存使用量、内存限制和进程启动时间指标判断何时采集新的 Profile。

管理控制台会以列表形式展示已采集的内存 Profile，并支持按 Pod、App、Role 和时间范围筛选。需要按需采集组件 Profile 时，可以使用 **Capture**。

![内存 Profile 列表](/profile-page.png)

列表会展示 Profile 的采集时间、组件 App 和 Pod、组件端点、内存用量、使用率以及 Profile 状态。你可以通过行内操作打开火焰图、与 base Profile 进行对比，或下载原始 pprof 文件用于离线分析。

火焰图视图会在浏览器中渲染已采集的 Profile。顶部工具栏支持常见 pprof 交互，例如排序、在 **Left Heavy** 和 **Sandwich** 视图间切换、导入导出 Profile 数据，以及调整展示主题。

![内存 Profile 火焰图](/flame-ui.png)

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

Profile 表默认是 `public._gt_cpu_profiles`，创建时默认 TTL 为 30 天。监控器会根据 CPU 使用量、CPU 限制和进程启动时间指标判断何时采集新的 Profile。

**CPU Profile** 页面与 Memory Profile 页面使用相同的交互方式。你可以通过 Pod、App、Role 和时间范围筛选 Profile 记录；使用 **Capture** 按需采集 CPU Profile；并通过行内操作打开火焰图或下载原始 pprof 文件用于离线分析。

手动采集会忽略阈值状态，但仍要求对应 Pod 能够从 CPU 指标中被发现。
