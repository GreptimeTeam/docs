---
keywords: [Fluent bit, Prometheus Remote Write, OpenTelemetry, data pipeline]
description: Instructions on integrating GreptimeDB with Fluent bit for Prometheus Remote Write and OpenTelemetry.
---

# Fluent Bit

[Fluent Bit](http://fluentbit.io/) is a fast and lightweight telemetry agent for logs, metrics, and traces for Linux, macOS, Windows, and BSD family operating systems. Fluent Bit has been made with a strong focus on performance to allow the collection and processing of telemetry data from different sources without complexity.

You can integrate GreptimeDB as a OUTPUT for Fluent Bit.

## Http

Using Fluent Bit's [HTTP Output Plugin](https://docs.fluentbit.io/manual/pipeline/outputs/http), you can send logs to GreptimeDB.

```conf
[OUTPUT]
    Name http
    Match *
    Host greptimedb
    Port 4000
    Uri /v1/events/logs?db=public&table=your_table&pipeline_name=pipeline_if_any
    Format json
    Json_date_key scrape_timestamp
    Json_date_format iso8601
    Header Authorization "Bearer <token> if any"
```

- `host`: GreptimeDB host address, e.g., `localhost`.
- `port`: GreptimeDB port, default is `4000`.
- `uri`: The endpoint to send logs to.
- `format`: The format of the logs, needs to be `json`.
- `json_date_key`: The key in the JSON object that contains the timestamp.
- `json_date_format`: The format of the timestamp.
- `header`: The header to send with the request, e.g., `Authorization` for authentication.

In this example, the [Logs Http API](./write-logs.md#http-api) interface is used. For more information, refer to the [Write Logs](./write-logs.md) guide.

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
```

- `Metrics_uri`, `Logs_uri`, and `Traces_uri`: The endpoint to send metrics, logs, and traces to.

In this example, the [OpenTelemetry OTLP/HTTP API](./opentelemetry.md#opentelemetry-collectors) interface is used. For more information, refer to the [OpenTelemetry](./opentelemetry.md) guide.

## Prometheus Remote Write

Configure GreptimeDB as remote write target:

```
[OUTPUT]
    Name                 prometheus_remote_write
    Match                internal_metrics
    Host                 127.0.0.1
    Port                 4000
    Uri                  /v1/prometheus/write?db=public
    Tls                  Off
    http_user            <username>
    http_passwd          <password>
```

- `Uri`: The endpoint to send metrics to.
- `http_user` and `http_passwd`: The [authentication credentials](/user-guide/deployments/authentication/static.md) for GreptimeDB.

For details on the data model transformation from Prometheus to GreptimeDB, refer to the [Data Model](./prometheus.md#data-model) section in the Prometheus Remote Write guide.