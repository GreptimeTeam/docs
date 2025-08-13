---
keywords: [elasticsearch, 读副本, 触发器]
description: GreptimeDB 企业版 25.05 发布说明，新功能 Elasticsearch 兼容层，读副本，触发器等
---

# Release 25.05

我们很高兴向大家介绍 GreptimeDB 企业版的 25.05 版本。

## 特性亮点

### Elasticsearch 兼容层

此为 GreptimeDB Enterprise 中的 Elasticsearch 兼容层，这层允许用户将 GreptimeDB
配置为 Kibana 界面的后端，进行日志的搜索、聚合和大盘构建。

本次发布支持的查询：

- match
- match_all
- multi_match
- term
- terms
- prefix
- wildcard
- regexp
- range
- exists
- bool

### 读副本

为了更好地支持分析型查询和其他高代价的查询，本版本中我们设计了专门的查询节点。这
类节点将专门执行查询，因此在使用时可以将资源尽可能使用而不用担心影响数据的在线写
入。

得益于我们的存算分离架构，增加专门的读节点并不是非常大的架构重构。一种新的
datanode 角色将承担这种任务。由于数据存储在对象存储上，在创建读节点时不会产生由
datanode 向新节点的数据拷贝，创建的过程成本很低。用户在发送查询时可以指定查询是
否要运行在读副本上。

### 触发器

GreptimeDB 的触发器定期检查用户配置的规则，如果满足条件就将触发下游的 webhook。
当前发布的是触发器的首个版本，我们设计的目标也是让它可以和 Prometheus
AlertManager 一起工作。注意这不是关系型数据库中的触发器。

```sql
CREATE TRIGGER IF NOT EXISTS cpu_monitor
    ON (SELECT host AS host_label, cpu, memory FROM machine_monitor WHERE cpu > 1)
        EVERY '5 minute'::INTERVAL
    LABELS (severity = 'warning')
    ANNOTATIONS (summary = 'CPU utilization is too high', link = 'http://...')
    NOTIFY(
        WEBHOOK alert_manager URL 'http://127.0.0.1:9093' WITH (timeout="1m")
    );
```

### Flow Reliability

Flow 增加了可靠性功能：

- 任务迁移：在多个 flow 节点之间调度任务，可以保持负载均衡或高可用。

## GreptimeDB 开源版特性

本版本基于 GreptimeDB 开源版 v0.14。
