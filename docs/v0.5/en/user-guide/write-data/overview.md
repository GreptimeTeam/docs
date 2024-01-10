# Overview

To write data to GreptimeDB, you'll need to establish a [connection](../clients/overview.md) first.

## Insert data

### Automatic schema generation

GreptimeDB provides schemaless writing that automatically creates schemas for your data, so that you don't need to create tables in advance. The table and columns will be created and added automatically when writing data with protocol gRPC supported by [SDKs](/user-guide/client-libraries/overview.md), [InfluxDB](./influxdb-line.md), [OpenTSDB](./opentsdb.md) and [Prometheus remote write](prometheus.md). When necessary, GreptimeDB automatically adds the required columns to ensure that the user's data is correctly saved.

## Update data

Updates can be effectively performed by insertions.
If the tags and time index have identical column values, the old data will be replaced with the new one.
Tags with a time index in GreptimeDB are similar to series in other TSDBs.

:::tip NOTE
The performance of updates is the same as insertion, but excessive updates may negatively impact query performance.
:::

For more information about column types, please refer to [Data Model](../concepts/data-model.md).

## Delete data

You can effectively delete data by specifying tags and time index.
Deleting data without specifying the tag and time index columns is not efficient, as it requires two steps: querying the data and then deleting it by tag and time index.

:::tip NOTE
Excessive deletions can negatively impact query performance.
:::

For more information about column types, please refer to [Data Model](../concepts/data-model.md).

## Clients

### Protocols

- [Prometheus Storage](./prometheus.md)
- [SQL](./sql.md)
- [InfluxDB line](./influxdb-line.md)
- [OpenTSDB](./opentsdb.md)

### SDK Libraries

Client libraries provide a convenient way to connect to GreptimeDB and interact with data.
They offer functionality for writing and querying data,
making it easier to integrate GreptimeDB into your applications.
For more information, please refer to the [Client Libraries](/user-guide/client-libraries/overview.md) documentation.
