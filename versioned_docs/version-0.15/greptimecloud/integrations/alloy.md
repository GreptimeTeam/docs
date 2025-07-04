---
keywords: [Grafana Alloy, Prometheus Remote Write, OpenTelemetry, data pipeline]
description: Instructions on integrating GreptimeCloud with Grafana Alloy for Prometheus Remote Write and OpenTelemetry.
---

# Alloy

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) is an observability data pipeline as well as an OpenTelemetry
collector distribution. You can integrate your GreptimeCloud instance as data
sinks of Alloy.

## Prometheus Remote Write

Configure GreptimeDB as remote write target.

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

GreptimeDB can also be configured as OpenTelemetry collector.

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
