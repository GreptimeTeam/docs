# InfluxDB Line Protocol

GreptimeDB 支持 HTTP InfluxDB Line 协议。

## 写入新数据

你可以通过 `/influxdb/write` API 写入数据。
以下是一个示例：

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

`/influxdb/write` 支持查询参数，包括：

* `db`：指定要写入的数据库。默认值为 `public`。
* `precision`：定义请求体中提供的时间戳的精度，可接受的值为 `ns`（纳秒）、`us`（微秒）、`ms`（毫秒）和 `s`（秒），默认值为 `ns`（纳秒）。该 API 写入的时间戳类型为 `TimestampNanosecond`，因此默认精度为 `ns`（纳秒）。如果你在请求体中使用了其他精度的的时间戳，需要使用此参数指定精度。该参数确保时间戳能够被准确解释并以纳秒精度存储。

你还可以在发送请求时省略 timestamp，GreptimeDB 将使用主机机器的当前系统时间（UTC 时间）作为 timestamp。例如：

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2'
```

## 数据模型

要了解 InfluxDB 和 GreptimeDB 的数据模型之间的差异，请参考从 Influxdb 迁移到 GreptimeDB 文档中的[数据模型差异](../migrate-to-greptimedb/migrate-from-influxdb.md#数据模型的区别)。

## 参考

[InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)

