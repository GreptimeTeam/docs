# InfluxDB Line Protocol

GreptimeDB supports HTTP InfluxDB Line protocol.

## Data model

To understand the differences between the data models of InfluxDB and GreptimeDB, please refer to the [data model in differences](../migrate-to-greptimedb/migrate-from-influxdb.md#data-model-in-difference) section in the Migrate from InfluxDB to GreptimeDB document.

## Write data

You can write data to GreptimeDB using the `/influxdb/write` API.
Here's an example of how to use this API:

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

The `/influxdb/write` supports query params including:

* `db`: Specifies the database to write to. The default value is `public`.
* `precision`: Defines the precision of the timestamp provided in the request body.  Accepted values are `ns` (nanoseconds), `us` (microseconds), `ms` (milliseconds), and `s` (seconds). The data type of timestamps written by this API is `TimestampNanosecond`, so the default precision is `ns` (nanoseconds). If you use timestamps with other precisions in the request body, you need to specify the precision using this parameter. This parameter ensures that timestamp values are accurately interpreted and stored with nanosecond precision.

You can also omit the timestamp when sending requests. GreptimeDB will use the current system time (in UTC) of the host machine as the timestamp. For example:

```shell
curl -i -XPOST "http://localhost:4000/v1/influxdb/write?db=public&precision=ms" \
--data-binary \
'monitor,host=127.0.0.1 cpu=0.1,memory=0.4
 monitor,host=127.0.0.2 cpu=0.2,memory=0.3
 monitor,host=127.0.0.1 cpu=0.5,memory=0.2'
```

## Reference

[InfluxDB Line protocol](https://docs.influxdata.com/influxdb/v2.7/reference/syntax/line-protocol/)
