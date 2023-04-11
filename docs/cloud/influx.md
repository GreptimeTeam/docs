# InfluxDB Line Protocol

GreptimeCloud provides [influxdb line
protocol](https://docs.influxdata.com/influxdb/cloud/reference/syntax/line-protocol/)
ingestion API over http. The API and authentication is compatible with [InfluxDB
write protocol
1.x](https://docs.influxdata.com/influxdb/v1.8/guides/write_data/#write-data-using-the-influxdb-api).

- URL: `https://<host>:4000/v1/influxdb/write?db=<dbname>`
- Username: `<username>`
- Password: Your GreptimeCloud service password

```sh
curl -i -XPOST 'https://<host>:4000/v1/influxdb/write?db=<dbname>&u=<username>&p=PASSWORD'
  --data-binary 'cpu_load_short,host=server01,region=us-west value=0.64 1434055562000000000'
```
