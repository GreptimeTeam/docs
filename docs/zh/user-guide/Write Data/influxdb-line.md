### InfluxDB Line Protocol

GreptimeDB 支持 HTTP InfluxDB Line 协议。你可以通过 `/influxdb/write` API 来写入数据：

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450
 system_metrics,host=host2,idc=idc_a cpu_util=80.1,memory_util=70.3,disk_util=90.0 1667446797450
 system_metrics,host=host1,idc=idc_b cpu_util=50.0,memory_util=66.7,disk_util=40.6 1667446797450'
```

`/influxdb/write` 支持的查询参数包括：

- `db` 指定要写入的数据库，默认为 `public`。
- `precision`，行协议中时间戳的精度。支持 `ns`（纳秒）、`us`（微秒）、`ms`（毫秒）和 `s`（秒），默认为纳秒。

## 参考
[InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)

<!-- TODO -->
<!-- ## Delete -->