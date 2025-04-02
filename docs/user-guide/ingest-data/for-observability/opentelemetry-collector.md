---
keywords: [OpenTelemetry Collector, OpenTelemetry, traces, data pipeline]
description: Introduction to using OpenTelemetry Collector to write traces data to GreptimeDB.
---

# OpenTelemetry Collector

## Overview

[OpenTelemetry Collector](https://opentelemetry.io/docs/collector/) is a vendor-neutral service for collecting and processing OpenTelemetry data. In this article, we will introduce how to use OpenTelemetry Collector to write traces data to GreptimeDB.

## Quick Start

### Start OpenTelemetry Collector

You can use the following command to quickly start an OpenTelemetry Collector instance, which will listen on ports `4317` (gRPC) and `4318` (HTTP):

```
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
      x-greptime-log-pipeline-name: "greptime_trace_v1"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlphttp]
```

Before starting the OpenTelemetry Collector, please ensure that GreptimeDB is running.

### Write traces data to OpenTelemetry Collector

You can configure the corresponding exporter to write traces data to the OpenTelemetry Collector. For example, you can use the environment variable `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` to configure the endpoint of the exporter:

```
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="http://localhost:4318/v1/otlp"
```

For convenience, you can use the tool [`telemetrygen`](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/telemetrygen) to quickly generate traces data and write it to the OpenTelemetry Collector. For more details, please refer to the [OpenTelemetry Collector official documentation](https://opentelemetry.io/docs/collector/quick-start/).

You can use the following command to install `telemetrygen` (please ensure you have installed Go):

```
go install github.com/open-telemetry/opentelemetry-collector-contrib/cmd/telemetrygen@latest
```

Then you can use the following command to generate traces data and write it to the OpenTelemetry Collector:

```
telemetrygen traces --otlp-insecure --traces 3
```

The above command will generate 3 traces data and write it to the OpenTelemetry Collector via gRPC protocol.

### Query traces data in GreptimeDB

GreptimeDB will write traces data to the `opentelemetry_traces` table in the `public` database by default. You can execute the following SQL statement in GreptimeDB to query traces data:

```
SELECT * FROM public.opentelemetry_traces \G;
```

You also can use the [Jaeger](https://www.jaegertracing.io/) query interface to query traces data. Please refer to the [Jaeger](../../query-data/jaeger.md) documentation for more details.
