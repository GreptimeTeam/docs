# 概述

想要向 GreptimeDB 写入数据，需要先[进行连接](../clients.md#connect)。

## Automatic Schema Generation

GreptimeDB 提供了 schemaless 的写入方式，自动生成表结构，这样你就不需要提前创建表。当使用 [gRPC](./grpc.md)、[InfluxDB](#influxdb-line-protocol)、[OpenTSDB](#opentsdb-line-protocol) 和 [Prometheus remote write](#prometheus) 协议写入数据时，表和列将被自动创建和添加。必要时，GreptimeDB 会自动添加所需的列，以确保正确保存用户的数据。

## Clients

- [gRPC-Java](./grpc.md#java)
- [gRPC-Go](./grpc.md#go)
- [SQL](./sql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
- [Prometheus Storage](../prometheus.md#storage)