---
keywords: [Jaeger, traces, query, experimental, HTTP endpoint]
description: Documentation for how to query traces data in GreptimeDB using Jaeger.
---

# Jaeger (Experimental)

:::warning

The Jaeger query APIs are currently in the experimental stage and may be adjusted in future versions.

:::

GreptimeDB currently supports the following [Jaeger](https://www.jaegertracing.io/) query interfaces:

- `/api/services`: Get all services.
- `/api/operations?service={service}`: Get all operations for a service.
- `/api/services/{service}/operations`: Get all operations for a service.
- `/api/traces`: Get traces by query parameters.

You can use [Grafana's Jaeger plugin](https://grafana.com/docs/grafana/latest/datasources/jaeger/) or [Jaeger UI](https://github.com/jaegertracing/jaeger-ui) to query traces data in GreptimeDB.

Currently, GreptimeDB exposes the Jaeger HTTP APIs under the `/v1/jaeger` endpoint.

## Quick Start

We will use the Jaeger plugin in Grafana as an example to demonstrate how to query traces data in GreptimeDB. Before starting, please ensure that you have properly started GreptimeDB.

### Start an application to generate traces data and write it to GreptimeDB

You can refer to the [OpenTelemetry official documentation](https://opentelemetry.io/docs/languages/) to choose any programming language you are familiar with to generate traces data. You can also refer to the [Configure OpenTelemetry Collector](/user-guide/trace/read-write.md#opentelemetry-collector) document.

### Configure the Grafana Jaeger plugin

1. Open Grafana and add a Jaeger data source:

   ![Add Jaeger data source](/add-jaeger-data-source.jpg)

2. Fill in the Jaeger address according to your actual situation, then **Save and Test**. For example:

   ```
   http://localhost:4000/v1/jaeger
   ```

3. Use Grafana's Jaeger Explore to view the data:

   ![Jaeger Explore](/jaeger-explore.png)

### Add Time Range for Getting Operations Endpoints

By default, we don't add time range parameters for the `GET /api/operations` and `GET /api/services/{service}/operations` endpoints. When the volume of traces data is large, this may lead to long query times. You can add a time range parameter by setting the HTTP Header based on your specific scenario, for example:

```
x-greptime-jaeger-time-range-for-operations: 3 days
```

This indicates that only the Operations data from the past 3 days will be returned.

This header can be set in the **HTTP Headers** of the Jaeger Data Source, for example:

![Set HTTP Headers](/jaeger-http-header-for-time-range.jpg)
