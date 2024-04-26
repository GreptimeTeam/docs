# OpenTSDB

GreptimeDB支持通过 Telnet 或 HTTP API 使用 OpenTSDB 协议。

## 写入新数据

### Telnet

`GreptimeDB` 完全支持 `OpenTSDB` 的 `put` 命令格式：

`put <metric> <timestamp> <value> <tagk1=tagv1[tagk2=tagv2...tagkN=tagvN]>`

你可以使用 `put` 来写入新数据：

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

GreptimeDB将每个指标视为单独的表，并将标签作为其列。`greptime_timestamp` 和 `greptime_value` 是两个保留列，对应于 `put` 命令中的时间戳和值。

GreptimeDB 将在您放置指标后自动创建指标表，因此您无需手动创建指标表。

:::tip 注意
只支持 `put` 命令，其他命令如 `histogram` 或 `stats` 不被支持。
:::

### HTTP API

GreptimeDB 还支持通过 HTTP 接口插入 OpenTSDB 数据，接口是 `/opentsdb/api/put`，使用的请求和响应格式与 OpenTSDB 的 `/api/put` 接口相同。

GreptimeDB 的 HTTP Server 默认监听 `4000` 端口。例如使用 curl 写入一个指标数据：

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

插入多个指标数据:

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

:::tip 注意
记得在路径前加上 GreptimeDB 的 HTTP API 版本 `v1`。
:::

<!-- TODO -->
<!-- ## Delete -->