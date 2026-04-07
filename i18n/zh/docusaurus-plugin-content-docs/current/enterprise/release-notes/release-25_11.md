---
keywords: [release notes, greptimedb enterprise]
description: GreptimeDB 企业版 25.05 发布说明，新功能 Elasticsearch 兼容层，读副本，触发器等
---

# GreptimeDB 企业版 25.11

我们很高兴向大家介绍 GreptimeDB 企业版的 25.11 版本。

## 特性亮点

### 批量写入

批量写入是我们在企业版中引入的一种新的写入链路，这套机制适用于高吞吐的数据写入、
导入场景。根据我们的测试，新的写入链路可以带来高达 5 倍的吞吐量加速。

在这个版本中，我们先为 Prometheus remote write 路径添加了批量写入的支持，其余更
多的协议支持将陆续加入到 25.11 后续的功能版本。

使用批量写入并不需要用户调整客户端 API 。

### Triggers 的功能完善

Trigger 功能在 25.11 版本进行了功能的补齐，包含支持类似 Prometheus 的 `for` 和
`keep_firing_for` 等触发状态管理机制。

[通过 Trigger 文档了解更多](../trigger.md).

## 来自 GreptimeDB 开源版本的更新

此版本基于 GreptimeDB 开源版 v1.0.0.
