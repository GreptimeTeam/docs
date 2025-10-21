---
keywords: [Fluent bit, Prometheus Remote Write, OpenTelemetry, data pipeline]
description: Instructions on integrating GreptimeDB with Fluent bit for Prometheus Remote Write and OpenTelemetry.
---

# Fluent Bit

[Fluent Bit](http://fluentbit.io/) is a fast and lightweight telemetry agent for logs, metrics, and traces for Linux, macOS, Windows, and BSD family operating systems. Fluent Bit has been made with a strong focus on performance to allow the collection and processing of telemetry data from different sources without complexity.

You can forward Fluent Bit data to GreptimeDB. This document describes how to configure Fluent Bit to send logs, metrics, and traces to GreptimeDB.

## Http

Using Fluent Bit's [HTTP Output Plugin](https://docs.fluentbit.io/manual/pipeline/outputs/http), you can send logs to GreptimeDB.

```conf
[OUTPUT]
    Name             http
    Match            *
    Host             greptimedb
    Port             4000
    Uri              /v1/ingest?db=public&table=your_table&pipeline_name=pipeline_if_any
    Format           json
    Json_date_key    scrape_timestamp
    Json_date_format iso8601
    compress         gzip
    http_User        <username>
    http_Passwd      <password>
```

- `host`: GreptimeDB host address, e.g., `localhost`.
- `port`: GreptimeDB port, default is `4000`.
- `uri`: The endpoint to send logs to.
- `format`: The format of the logs, needs to be `json`.
- `json_date_key`: The key in the JSON object that contains the timestamp.
- `json_date_format`: The format of the timestamp.
- `compress`: The compression method to use, e.g., `gzip`.
- `header`: The header to send with the request, e.g., `Authorization` for authentication.
- `http_user` and `http_passwd`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.

In params Uri,
- `db` is the database name you want to write logs to.
- `table` is the table name you want to write logs to.
- `pipeline_name` is the pipeline name you want to use for processing logs.

In this example, the [Logs Http API](/reference/pipeline/write-log-api.md#http-api) interface is used. For more information, refer to the [Write Logs](/user-guide/logs/use-custom-pipelines.md#write-logs) guide.

## OpenTelemetry

GreptimeDB can also be configured as OpenTelemetry collector. Using Fluent Bit's [OpenTelemetry Output Plugin](https://docs.fluentbit.io/manual/pipeline/outputs/opentelemetry), you can send metrics, logs, and traces to GreptimeDB.

```
[OUTPUT]
    Name                 opentelemetry
    Match                *
    Host                 127.0.0.1
    Port                 4000
    Metrics_uri          /v1/otlp/v1/metrics
    Logs_uri             /v1/otlp/v1/logs
    Traces_uri           /v1/otlp/v1/traces
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off
    logs_body_key message
    http_User <username>
    http_Passwd <password>
```

- `Metrics_uri`, `Logs_uri`, and `Traces_uri`: The endpoint to send metrics, logs, and traces to.
- `http_user` and `http_passwd`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.

We recommend not writing metrics, logs, and traces to a single output simultaneously, as each has specific header options for specifying parameters. We suggest creating a separate OpenTelemetry output for metrics, logs, and traces. for example:

```
# Only for metrics
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_metrics
    Match                *
    Host                 127.0.0.1
    Port                 4000
    Metrics_uri          /v1/otlp/v1/metrics
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off

# Only for logs
[OUTPUT]
    Name                 opentelemetry
    Alias                opentelemetry_logs
    Match                *
    Host                 127.0.0.1
    Port                 4000
    Logs_uri             /v1/otlp/v1/logs
    Log_response_payload True
    Tls                  Off
    Tls.verify           Off
    Header X-Greptime-Log-Table-Name "<log_table_name>"
    Header X-Greptime-Log-Pipeline-Name "<pipeline_name>"
    Header X-Greptime-DB-Name "<dbname>"
```


In this example, the [OpenTelemetry OTLP/HTTP API](/user-guide/ingest-data/for-observability/opentelemetry.md#opentelemetry-collectors) interface is used. For more information, and extra options, refer to the [OpenTelemetry](/user-guide/ingest-data/for-observability/opentelemetry.md) guide.

## Prometheus Remote Write

Configure GreptimeDB as remote write target:

```
[OUTPUT]
    Name                 prometheus_remote_write
    Match                internal_metrics
    Host                 127.0.0.1
    Port                 4000
    Uri                  /v1/prometheus/write?db=<dbname>
    Tls                  Off
    http_user            <username>
    http_passwd          <password>
```

- `Uri`: The endpoint to send metrics to.
- `http_user` and `http_passwd`: The [authentication credentials](/user-guide/deployments-administration/authentication/static.md) for GreptimeDB.

In params Uri,

- `db` is the database name you want to write metrics to.

For details on the data model transformation from Prometheus to GreptimeDB, refer to the [Data Model](/user-guide/ingest-data/for-observability/prometheus.md#data-model) section in the Prometheus Remote Write guide.