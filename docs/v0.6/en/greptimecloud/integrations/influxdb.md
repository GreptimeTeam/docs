# InfluxDB Line Protocol

GreptimeCloud provides [Influxdb line
protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/)
ingestion API over http. The API and authentication is compatible with [InfluxDB
write protocol
1.x](https://docs.influxdata.com/influxdb/v1.8/guides/write_data/#write-data-using-the-influxdb-api).
Please refer to [InfluxDB client](https://docs.greptime.com/user-guide/clients/influxdb-line) of GreptimeDB for more information.

- URL: `https://<host>/v1/influxdb/write?db=<dbname>`
- Username: `<username>`
- Password: `<password>`

For example, the following example writes a data point to the `system_metrics` table:

```sh
curl -i 'https://<host>/v1/influxdb/write?db=<dbname>&u=<username>&p=<password>' \
--data-binary 'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450000000'
```
