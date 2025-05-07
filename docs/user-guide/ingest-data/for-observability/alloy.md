---
keywords: [Grafana Alloy, Prometheus Remote Write, OpenTelemetry, data pipeline]
description: Instructions on integrating GreptimeDB with Grafana Alloy for Prometheus Remote Write and OpenTelemetry.
---

# Grafana Alloy

[Grafana Alloy](https://grafana.com/docs/alloy/latest/) is an observability data pipeline for OpenTelemetry (OTel), Prometheus, Pyroscope, Loki, and many other metrics, logs, traces, and profiling tools.
You can integrate GreptimeDB as a data sink for Alloy.

## Prometheus Remote Write

Configure GreptimeDB as remote write target:

```hcl
prometheus.remote_write "greptimedb" {
    endpoint {
        url = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/prometheus/write?db=${GREPTIME_DB:=public}"

        basic_auth {
            username = "${GREPTIME_USERNAME}"
            password = "${GREPTIME_PASSWORD}"
        }
    }
}
```

- `GREPTIME_HOST`: GreptimeDB host address, e.g., `localhost`.
- `GREPTIME_DB`: GreptimeDB database name, default is `public`.
- `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments/authentication/static.md) for GreptimeDB.

For details on the data model transformation from Prometheus to GreptimeDB, refer to the [Data Model](/user-guide/ingest-data/for-observability/prometheus.md#data-model) section in the Prometheus Remote Write guide.

## OpenTelemetry

GreptimeDB can also be configured as OpenTelemetry collector.

### Metrics

```hcl
otelcol.exporter.otlphttp "greptimedb" {
  client {
    endpoint = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/otlp/"
    headers  = {
      "X-Greptime-DB-Name" = "${GREPTIME_DB:=public}",
    }
    auth     = otelcol.auth.basic.credentials.handler
  }
}

otelcol.auth.basic "credentials" {
  username = "${GREPTIME_USERNAME}"
  password = "${GREPTIME_PASSWORD}"
}
```

- `GREPTIME_HOST`: GreptimeDB host address, e.g., `localhost`.
- `GREPTIME_DB`: GreptimeDB database name, default is `public`.
- `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments/authentication/static.md) for GreptimeDB.

For details on the metrics data model transformation from OpenTelemetry to GreptimeDB, refer to the [Data Model](/user-guide/ingest-data/for-observability/opentelemetry.md#data-model) section in the OpenTelemetry guide.

### Logs

The following example setting up a logging pipeline using Loki and OpenTelemetry Collector (otelcol) to forward logs to a GreptimeDB:

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [otelcol.receiver.loki.greptime.receiver]
}

otelcol.receiver.loki "greptime" {
  output {
    logs = [otelcol.exporter.otlphttp.greptimedb_logs.input]
  }
}

otelcol.auth.basic "credentials" {
  username = "${GREPTIME_USERNAME}"
  password = "${GREPTIME_PASSWORD}"
}

otelcol.exporter.otlphttp "greptimedb_logs" {
  client {
    endpoint = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/otlp/"
    headers  = {
      "X-Greptime-DB-Name" = "${GREPTIME_DB:=public}",
      "X-Greptime-Log-Table-Name" = "demo_logs",
      "X-Greptime-Log-Extract-Keys" = "filename,log.file.name,loki.attribute.labels",
    }
    auth     = otelcol.auth.basic.credentials.handler
  }
}
```

- Loki Source Configuration
  - The `loki.source.file "greptime"` block defines a source for Loki to read logs from a file located at `/tmp/foo.txt`
  - The `forward_to` array indicates that the logs read from this file should be forwarded to the `otelcol.receiver.loki.greptime.receiver`
- OpenTelemetry Collector Receiver Configuration:
  - The `otelcol.receiver.loki "greptime"` block sets up a receiver within the OpenTelemetry Collector to receive logs from Loki.
  - The `output` section specifies that the received logs should be forwarded to the `otelcol.exporter.otlphttp.greptimedb_logs.input`.
- OpenTelemetry Collector Exporter Configuration:
  - The `otelcol.exporter.otlphttp "greptimedb_logs"` block configures an HTTP exporter to send logs to GreptimeDB.
  - `GREPTIME_HOST`: GreptimeDB host address, e.g., `localhost`.
  - `GREPTIME_DB`: GreptimeDB database name, default is `public`.
  - `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments/authentication/static.md) for GreptimeDB.
  - `LOG_TABLE_NAME`: The name of the table to store logs, default table name is `opentelemetry_logs`.
  - `EXTRACT_KEYS`: The keys to extract from the attributes, separated by commas (`,`), e.g., `filename,log.file.name,loki.attribute.labels`, see [HTTP API documentation](opentelemetry.md#otlphttp-api-1) for details.

For details on the log data model transformation from OpenTelemetry to GreptimeDB, refer to the [Data Model](/user-guide/ingest-data/for-observability/opentelemetry.md#data-model-1) section in the OpenTelemetry guide.

:::tip NOTE
The example codes above may be outdated according to OpenTelemetry. We recommend that you refer to the official OpenTelemetry documentation And Grafana Alloy for the most up-to-date information.
:::

For more information on the example code, please refer to the official documentation for your preferred programming language.
