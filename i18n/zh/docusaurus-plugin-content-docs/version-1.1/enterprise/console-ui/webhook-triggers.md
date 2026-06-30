---
keywords: [企业版, 管理控制台, Webhook 触发器, 资源使用, 告警, CPU, 内存]
description: 在企业版 dashboard 中配置 webhook 触发器，基于 GreptimeDB 集群资源使用指标发送通知。
---

# Webhook 触发器

Webhook 触发器会监控集群资源使用指标，并在达到配置阈值时发送 HTTP 通知。该功能仅属于企业版，并且只有在部署企业版 dashboard 时可用。

在 dashboard apiserver 配置中，按 provisioned instance 将 webhook 触发器配置到 `settings.monitoring.webhook_triggers` 下。启用 webhook 触发器需要配置指标数据源，即 `settings.monitoring.greptimedb.url` 或 `settings.monitoring.metrics.prometheus`。

```yaml
provisionedInstances:
  - name: mycluster
    settings:
      monitoring:
        greptimedb:
          url: http://monitoring-greptimedb:4000
        # 也可以使用 Prometheus 兼容的指标数据源：
        # metrics:
        #   prometheus: http://prometheus:9090
        webhook_triggers:
          - name: high-datanode-memory
            enabled: true
            roles: [datanode]
            metric: memory_usage_percent
            operator: ">="
            threshold: 90
            cooldown_seconds: 300
            url: https://alerts.example.com/datanode-memory
            headers:
              Authorization: Bearer token
          - name: high-frontend-cpu
            enabled: true
            roles: [frontend]
            metric: cpu_usage_millicores
            threshold: 1000
            cooldown_seconds: 600
            url: https://alerts.example.com/frontend-cpu
```

Webhook 触发器配置项：

- `name`：触发器名称。`enabled` 为 `true` 时必填。同一个 instance 内名称必须唯一，且不能包含 `/`。
- `enabled`：启用或禁用该触发器。
- `roles`：可选的角色过滤器。省略或留空表示匹配所有角色。支持的角色包括 `frontend`、`metasrv`、`datanode` 和 `flownode`。
- `metric`：要检查的资源使用指标。支持 `memory_usage_percent`、`memory_usage_bytes`、`cpu_usage_percent` 和 `cpu_usage_millicores`。
- `operator`：比较运算符。默认值和当前唯一支持的值都是 `>=`。
- `threshold`：阈值，必须大于 `0`。百分比指标的阈值必须小于或等于 `100`。
- `cooldown_seconds`：同一活跃告警重复发送 `firing` 通知的最小间隔，默认值为 `300` 秒。
- `url`：Webhook 端点。`enabled` 为 `true` 时必填，并且必须使用 `http://` 或 `https://`。
- `headers`：可选的自定义 HTTP header，例如 `Authorization`。Webhook 客户端总是会发送 `Content-Type: application/json`。

当匹配的组件指标越过阈值时，dashboard apiserver 会发送 `firing` payload。告警保持活跃期间，同一 instance、trigger、pod 和进程启动时间对应的重复 `firing` payload 会被抑制，直到超过 `cooldown_seconds`。当指标降到阈值以下时，dashboard apiserver 会发送 `resolved` payload。

Webhook payload 使用固定 JSON 结构，暂不支持自定义模板。下面是一个代表性的 `firing` payload：

```json
{
  "status": "firing",
  "trigger_name": "high-datanode-memory",
  "metric": "memory_usage_percent",
  "operator": ">=",
  "threshold": 90,
  "value": 91.2,
  "instance": "ns_demo",
  "cluster": "demo",
  "namespace": "ns",
  "pod": "demo-datanode-0",
  "role": "datanode",
  "app": "greptime-datanode",
  "component_instance": "datanode-0",
  "endpoint": "http://demo-datanode-0:4000",
  "process_start_time_seconds": 1760000000,
  "starts_at": "2026-06-23T10:00:00Z",
  "ends_at": null,
  "sent_at": "2026-06-23T10:00:00Z"
}
```

对于 `resolved` payload，`status` 为 `resolved`，`value` 是使告警恢复的低于阈值的指标值，并且会设置 `ends_at`。

:::note
Webhook 触发器状态保存在 dashboard apiserver 内存中，不具备持久性，也没有持久化重试队列。如果 dashboard apiserver 重启，或者 instance、trigger、pod 指标序列消失，对应状态可能会被遗忘且不会发送 `resolved`。需要强保证的接收端应自行设置告警过期机制。
:::
