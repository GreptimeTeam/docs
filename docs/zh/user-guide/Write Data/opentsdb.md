# OpenTSDB

GreptimeDB 支持通过 Telnet 或 HTTP API 写入 OpenTSDB。

## Telnet

GreptimeDB 完全支持 OpenTSDB 的 "put" 命令格式：

`put <metric> <timestamp> <value> <tagk1=tagv1[tagk2=tagv2...tagkN=tagvN]>`

可以通过 `put` 来输入指标：

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

GreptimeDB 将每个指标作为一个独立的表，并对其列进行标记。`greptime_timestamp` 和 `greptime_value` 是两个保留列，对应于时间戳和值。

GreptimeDB 会在放置指标后自动创建指标表，所以不需要
手动创建表。

> 注意只有 "put" 命令被支持，其他命令如 "histogram"或 "stats"
> 不被支持。

### HTTP API

GreptimeDB 也支持通过 HTTP 接口写入 OpenTSDB 指标。我们使用 OpenTSDB 的 `/api/put` 中描述的请求和
响应格式。

GreptimeDB 中处理指标的 HTTP 接口是 `/opentsdb/api/put`。

> 注意：记得在路径前加上 GreptimeDB 的 http API 版本，`v1`。

启动 GreptimeDB，HTTP 服务器默认监听端口为 `4000`。

使用 curl 插入一个指标点：

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

或者插入多个指标点：

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