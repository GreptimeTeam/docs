# InfluxDB Line Protocol

## 写入新数据

GreptimeDB 支持 HTTP InfluxDB Line 协议。您可以通过 `/influxdb/write` API 写入数据：

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

`/influxdb/write` 支持查询参数，包括：

* `db` 指定要写入的数据库，默认为 `public`。
* `precision`，时间戳的精度。接受 `ns`（纳秒）、`us`（微秒）、`ms`（毫秒）和 `s`（秒），默认为纳秒。

你还可以在发送请求时省略 timestamp，GreptimeDB 将使用主机机器的当前系统时间（UTC 时间）作为 timestamp。例如：

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2'
```

## 参考

[InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)

<!-- TODO -->
<!-- ## Delete -->