# Overview

To write data to GreptimeDB, you'll need to establish a [connection](../clients/overview.md) first.

## Automatic Schema Generation

GreptimeDB provides schemaless writing that automatically creates schemas for your data, so that you don't need to create tables in advance. The table and columns will be created and added automatically when writing data with protocol [gRPC](./grpc.md), [InfluxDB](./influxdb-line.md), [OpenTSDB](./opentsdb.md) and [Prometheus remote write](../prometheus.md). When necessary, GreptimeDB automatically adds the required columns to ensure that the user's data is correctly saved.

## Clients

- [gRPC-Java](./grpc.md#java)
- [gRPC-Go](./grpc.md#go)
- [Prometheus Storage](./prometheus.md)
- [SQL](./sql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
