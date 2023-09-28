# OpenTSDB

GreptimeDB supports ingesting OpenTSDB via Telnet or HTTP API.

## Insert

### Telnet

GreptimeDB fully supports OpenTSDB's "put" command format:

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

GreptimeDB treats each metric as an individual table, and makes tags its columns.
`greptime_timestamp` and `greptime_value` are two reserved columns, corresponding to timestamp and
value in put command.

GreptimeDB will automatically creates the metrics table after you put the metrics so you don't need
to create the metrics table manually.

> Note that only "put" command is supported, other commands such as "histogram" or "stats"
> are not supported.

### HTTP API

GreptimeDB also supports inserting OpenTSDB metrics via HTTP endpoints. We use the request and
response format described in OpenTSDB's `/api/put`.

The HTTP endpoint in GreptimeDB for handling metrics is `/opentsdb/api/put`

> Note: remember to prefix the path with GreptimeDB's http API version, `v1`.

Starting GreptimeDB, the HTTP server is listening on port `4000` by default.

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

<!-- TODO -->
<!-- ## Delete -->