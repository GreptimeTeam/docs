# InfluxDB

GreptimeDB supports Influxdb line protocol. You can use HTTP Post to insert metrics into GreptimeDB.

In GreptimeDB, InfluxDB line protocol is handled only in [Frontend][1], so you have to start [Frontend][1].

[1]: ../../developer-guide/frontend/overview.md

## HTTP

GreptimeDB supports inserting InfluxDB metrics via HTTP endpoints. We use the request format described in [InfluxDB line protocol][2].

[2]: https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/

The HTTP endpoint in GreptimeDB for handling metrics is `/influxdb/write`

> Note that remembers to prefix the path with GreptimeDB's HTTP API version, `v1`

## Create a databse

```sql
CREATE DATABASE influxdb;
```

## Insert data

Use `curl` to insert metrics:

```shell
curl -i -XPOST "127.0.0.1:4000/v1/influxdb/write?db=influxdb" --data-binary 'monitor,host=host1 cpu=66.6,memory=1024 1663840496100023100
monitor,host=host2 cpu=66.7,memory=1025 1663840496200010300
monitor,host=host3 cpu=66.8,memory=1026 1663840496300003400
monitor,host=host4 cpu=66.9,memory=1027 1663840496400340000'
```

We can always query the metrics with SQL:

```text
mysql> SELECT * FROM influxdb.monitor;
+-------+------+--------+---------------------+
| host  | cpu  | memory | ts                  |
+-------+------+--------+---------------------+
| host1 | 66.6 |   1024 | 2022-09-22 09:54:56 |
| host2 | 66.7 |   1025 | 2022-09-22 09:54:56 |
| host3 | 66.8 |   1026 | 2022-09-22 09:54:56 |
| host4 | 66.9 |   1027 | 2022-09-22 09:54:56 |
+-------+------+--------+---------------------+
4 rows in set (0.02 sec)
```

The `/influxdb/write` supports query params including:
* `db` specify which db to write, `public` by default.
* `precision`, precision of timestamps in the line protocol, Accepts `ns` (nanoseconds), `us`(microseconds), `ms` (milliseconds) and `s` (seconds), nanoseconds by default.

For more information about the line protocol, please refer to the [InfluxDB line protocol tutorial](https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/).
