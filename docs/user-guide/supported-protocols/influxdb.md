# InfluxDB

GreptimeDB supports Influxdb's line protocol. You can use http post to insert metrics into GreptimeDB.

Currently in GreptimeDB, InfluxDB line protocol is handled only in [Frontend][1]. So you also have to start [Frontend][1].

[1]: ../../developer-guide/frontend/overview.md

## HTTP

GreptimeDB supports inserting InfluxDB metrics via HTTP endpoints. We use the request format described in [InfluxDB line protocol][2].

[2]: https://docs.influxdata.com/influxdb/v1.8/write_protocols/line_protocol_tutorial/

The http endpoint in GreptimeDB for handling metrics is `/influxdb/write`

> Note: remember to prefix the path with GreptimeDB's http API version, `v1`

### A Simple Example

1\. Git clone the source.

```shell
git clone https://github.com/GreptimeTeam/greptimedb.git
cd greptimedb
```

2\. Start [Datanode][3].

[3]: ../../developer-guide/datanode/overview.md

```shell
cargo run -- datanode start
```

3\. Start `Frontend`, the HTTP server is listening on port `4000` by default.

```shell
cargo run -- frontend start
```

4\. Use `curl` to insert metrics.

```shell
curl -i -XPOST "127.0.0.1:4000/v1/influxdb/write?db=first_db" --data-binary 'monitor,host=host1 cpu=66.6,memory=1024 1663840496100023100
monitor,host=host2 cpu=66.7,memory=1025 1663840496200010300
monitor,host=host3 cpu=66.8,memory=1026 1663840496300003400
monitor,host=host4 cpu=66.9,memory=1027 1663840496400340000'
```

5\. We can always query the metrics with SQL:

```text
mysql> SELECT * FROM monitor;
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
