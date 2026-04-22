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
- `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.

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
- `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.

For details on the metrics data model transformation from OpenTelemetry to GreptimeDB, refer to the [Data Model](/user-guide/ingest-data/for-observability/opentelemetry.md#data-model) section in the OpenTelemetry guide.

### Logs

This example sends logs to GreptimeDB through an OpenTelemetry pipeline.
For production log pipelines, add an explicit batch processor before the exporter. See the [Batching](#batching) section for details.

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [otelcol.receiver.loki.greptime.receiver]
}

otelcol.receiver.loki "greptime" {
  output {
    logs = [otelcol.processor.batch.greptimedb_logs.input]
  }
}

otelcol.processor.batch "greptimedb_logs" {
  send_batch_size     = 5000
  send_batch_max_size = 10000
  timeout             = "1s"

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
    headers = {
      "X-Greptime-DB-Name"          = "${GREPTIME_DB:=public}",
      "X-Greptime-Log-Table-Name"   = "${GREPTIME_LOG_TABLE_NAME:=demo_logs}",
      "X-Greptime-Log-Extract-Keys" = "filename,log.file.name,loki.attribute.labels",
    }
    auth = otelcol.auth.basic.credentials.handler
  }

  sending_queue {
    queue_size    = 10000
    num_consumers = 10
  }
}
```

- `GREPTIME_HOST`: GreptimeDB host address, such as `localhost`.
- `GREPTIME_DB`: GreptimeDB database name, default is `public`.
- `GREPTIME_LOG_TABLE_NAME`: Target log table name, default is `demo_logs`.
- `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.
- `X-Greptime-Log-Extract-Keys`: Keys extracted from OTLP log attributes. See the [OTLP/HTTP API documentation](/user-guide/ingest-data/for-observability/opentelemetry.md#otlphttp-api-1) for details.

For details on the log data model transformation from OpenTelemetry to GreptimeDB, refer to the [Data Model](/user-guide/ingest-data/for-observability/opentelemetry.md#data-model-1) section in the OpenTelemetry guide.

## Loki

GreptimeDB also supports the Loki push protocol for logs.
If your Alloy pipeline is already built with Loki components, we recommend using the native Loki ingestion path first.
See the [Loki guide](/user-guide/ingest-data/for-observability/loki.md) for the Loki protocol details and data model mapping.

### Logs

This example uses only Loki components to read, process, and send logs to GreptimeDB through the Loki push API:

```hcl
loki.source.file "greptime" {
  targets = [
    {__path__ = "/tmp/foo.txt"},
  ]
  forward_to = [loki.process.greptime.receiver]
}

loki.process "greptime" {
  forward_to = [loki.write.greptimedb.receiver]

  stage.static_labels {
    values = {
      job  = "greptime",
      from = "alloy",
    }
  }
}

loki.write "greptimedb" {
  endpoint {
    url = "${GREPTIME_SCHEME:=http}://${GREPTIME_HOST:=greptimedb}:${GREPTIME_PORT:=4000}/v1/loki/api/v1/push"
    headers = {
      "X-Greptime-DB-Name"        = "${GREPTIME_DB:=public}",
      "X-Greptime-Log-Table-Name" = "${GREPTIME_LOG_TABLE_NAME:=loki_demo_logs}",
    }

    basic_auth {
      username = "${GREPTIME_USERNAME}"
      password = "${GREPTIME_PASSWORD}"
    }
  }
}
```

- `GREPTIME_HOST`: GreptimeDB host address, such as `localhost`.
- `GREPTIME_DB`: GreptimeDB database name, default is `public`.
- `GREPTIME_LOG_TABLE_NAME`: Target log table name, default is `loki_demo_logs`.
- `GREPTIME_USERNAME` and `GREPTIME_PASSWORD`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.

This configuration tails `/tmp/foo.txt`, adds two static labels, and sends the logs directly to GreptimeDB with `loki.write`.

## Batching

`otelcol.exporter.otlphttp` does not enable batching by default.
When Alloy reads a burst of logs, such as a large backlog from files or Docker containers, the exporter queue can fill before enough records are grouped together, which leads to errors like `sending queue is full`.

Based on the behavior reported in production testing, enabling the exporter's internal `sending_queue.batch` block alone may still be insufficient for bursty log workloads.
Putting `otelcol.processor.batch` in front of the exporter is a more reliable pattern for logs because the exporter receives larger bundled batches instead of many individual log records.

If you use OTLP/HTTP for logs, we recommend this order:

1. `loki.source.*`
2. `otelcol.receiver.loki`
3. `otelcol.processor.batch`
4. `otelcol.exporter.otlphttp`

If your pipeline is already Loki-native and you do not need OpenTelemetry processing, prefer `loki.write` and the Loki push protocol instead.

:::tip NOTE
Refer to the official Grafana Alloy documentation for the latest component behavior and tuning guidance, especially for `loki.write`, `otelcol.processor.batch`, and `otelcol.exporter.otlphttp`.
:::
