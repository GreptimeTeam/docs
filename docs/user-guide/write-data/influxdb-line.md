# InfluxDB Line

## Insert

GreptimeDB supports HTTP InfluxDB Line protocol. You can write data via `/influxdb/write` API:

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

The `/influxdb/write` supports query params including:

* `db` specify which db to write, `public` by default.
* `precision`, precision of timestamps in the line protocol. Accepts `ns` (nanoseconds), `us`(microseconds), `ms` (milliseconds) and `s` (seconds), nanoseconds by default.

## Reference
[InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)

<!-- TODO -->
<!-- ## Delete -->