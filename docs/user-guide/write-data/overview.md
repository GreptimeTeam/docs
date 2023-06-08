# Overview

Learn how to write data to GreptimeDB. [Connection](./clients.md#connect) is needed before the following operations.

## Automatic Schema Generation
GreptimeDB provides schemaless writing that automatically creates schemas for your data, so that you don't need to create tables in advance. The table and columns will be created and added automatically when writing data with protocol [gRPC](#grpc), [InfluxDB](#influxdb-line-protocol), [OpenTSDB](#opentsdb-line-protocol) and [Prometheus remote write](#prometheus). When necessary, GreptimeDB automatically adds the required columns to ensure that the user's data is correctly saved.

<!-- ### Prometheus

See [Prometheus Storage](./prometheus.md#storage) to know how to write data. -->
