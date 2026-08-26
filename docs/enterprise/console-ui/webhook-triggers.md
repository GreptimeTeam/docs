---
keywords: [enterprise, management console, webhook triggers, resource usage, alerting, CPU, memory]
description: Configure enterprise dashboard webhook triggers to send notifications based on GreptimeDB cluster resource usage metrics.
---

# Webhook Triggers

Webhook triggers monitor cluster resource usage metrics and send HTTP notifications when a configured threshold is reached. This is an enterprise-only feature and is available only when the enterprise dashboard is deployed with dashboard version `v0.2.0-alpha.10` or later.

Configure webhook triggers per provisioned instance under `settings.monitoring.webhook_triggers` in the dashboard apiserver configuration. Enabled webhook triggers require a metrics source, either `settings.monitoring.greptimedb.url` or `settings.monitoring.metrics.prometheus`.

```yaml
provisionedInstances:
  - name: mycluster
    settings:
      monitoring:
        greptimedb:
          url: http://monitoring-greptimedb:4000
        # Or use a Prometheus-compatible metrics source:
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

Webhook trigger configuration items:

- `name`: Trigger name. Required when `enabled` is `true`. The name must be unique within the instance and must not contain `/`.
- `enabled`: Enables or disables the trigger.
- `roles`: Optional role filter. Omit it or leave it empty to match all roles. Supported roles are `frontend`, `metasrv`, `datanode`, and `flownode`.
- `metric`: Resource usage metric to evaluate. Supported metrics are `memory_usage_percent`, `memory_usage_bytes`, `cpu_usage_percent`, and `cpu_usage_millicores`.
- `operator`: Comparison operator. The default and only supported value is `>=`.
- `threshold`: Threshold value. It must be greater than `0`. Percentage metrics must be less than or equal to `100`.
- `cooldown_seconds`: Minimum interval between repeated `firing` notifications for the same active alert. The default is `300` seconds.
- `url`: Webhook endpoint. Required when `enabled` is `true`; the URL must use `http://` or `https://`.
- `headers`: Optional custom HTTP headers, for example `Authorization`. The webhook client always sends `Content-Type: application/json`.

When a matching component crosses the threshold, the dashboard apiserver sends a `firing` payload. While the alert remains active, repeated `firing` payloads for the same instance, trigger, pod, and process start time are suppressed until `cooldown_seconds` elapses. When the metric drops below the threshold, the dashboard apiserver sends a `resolved` payload.

Webhook payloads use a fixed JSON schema and cannot be templated. A representative `firing` payload looks like this:

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

For `resolved` payloads, `status` is `resolved`, `value` is the below-threshold value that resolved the alert, and `ends_at` is set.

:::note
Webhook trigger state is kept in dashboard apiserver memory and is not durable. There is no durable retry queue. If the dashboard apiserver restarts, or if an instance, trigger, or pod series disappears, the corresponding state may be forgotten without sending `resolved`. Receivers that need hard guarantees should expire alerts on their side.
:::
