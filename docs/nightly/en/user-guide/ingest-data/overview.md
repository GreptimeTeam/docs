# Overview

To write data to GreptimeDB, you'll need to establish a [connection](../clients/overview.md) first.

## Automatic schema generation

GreptimeDB provides schemaless writing that automatically creates schemas for your data, so that you don't need to create tables in advance. The table and columns will be created and added automatically when writing data with protocol gRPC supported by [SDKs](/user-guide/client-libraries/overview.md), [InfluxDB](./influxdb-line.md), [OpenTSDB](./opentsdb.md) and [Prometheus remote write](prometheus.md). When necessary, GreptimeDB automatically adds the required columns to ensure that the user's data is correctly saved.

## Recommended data ingestion methods

### For Observability scenarios

- [Prometheus Remote Write](./for-observerbility/prometheus.md)
- [Vector](./for-observerbility/vector.md)
- [OpenTelemetry](./for-observerbility/opentelemetry.md)

### For IoT scenarios

- [SQL INSERT](./for-iot/sql.md)
- [gRPC](./for-iot/grpc/overview.md)
- [InfluxDB Line Protocol](./for-iot/influxdb-line-protocol.md)
- [EMQX](./for-iot/emqx.md)
- [OpenTSDB](./for-iot/opentsdb.md)



<!-- ### Client libraries

Client libraries provide a convenient way to connect to GreptimeDB and interact with data.
They offer functionality for writing and querying data,
making it easier to integrate GreptimeDB into your applications.
For more information, please refer to the [Client Libraries](/user-guide/client-libraries/overview.md) documentation. -->
