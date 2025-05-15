---
keywords: [OpenTSDB, HTTP API, metrics, data ingestion, insert data, multiple metric points]
description: Instructions on ingesting OpenTSDB metrics into GreptimeDB via HTTP API, including examples of inserting single and multiple metric points.
---

# OpenTSDB

GreptimeDB supports ingesting OpenTSDB via HTTP API.

GreptimeDB also supports inserting OpenTSDB metrics via HTTP endpoints. We use the request and
response format described in OpenTSDB's `/api/put`.

The HTTP endpoint in GreptimeDB for handling metrics is `/opentsdb/api/put`

> Note: remember to prefix the path with GreptimeDB's http API version, `v1`.

Starting GreptimeDB, the HTTP server is listening on port `4000` by default.

Use curl to insert one metric point:

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

Or insert multiple metric points:

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

