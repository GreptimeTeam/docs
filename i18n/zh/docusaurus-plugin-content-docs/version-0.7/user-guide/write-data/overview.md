# 概述

在向 GreptimeDB 写入数据之前，你需要先与数据库[建立连接](../clients/overview.md).

## 插入数据

### 自动生成表结构

GreptimeDB 的自动生成表结构功能可以使你在写入数据之前无需提前创建表。当使用协议支持 gRPC 协议的 [SDK](/user-guide/client-libraries/overview.md)、[InfluxDB](./influxdb-line.md)、[OpenTSDB](./opentsdb.md) 和 [Prometheus](./prometheus.md) 写入数据时，表和列将会被自动创建。必要时，GreptimeDB 会自动添加所需的列，以确保用户的数据正确保存。

## 更新数据

可以通过插入数据来实现数据的更新。如果插入的数据和表中某行数据的标签列及时间索引列的值相同，旧数据将会被新数据替换。GreptimeDB 中的标签与时间索引相当于其他 TSDB 中的时间线的概念。

:::tip 注意
更新的性能与插入相同，但过多的更新可能会损害查询性能。
:::

关于列类型，请参考[数据模型](../concepts/data-model.md)。

## 删除数据

你可以通过标签及时间索引列有效地删除数据。使用其他查询条件（不包含标签和时间索引列）删除数据不是高效的操作，因为这种删除需要两个步骤：查询数据，然后通过再通过标签及时间索引删除它。

:::tip 注意
过多的删除操作可能会损害查询性能。
:::

关于列类型，请参考[数据模型](../concepts/data-model.md)。

## 客户端

## 协议或语言

- [SQL](./sql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)
- [Prometheus Storage](./prometheus.md)

## 客户端库

客户端库提供了一种方便的方式来连接 GreptimeDB 并与数据交互。
它们提供了写入和查询数据的功能，使得将 GreptimeDB 集成到你的应用程序中变得更加容易。
请参考[客户端库](/user-guide/client-libraries/overview.md)文档获取更多信息。
