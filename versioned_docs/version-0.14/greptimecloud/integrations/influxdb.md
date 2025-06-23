---
keywords: [InfluxDB, Telegraf, line protocol, data ingestion, API]
description: Instructions on using InfluxDB line protocol and Telegraf to ingest data into GreptimeCloud.
---

# InfluxDB and Telegraf

GreptimeCloud provides [Influxdb line
protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/)
ingestion API over http. The API and authentication is compatible with [InfluxDB
write protocol
1.x](https://docs.influxdata.com/influxdb/v1.8/guides/write_data/#write-data-using-the-influxdb-api).
Please refer to [InfluxDB line protocol](https://docs.greptime.com/user-guide/ingest-data/for-iot/influxdb-line-protocol) of GreptimeDB for more information.

- URL: `https://<host>/v1/influxdb/write?db=<dbname>`
- Username: `<username>`
- Password: `<password>`

## Telegraf

To use Telegraf to ingest data, add following configuration.

```
[[outputs.influxdb_v2]]
  urls = ["https://<host>/v1/influxdb"]
  token = "<username>:<password>"
  bucket = "<dbname>"
  ## Leave empty
  organization = ""
```

## InfluxDB Client Library

The following Java example code demonstrates how to configure the [InfluxDB
client](https://github.com/influxdata/influxdb-java) when connecting to
GreptimeCloud:

```java
final String serverURL = "https://<host>/v1/influxdb/", username = "<username>", password = "<password>";
final InfluxDB influxDB = InfluxDBFactory.connect(serverURL, username, password);
influxDB.setDatabase("<dbname>");
```
