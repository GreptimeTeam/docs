---
keywords: [触发器, 告警, GreptimeDB企业版, SQL, Webhook, Alertmanager, Slack]
description: 本指南演示GreptimeDB触发器如何与Prometheus Alertmanager生态系统无缝集成，实现监控和告警功能。
---

# Trigger

Trigger 允许用户基于 SQL 语句定义触发规则，GreptimeDB 根据这些触发规则进行周期性
计算，当满足条件后对外发出通知。

## 快速入门示例

### 概述

本节将通过一个端到端示例展示如何使用触发器监控系统负载并触发告警。

下图展示了该示例的完整端到端工作流程。

![触发器演示架构](/trigger-demo-architecture.png)

1. Vector 持续采集主机指标并写入GreptimeDB。
2. GreptimeDB 中的 Trigger 每分钟评估规则`load1 > 10`；当条件满足时，会向 Alertmanager
    发送通知。
3. Alertmanager 依据自身配置完成告警分组、抑制及路由，最终通过 Slack 集成将消息
    发送至指定频道。


> GreptimeDB 的 Webhook 输出格式与 Prometheus Alertmanager 完全兼容，可以直接接
入 Alertmanager 生态。

### 前置工作

首先，使用 Vector 采集本机的负载数据，并将数据写入 GreptimeDB 中。Vector 的配置
示例如下所示：

```toml
[sources.in]
type = "host_metrics"
scrape_interval_secs = 15

[sinks.out]
inputs = ["in"]
type = "greptimedb"
endpoint = "localhost:4001"
```

GreptimeDB 会在数据写入的时候自动创建表，其中，`host_load1`表记录了 load1 数据，
表结构如下所示：

```sql
+-----------+----------------------+------+------+---------+---------------+
| Column    | Type                 | Key  | Null | Default | Semantic Type |
+-----------+----------------------+------+------+---------+---------------+
| ts        | TimestampMillisecond | PRI  | NO   |         | TIMESTAMP     |
| collector | String               | PRI  | YES  |         | TAG           |
| host      | String               | PRI  | YES  |         | TAG           |
| val       | Float64              |      | YES  |         | FIELD         |
+-----------+----------------------+------+------+---------+---------------+
```

> “load1” 指的是 Linux 系统中过去 1 分钟的平均负载（load average），它是衡量系统
繁忙程度的关键性能指标之一。

配置 Alertmanager 的 Slack Receiver 的具体过程不在此赘述。为在 Slack 消息中呈现
一致、易读的内容，可以配置以下模板。

```text
{{ define "slack.text" }}

Alert: {{ .CommonLabels.alertname }} (Status: {{ .CommonLabels.status }})
Severity: {{ .CommonLabels.severity }}

Annotations:
{{ range .CommonAnnotations.SortedPairs }}
- {{ .Name }}: {{ .Value }}
{{ end }}

Labels:
{{ range .CommonLabels.SortedPairs }}
- {{ .Name }}: {{ .Value }}
{{ end }}

{{ end }}
```

当配置完成之后，启动 Alertmanager。

### 演示示例

在 GreptimeDB 中创建 Trigger。使用 MySql 客户端连接 GreptimeDB 并执行以下 SQL：

```sql
CREATE TRIGGER IF NOT EXISTS load1_monitor
        ON (
                SELECT collector AS label_collector, 
                host as label_host, 
                val 
                FROM host_load1 WHERE val > 10 and ts >= now() - '1 minutes'::INTERVAL
                ) EVERY '1 minute'::INTERVAL
        LABELS (severity=warning)
        ANNOTATIONS (comment='Your computer is smoking, should take a break.')
        NOTIFY(
                WEBHOOK alert_manager URL 'http://127.0.0.1localhost:9093' WITH (timeout="1m")
        );
```

上述SQL将创建一个名为`load1_monitor`的触发器，每分钟运行一次。它会评估 `host_load1`
表中最近 60 秒的数据；如果任何 load1 值超过10，就会触发 GreptimeDB 向 Alertmanager
发送通知。

执行`SHOW TRIGGERS`查看已创建的触发器列表。

```sql
SHOW TRIGGERS;
```

输出结果应如下所示：

```text
+---------------+
| Triggers      |
+---------------+
| load1_monitor |
+---------------+
```

使用 stress-ng 模拟 60 秒的高 CPU 负载：

```bash
stress-ng --cpu 100 --cpu-load 10 --timeout 60
```

load1 值将快速上升，Trigger 将被触发，在一分钟之内，指定的 Slack 频道将收到如下
告警：

![Slack 告警示意图](/trigger-slack-alert.png)
