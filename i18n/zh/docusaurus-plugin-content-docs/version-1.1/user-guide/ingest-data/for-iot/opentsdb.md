---
keywords: [OpenTSDB, HTTP API, 数据写入, 示例代码, 注意事项]
description: 介绍如何使用 OpenTSDB 协议通过 HTTP API 将数据写入 GreptimeDB，包括示例代码和注意事项。
---

# OpenTSDB

GreptimeDB 支持通过 HTTP API 使用 OpenTSDB 协议。

## 写入新数据

### HTTP API

GreptimeDB 还支持通过 HTTP 接口插入 OpenTSDB 数据，接口是 `/opentsdb/api/put`，使用的请求和响应格式与 OpenTSDB 的 `/api/put` 接口相同。

GreptimeDB 的 HTTP Server 默认监听 `4000` 端口。例如使用 curl 写入一个指标数据：

```shell
curl -X POST http://127.0.0.1:4000/v1/opentsdb/api/put \
    -H 'Authorization: Basic {{authentication}}' \
    -d '
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

插入多个指标数据：

```shell
curl -X POST http://127.0.0.1:4000/v1/opentsdb/api/put \
    -H 'Authorization: Basic {{authentication}}' \
    -d '
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
