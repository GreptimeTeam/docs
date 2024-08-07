# Overview

The data ingestion is a critical part of the IoT data pipeline.
It is the process of collecting data from various sources, such as sensors, devices, and applications, and storing it in a central location for further processing and analysis.
The data ingestion is essential for ensuring that the data is accurate, reliable, and secure.

GreptimeDB can handle large volumes of data, process it in real-time, and store it efficiently for future analysis.
It also supports various data formats, protocols, and interfaces,
making it easy to integrate with different IoT devices and systems. 

- [SQL INSERT](sql.md): A straightforward method for inserting data.
- [gRPC SDK](./grpc-sdks/overview.md): Offers efficient, high-performance data ingestion, particularly suited for real-time data applications and complex IoT infrastructures.
- [InfluxDB Line Protocol](influxdb-line-protocol.md): A widely-used protocol for time-series data, facilitating migration from InfluxDB to GreptimeDB. The Telegraf integration method is also introduced in this document.
- [EMQX](emqx.md): An MQTT broker supporting massive device connections, can ingest data to GreptimeDB directly.
- [OpenTSDB](opentsdb.md): Ingest data to GreptimeDB using the OpenTSDB protocol.

