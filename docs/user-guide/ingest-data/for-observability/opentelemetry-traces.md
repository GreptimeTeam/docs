---
keywords: [OpenTelemetry Collector, OpenTelemetry, traces, data pipeline]
description: Introduction to using OpenTelemetry Collector to write traces data to GreptimeDB.
---

# OpenTelemetry Traces

## Overview

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) is a vendor-neutral service for collecting and processing OpenTelemetry data. In this article, we will introduce how to use OpenTelemetry Collector to write traces data to GreptimeDB.

## Quick Start

:::note
Before starting the OpenTelemetry Collector, please ensure that GreptimeDB is running.
:::

### Start OpenTelemetry Collector

You can use the following command to quickly start an OpenTelemetry Collector instance, which will listen on ports `4317` (gRPC) and `4318` (HTTP):

```shell
docker run --rm \
  --network host \
  -p 4317:4317 \
  -p 4318:4318 \
  -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml \
  otel/opentelemetry-collector-contrib:0.123.0
```

The content of the `config.yaml` file is as follows:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

exporters:
  otlphttp:
    endpoint: "http://localhost:4000/v1/otlp" # The OTLP endpoint of GreptimeDB
    headers:
      x-greptime-pipeline-name: "greptime_trace_v1"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

### Write traces data to OpenTelemetry Collector

You can configure the corresponding exporter to write traces data to the OpenTelemetry Collector. For example, you can use the environment variable `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` to configure the endpoint of the exporter:

```shell
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/otlp"
```

For convenience, you can use the tool [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) to quickly generate traces data and write it to the OpenTelemetry Collector. For more details, please refer to the [OpenTelemetry Collector official documentation](https://opentelemetry.io/docs/collector/quick-start/).

You can use the following command to install `telemetrygen` (please ensure you have installed Go):

```shell
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

Then you can use the following command to generate traces data and write it to the OpenTelemetry Collector:

```shell
telemetrygen traces --otlp-insecure --traces 3
```

The above command will generate 3 traces data and write it to the OpenTelemetry Collector via gRPC protocol.

### Query traces data in GreptimeDB

GreptimeDB will write traces data to the `opentelemetry_traces` table in the `public` database by default. You can execute the following SQL statement in GreptimeDB to query traces data:

```sql
SELECT * FROM public.opentelemetry_traces \G;
```

Then you can get the following result(only part of the result is shown here):

```
*************************** 1. row ***************************
                         timestamp: 2025-04-02 09:58:43.822229
                     timestamp_end: 2025-04-02 09:58:43.822352
                     duration_nano: 123000
                    parent_span_id: NULL
                          trace_id: 1948380e459f4ca69bb4f4274b5db7ba
                           span_id: f179c8dc2171a0a0
                         span_kind: SPAN_KIND_CLIENT
                         span_name: lets-go
                  span_status_code: STATUS_CODE_UNSET
               span_status_message:
                       trace_state:
                        scope_name: telemetrygen
                     scope_version:
                      service_name: telemetrygen
span_attributes.net.sock.peer.addr: 1.2.3.4
      span_attributes.peer.service: telemetrygen-server
                       span_events: []
                        span_links: []
...
```

You also can use the [Jaeger](https://www.jaegertracing.io/) query interface to query traces data. Please refer to the [Jaeger](/user-guide/query-data/jaeger.md) documentation for more details.
