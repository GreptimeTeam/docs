---
keywords: [Fluent Bit, GreptimeCloud, metrics ingestion, logs ingestion, data pipeline]
description: Guide for using Fluent Bit with GreptimeCloud, including configuration for metrics and logs ingestion, and running Fluent Bit with a sample configuration.
---


# Fluent Bit

Fluent Bit is a lightweight and fast log processor and forwarder that can collect, parse, filter, and forward logs and metrics. Fluent Bit is part of the Fluentd project ecosystem and is written in C language. It is designed to be memory-efficient and performant, making it suitable for use in resource-constrained environments.

## Prometheus Remote Write

Fluent Bit can be configured to send metrics to GreptimeCloud using the Prometheus Remote Write protocol. This allows you to collect metrics from various sources and send them to GreptimeCloud for storage, analysis, and visualization.

```
[OUTPUT]
    Name                 prometheus_remote_write
    Match                internal_metrics
    Host                 <your greptimecloud hostname>
    Port                 80
    Uri                  /v1/prometheus/write?db=public
    Tls                  Off
    http_user            <username>
    http_passwd          <password>
```

In this example, the `prometheus_remote_write` output plugin is used to send metrics to GreptimeCloud. For more information, and extra options, refer to the [Prometheus Remote Write](https://docs.greptime.com/user-guide/ingest-data/for-observability/prometheus) guide.

## OpenTelemetry

Fluent Bit can be configured to send logs and metrics to GreptimeCloud using the OpenTelemetry protocol. This allows you to collect logs and metrics from various sources and send them to GreptimeCloud for storage, analysis, and visualization.

```
# Only for metrics
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_metrics
    Match                *_metrics
    Host                 <your greptimecloud hostname>
    Port                 4000
    Metrics_uri          /v1/otlp/v1/metrics
    Logs_uri             /v1/otlp/v1/logs
    Traces_uri           /v1/otlp/v1/traces
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off

# Only for logs
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_logs
    Match                *_logs
    Host                 <your greptimecloud hostname>
    Port                 80
    Metrics_uri          /v1/otlp/v1/metrics
    Logs_uri             /v1/otlp/v1/logs
    Traces_uri           /v1/otlp/v1/traces
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off
    Header X-Greptime-Log-Table-Name "log_table"
    Header X-Greptime-Log-Pipeline-Name "pipeline_name"
```

In this example, the [OpenTelemetry OTLP/HTTP API](https://docs.greptime.com/user-guide/ingest-data/for-observability/opentelemetry) interface is used. For more information, and extra options, refer to the [OpenTelemetry](https://docs.greptime.com/user-guide/ingest-data/for-observability/opentelemetry) guide.