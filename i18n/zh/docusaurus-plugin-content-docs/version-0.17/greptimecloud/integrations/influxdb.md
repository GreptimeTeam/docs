---
keywords: [InfluxDB, Line Protocol, 数据库连接, Telegraf, Java 客户端]
description: 介绍如何使用 InfluxDB Line Protocol 连接到 GreptimeCloud，并提供了 Telegraf 和 Java 客户端的配置示例。
---

# InfluxDB Line Protocol

GreptimeCloud 提供了 [Influxdb line protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/) 的 http 接口。该接口和认证与 [InfluxDB write protocol 1.x](https://docs.influxdata.com/influxdb/v1.8/guides/write_data/#write-data-using-the-influxdb-api) 兼容。更多信息请参考 GreptimeDB 的 [InfluxDB 客户端](https://docs.greptime.cn/user-guide/protocols/influxdb-line-protocol)。

- URL: `https://<host>/v1/influxdb/write?db=<dbname>`
- Username: `<username>`
- Password: `<password>`

## Telegraf

使用 Telegraf 采集数据

```
[[outputs.influxdb_v2]]
  urls = ["https://<host>/v1/influxdb"]
  token = "<username>:<password>"
  bucket = "<dbname>"
  ## Leave empty
  organization = ""
```


下方的 Java 代码片段展示了如何通过配置 [InfluxDB 客户端](https://github.com/influxdata/influxdb-java)连接到 GreptimeCloud：

```java
final String serverURL = "https://<host>/v1/influxdb/", username = "<username>", password = "<password>";
final InfluxDB influxDB = InfluxDBFactory.connect(serverURL, username, password);
influxDB.setDatabase("<dbname>");
```
