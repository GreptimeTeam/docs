# OpenTSDB

## Introduction

GreptimeDB supports OpenTSDB's line protocol. You can use `Telnet` or `HTTP POST` to insert metrics
into GreptimeDB.

> GreptimeDB does not support OpenTSDB's reading data API, you can use other protocols like SQL to
> query metrics.

In GreptimeDB, OpenTSDB line protocol is handled only in [Frontend][1], so you have to
start [Frontend][1] first.

[1]: <../Developer_Guide/frontend/index.md>

## Telnet

The `Frontend` is listening on port `4242` by default to receive metrics via `telnet`. You can open
your favorite terminal and type `telnet 127.0.0.1 4242` to connect to GreptimeDB.

GreptimeDB fully supports Opentsdb's "put" command format:

`put <metric> <timestamp> <value> <tagk1=tagv1[tagk2=tagv2...tagkN=tagvN]>`

You can use `put`  to insert metrics:

```shell
~ % telnet 127.0.0.1 4242
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
put sys.cpu.system 1667892080 3 host=web01 dc=hz
put sys.cpu.system 1667892080 2 host=web02 dc=hz
put sys.cpu.system 1667892080 2 host=web03 dc=hz
put sys.cpu.system 1667892081 1 host=web01
put sys.cpu.system 1667892081 4 host=web04 dc=sh
put sys.cpu.system 1667892082 10 host=web10 dc=sh
quit
Connection closed by foreign host.
~ %
```

Now you can use other protocols like SQL to query metrics:

```text
mysql> select * from 'sys.cpu.system' order by greptime_timestamp;
+---------------------+----------------+-------+------+
| greptime_timestamp  | greptime_value | host  | dc   |
+---------------------+----------------+-------+------+
| 2022-11-08 07:21:20 |              3 | web01 | hz   |
| 2022-11-08 07:21:20 |              2 | web02 | hz   |
| 2022-11-08 07:21:20 |              2 | web03 | hz   |
| 2022-11-08 07:21:21 |              1 | web01 | NULL |
| 2022-11-08 07:21:21 |              4 | web04 | sh   |
| 2022-11-08 07:21:22 |             10 | web10 | sh   |
+---------------------+----------------+-------+------+
6 rows in set (0.01 sec)
```

GreptimeDB treats each metric as an individual table, and makes tags its columns.
`greptime_timestamp` and `greptime_value` are two reserved columns, corresponding to timestamp and
value in put command.

GreptimeDB will automatically creates the metrics table after you put the metrics so you don't need
to create the metrics table manually.

> Note that only "put" command is supported, other commands such as "histogram" or "stats"
> are not supported.

## HTTP

GreptimeDB also supports inserting OpenTSDB metrics via HTTP endpoints. We use the request and
response format described in OpenTSDB's `/api/put`.

The HTTP endpoint in GreptimeDB for handling metrics is `/opentsdb/api/put`

> Note: remember to prefix the path with GreptimeDB's http API version, `v1`.

Starting `Frontend`, the HTTP server is listening on port `4000` by default.

Use curl to insert one metric point:

```shell
curl -X POST http://127.0.0.1:4000/v1/opentsdb/api/put -d '
{
    "metric": "sys.cpu.nice",
    "timestamp": 1667898896,
    "value": 18,
    "tags": {
       "host": "web01",
       "dc": "hz"
    }
}
'
```

Or insert multiple metric points:

```shell
curl -X POST http://127.0.0.1:4000/v1/opentsdb/api/put -d '
[
    {
        "metric": "sys.cpu.nice",
        "timestamp": 1667898896,
        "value": 1,
        "tags": {
           "host": "web02",
           "dc": "hz"
        }
    },
    {
        "metric": "sys.cpu.nice",
        "timestamp": 1667898897,
        "value": 9,
        "tags": {
           "host": "web03",
           "dc": "sh"
        }
    }
]
'
```

You can always query the metrics with SQL:

```text
mysql> select * from 'sys.cpu.nice' order by greptime_timestamp;
+---------------------+----------------+------+-------+
| greptime_timestamp  | greptime_value | dc   | host  |
+---------------------+----------------+------+-------+
| 2022-11-08 09:14:56 |             18 | hz   | web01 |
| 2022-11-08 09:14:56 |              1 | hz   | web02 |
| 2022-11-08 09:14:57 |              9 | sh   | web03 |
+---------------------+----------------+------+-------+
3 rows in set (0.00 sec)
```
