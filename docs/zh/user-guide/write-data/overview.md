# 概述

在向 GreptimeDB 写入数据之前，你需要先与数据库[建立连接](../clients/overview.md).

## 自动生成表结构

GreptimeDB 的自动生成表结构功能可以使你在写入数据之前无需提前创建表。当使用协议 [gRPC](./grpc.md)、[InfluxDB](./influxdb-line.md)、[OpenTSDB](./opentsdb.md) 和 [Prometheus](./prometheus.md) 写入数据时，表和列将会被自动创建。必要时，GreptimeDB 会自动添加所需的列，以确保用户的数据正确保存。

## 客户端协议

- [gRPC-Java](./grpc.md#java)
- [gRPC-Go](./grpc.md#go)
- [SQL](./sql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
- [Prometheus Storage](./prometheus.md)

