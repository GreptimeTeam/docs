---
keywords: [Grafana Alloy, 数据目的地, Prometheus Remote Write, OpenTelemetry, 配置示例]
description: 介绍如何将 GreptimeCloud 配置为 Grafana Alloy 的数据目的地，并提供了 Prometheus Remote Write 和 OpenTelemetry 的配置示例。
---

# Alloy

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) 是可观测数据采集器，同时兼容 OpenTelemetry。GreptimeDB 可被配置
为 Alloy 的数据目的地。

## Prometheus Remote Write

将 GreptimeDB 配置为 Prometheus Remote Write 目的地。

```
// config.alloy

prometheus.remote_write "greptimedb" {
    endpoint {
        url = "https://<host>/v1/prometheus/write?db=<dbname>"

        basic_auth {
            username = "<username>"
            password = "<password>"
        }
    }
}
```

## OpenTelemetry

GreptimeDB 也可以被配置为 OpenTelemetry 收集器。

```
// config.alloy

otelcol.exporter.otlphttp "greptimedb" {
  client {
    endpoint = "https://<host>/v1/otlp/"
    headers  = {
      "X-Greptime-DB-Name" = "<dbname>",
    }
    auth     = otelcol.auth.basic.credentials.handler
  }
}

otelcol.auth.basic "credentials" {
  username = "<username>"
  password = "<password>"
}
```
