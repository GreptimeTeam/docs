# Overview

## Automatic Schema Generation

GreptimeDB supports schemaless writing, automatically creating tables and adding necessary columns as data is ingested.
This capability ensures that you do not need to manually define schemas beforehand, making it easier to manage and integrate diverse data sources seamlessly.
<!-- TODO: add links to protocols and integrations -->
This feature is supported for all protocols and integrations, except [SQL](./for-iot/sql.md).

## Recommended Data Ingestion Methods

GreptimeDB supports various data ingestion methods for specific scenarios, ensuring optimal performance and integration flexibility.

### Observability Scenarios

- [Prometheus Remote Write](./for-observerbility/prometheus.md): Integrate GreptimeDB as remote storage for Prometheus, suitable for real-time monitoring and alerting.
- [Vector](./for-observerbility/vector.md): Use GreptimeDB as a sink for Vector, ideal for complex data pipelines and diverse data sources.
- [OpenTelemetry](./for-observerbility/opentelemetry.md): Collect and export telemetry data to GreptimeDB for detailed observability insights.

### IoT Scenarios

- [SQL INSERT](./for-iot/sql.md): A straightforward method for inserting data.
- [gRPC-SDK](./for-iot/grpc-sdks/overview.md): Offers efficient, high-performance data ingestion, particularly suited for real-time data applications and complex IoT infrastructures.
- [InfluxDB Line Protocol](./for-iot/influxdb-line-protocol.md): A widely-used protocol for time-series data, facilitating migration from InfluxDB to GreptimeDB.
- [EMQX](./for-iot/emqx.md): An MQTT broker supporting massive device connections, can be used to ingest data to GreptimeDB.
- [OpenTSDB](./for-iot/opentsdb.md): Ingest data to GreptimeDB using the OpenTSDB protocol.

