# InfluxDB Line

## Insert

GreptimeDB supports HTTP InfluxDB Line protocol. You can write data via `/influxdb/write` API:

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'system_metrics,host=host1,idc=idc_a cpu_util=11.8,memory_util=10.3,disk_util=10.3 1667446797450
 system_metrics,host=host2,idc=idc_a cpu_util=80.1,memory_util=70.3,disk_util=90.0 1667446797450
 system_metrics,host=host1,idc=idc_b cpu_util=50.0,memory_util=66.7,disk_util=40.6 1667446797450'
```

The `/influxdb/write` supports query params including:

* `db` specify which db to write, `public` by default.
* `precision`, precision of timestamps in the line protocol. Accepts `ns` (nanoseconds), `us`(microseconds), `ms` (milliseconds) and `s` (seconds), nanoseconds by default.

<!-- TODO -->
<!-- ## Delete -->