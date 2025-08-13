---
keywords: [Trigger, 告警, GreptimeDB 企业版, SQL, Webhook, Alertmanager, Slack]
description: 本指南演 示GreptimeDB Trigger 如何与 Prometheus Alertmanager 生态系统无缝集成，实现监控和告警功能。
---

## 快速入门示例

本节将通过一个端到端示例展示如何使用触发器监控系统负载并触发告警。

下图展示了该示例的完整端到端工作流程。

![触发器演示架构](/trigger-demo-architecture.png)

1. Vector 持续采集主机指标并写入 GreptimeDB。
2. GreptimeDB 中的 Trigger 每分钟评估规则；当条件满足时，会向 Alertmanager 发送
    通知。
3. Alertmanager 依据自身配置完成告警分组、抑制及路由，最终通过 Slack 集成将消息
    发送至指定频道。

## 使用 Vector 采集主机指标

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
load1 是衡量系统活动的关键性能指标。我们可以创建监控规则来跟踪此表中的值。表结构
如下所示：

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

## 配置 Alertmanager 与 Slack 集成

GreptimeDB Trigger 的 Webhook payload 与 [Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
兼容，因此我们可以复用 Alertmanager 的分组、抑制、静默和路由功能，而无需任何额外
的胶水代码。

你可以参考 [官方文档](https://prometheus.io/docs/alerting/latest/configuration/)
对 Prometheus Alertmanager 进行配置。为在 Slack 消息中呈现一致、易读的内容，可以
配置以下消息模板。

```text
{{ define "slack.text" }}
{{ range .Alerts }}

Labels:
{{- range .Labels.SortedPairs }}
- {{ .Name }}: {{ .Value }}
{{ end }}

Annotations:
{{- range .Annotations.SortedPairs }}
- {{ .Name }}: {{ .Value }}
{{ end }}

{{ end }}
{{ end }}
```

使用上述模板生成 slack 消息会遍历所有的告警，并把每个告警的标签和注解展示出来。

当配置完成之后，启动 Alertmanager。

## 创建 Trigger

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
                WEBHOOK alert_manager URL 'http://localhost:9093' WITH (timeout="1m")
        );
```

上述 SQL 将创建一个名为 `load1_monitor` 的触发器，每分钟运行一次。它会评估 `host_load1`
表中最近 60 秒的数据；如果任何 load1 值超过 10，则 `NOTIFY` 子句中的 `WEBHOOK`
选项会指定 Trigger 向在本地主机上运行且端口为 9093 的 Alertmanager 发送通知。

执行 `SHOW TRIGGERS` 查看已创建的触发器列表。

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

## 测试 Trigger

使用 [stress-ng](https://github.com/ColinIanKing/stress-ng) 模拟 60 秒的高 CPU 负载：

```bash
stress-ng --cpu 100 --cpu-load 10 --timeout 60
```

load1 值将快速上升，Trigger 通知将被触发，在一分钟之内，指定的 Slack 频道将收到如下
告警：

![Slack 告警示意图](/trigger-slack-alert.png)
