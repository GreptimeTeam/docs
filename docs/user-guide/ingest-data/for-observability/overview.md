---
keywords: [observability, integration, Prometheus, Vector, OpenTelemetry, InfluxDB, Loki]
description: Overview of integrating GreptimeDB with observability tools like Prometheus, Vector, OpenTelemetry, InfluxDB, and Loki for real-time monitoring and analysis.
---

# Ingest Data for Observability

In observability scenarios,
the ability to monitor and analyze system performance in real-time is crucial.
GreptimeDB integrates seamlessly with leading observability tools to provide a comprehensive view of your system's health and performance metrics. 

- [Store and analyze trillions of logs in GreptimeDB and gain insights within minutes](/user-guide/logs/overview.md).
- [Prometheus Remote Write](prometheus.md): Integrate GreptimeDB as remote storage for Prometheus, suitable for real-time monitoring and alerting.
- [Vector](vector.md): Use GreptimeDB as a sink for Vector, ideal for complex data pipelines and diverse data sources.
- [OpenTelemetry](opentelemetry.md): Collect and export telemetry data to GreptimeDB for detailed observability insights.
- [InfluxDB Line Protocol](influxdb-line-protocol.md): A widely-used protocol for time-series data, facilitating migration from InfluxDB to GreptimeDB. The Telegraf integration method is also introduced in this document.
- [Loki](loki.md): A widely-used log write protocol, facilitating migration from Loki to GreptimeDB. The Alloy integration method is also introduced in this document.
