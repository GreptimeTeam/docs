# InfluxDB Line Protocol

GreptimeCloud provides [Influxdb line
protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/)
ingestion API over http. The API and authentication is compatible with [InfluxDB
write protocol
1.x](https://docs.influxdata.com/influxdb/v1.8/guides/write_data/#write-data-using-the-influxdb-api).
Please refer to [InfluxDB client](https://docs.greptime.com/v0.7/user-guide/clients/influxdb-line) of GreptimeDB for more information.

- URL: `https://<host>/v1/influxdb/write?db=<dbname>`
- Username: `<username>`
- Password: `<password>`

The following Java example code demonstrates how to configure the [InfluxDB client](https://github.com/influxdata/influxdb-java) when connecting to GreptimeCloud:

```java
final String serverURL = "https://<host>/v1/influxdb/", username = "<username>", password = "<password>";
final InfluxDB influxDB = InfluxDBFactory.connect(serverURL, username, password);
influxDB.setDatabase("<dbname>");
```
