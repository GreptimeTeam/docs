# InfluxDB Line Protocol

GreptimeCloud 提供了 [Influxdb line protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/) 的 http 接口。该接口和认证与 [InfluxDB write protocol 1.x](https://docs.influxdata.com/influxdb/v1.8/guides/write_data/#write-data-using-the-influxdb-api) 兼容。更多信息请参考 GreptimeDB 的 [InfluxDB 客户端](https://docs.greptime.cn/v0.3/user-guide/clients/influxdb-line)。

- URL: `https://<host>/v1/influxdb/write?db=<dbname>`
- Username: `<username>`
- Password: `<password>`

```sh
curl -i 'https://<host>/v1/influxdb/write?db=<dbname>&u=<username>&p=PASSWORD' \
--data-binary 'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450000000'
```
