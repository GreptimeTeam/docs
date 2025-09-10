---
keywords: [Region Balancer, Datanode, 负载均衡, 窗口大小, 负载阈值, 迁移]
description: 介绍 Region Balancer 插件，通过配置窗口大小和负载阈值来均衡 Datanode 上的 Region 写入负载，避免频繁迁移。
---

# Region Balancer

该插件用于均衡 Datanode 上的 Region 写入负载，通过指定的窗口大小和负载阈值来避免频繁的 Region 迁移。可通过添加以下配置至 Metasrv 开启 Region Rebalancer 功能。

```toml
[[plugins]]
[plugins.region_balancer]

window_size = "45s"

window_stability_threshold = 2

min_load_threshold = "10MB"

tick_interval = "45s"
```

## 配置项说明

- `window_size`: string
  - **说明**: 滑动窗口的时间跨度，用于计算区域负载的短期平均值。窗口期内的负载变化会被平滑，减轻短期突增对负载均衡的影响。
  - **单位**: 时间（支持格式：`"45s"` 表示 45 秒）。
  - **建议**: 根据集群负载波动情况配置，较大的窗口会使负载均衡响应更平稳。
- `window_stability_threshold`: integer
  - **说明**: 连续多少个窗口必须满足触发条件后，才会进行迁移操作。该阈值用于防止频繁的平衡操作，只在持续不均衡的情况下进行 Region 迁移。
  - **建议**: 较大的值会延迟再平衡的触发，适用于负载波动较大的系统；值为 2 表示需要至少两个连续窗口符合条件。
- `min_load_threshold`: string
  - **说明**: 触发 Region 迁移的最小写负载阈值（每秒字节数）。当节点的负载低于该值时，将不会触发迁移。
  - **单位**: 字节（例如，`"10MB"` 表示 10 MiB）。
  - **建议**: 设置为合理的最小值，防止小负载情况触发迁移。值可以根据系统实际流量进行调整。
- `tick_interval`: string
  - **说明**: 平衡器的运行间隔时间，控制负载均衡任务的触发频率。
  - **单位**: 时间（例如，"45s" 表示 45 秒）。
  - **建议**: 根据系统的响应速度和负载变化频率设置。较短的间隔可以更快响应负载变化，但可能增加系统开销。