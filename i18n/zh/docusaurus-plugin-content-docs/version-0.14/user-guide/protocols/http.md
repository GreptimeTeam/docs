---
keywords: [HTTP API, 数据库交互, 鉴权, 时区, 请求超时, 管理 Pipeline]
description: 介绍 GreptimeDB 提供的 HTTP API 用于与数据库进行交互。
---

# HTTP API

GreptimeDB 提供了 HTTP API 用于与数据库进行交互。如需查看完整的 API 端点列表，请查看 [HTTP Endpoints](/reference/http-endpoints.md)。

## Base URL

API Base URL 是 `http(s)://{{host}}:{{port}}/`。

- 对于在本地机器上运行的 GreptimeDB 实例，Base URL 是 `http://localhost:4000/`，默认端口配置为 `4000`。你可以在[配置文件](/user-guide/deployments/configuration.md#protocol-options)中更改服务的 host 和 port。
- 对于 GreptimeCloud，Base URL 是 `https://{{host}}/`。你可以在 GreptimeCloud 控制台的 "Connection Information" 中找到 host。

在以下内容中，我们使用 `http://{{API-host}}/` 作为 Base URL 来演示 API。

## 通用 Headers

### 鉴权

假设你已经正确设置了数据库[鉴权](/user-guide/deployments/authentication/overview.md)，
GreptimeDB 支持 HTTP API 中内置的 `Basic` 鉴权机制。要设置鉴权，请按照以下步骤操作：

1. 使用 `<username:password>` 格式和 `Base64` 算法对用户名和密码进行编码。
2. 将编码后的凭据附加到下列 HTTP 请求头之一中:
- `Authorization : Basic <base64-encoded-credentials>`
- `x-greptime-auth : Basic <base64-encoded-credentials>`

以下是一个示例。如果要使用用户名 `greptime_user` 和密码 `greptime_pwd` 连接到 GreptimeDB，请使用以下命令：

```shell
curl -X POST \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql
```

在此示例中，`Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` 表示 `greptime_user:greptime_pwd` 的 Base64 编码值。请确保用自己配置的用户名和密码替换它，并使用 Base64 进行编码。

:::tip 注意
InfluxDB 使用自己的鉴权格式，请参阅 [InfluxDB](./influxdb-line-protocol.md) 获取详细信息。
:::

### 请求超时设置

GreptimeDB 支持在 HTTP 请求中使用 `X-Greptime-Timeout` 请求头，用于指定数据库服务器中运行的请求超时时间。

例如，以下请求为查询设置了 `120s` 的超时时间：

```bash
curl -X POST \
-H 'Authorization: Basic {{authentication}}' \
-H 'X-Greptime-Timeout: 120s' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql
```

## Admin APIs

:::tip 注意
这些 API 在 GreptimeCloud 中无法使用。
:::

### 检查数据库健康状态

你可以使用 `/health` 端点检查 GreptimeDB 服务器的健康状况。
有关更多信息，请参阅[检查数据库健康状态](/getting-started/installation/overview#检查数据库健康状态)。

### 检查数据库状态

你可以使用 `/status` 端点检查 GreptimeDB 服务器的状态。

```shell
curl http://{{API-host}}/status
```

例如：

```shell
curl http://localhost:4000/status
```

输出包含数据库版本和源代码信息，类似如下：

```json
{
  "source_time": "2024-11-08T06:34:49Z",
  "commit": "0e0c4faf0d784f25fed8f26e7000f1f869c88587",
  "branch": "main",
  "rustc_version": "rustc 1.84.0-nightly (e92993dbb 2024-10-18)",
  "hostname": "local",
  "version": "0.9.5"
}
```

### 获取 GreptimeDB 服务器配置

你可以使用 `/config` 端点获取 GreptimeDB 服务器的 [TOML 配置](/user-guide/deployments/configuration.md#configuration-file-options)。

```shell
curl http://{{API-host}}/config
```

例如：

```shell
curl http://localhost:4000/config
```

输出包含 GreptimeDB 服务器的配置信息。

```toml
enable_telemetry = true
user_provider = "static_user_provider:file:user"
init_regions_in_background = false
init_regions_parallelism = 16

[http]
addr = "127.0.0.1:4000"
timeout = "30s"
body_limit = "64MiB"
is_strict_mode = false

# ...
```

## POST SQL 语句

要通过 HTTP API 向 GreptimeDB 服务器提交 SQL 语句，请使用以下格式：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authentication}}' \
  -H 'X-Greptime-Timeout: {{time precision}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql={{SQL-statement}}' \
http://{{API-host}}/v1/sql
```

### Headers

- [`Authorization`](#鉴权)
- [`X-Greptime-Timeout`](#请求超时设置)
- `Content-Type`: `application/x-www-form-urlencoded`.
- `X-Greptime-Timezone`: 当前 SQL 查询的时区。可选。请参阅[时区](#时区)。

### Query string parameters

- `db`: 数据库名称。可选。如果未提供，将使用默认数据库 `public`。
- `format`: 输出格式。可选。
  除了默认的 JSON 格式外，HTTP API 还允许你通过提供 `format` 查询参数来自定义输出格式，值如下：
  - `influxdb_v1`: [influxdb 查询
    API](https://docs.influxdata.com/influxdb/v1/tools/api/#query-http-endpoint)
    兼容格式。附加参数：
    - `epoch`: `[ns,u,µ,ms,s,m,h]`，返回指定精度的时间戳
  - `csv`: 逗号分隔值输出
  - `arrow`: [Arrow IPC
    格式](https://arrow.apache.org/docs/python/feather.html)。附加参数：
    - `compression`: `zstd` 或 `lz4`，默认：无压缩
  - `table`: 控制台输出的 ASCII 表格格式

### Body

- `sql`: SQL 语句。必填。

### 响应

响应是一个 JSON 对象，包含以下字段：

- `output`: SQL 执行结果，请参阅下面的示例以了解详细信息。
- `execution_time_ms`: 语句的执行时间（毫秒）。

### 示例

#### `INSERT` 语句

例如，要向数据库 `public` 的 `monitor` 表中插入数据，请使用以下命令：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
  http://localhost:4000/v1/sql?db=public
```

Response 包含受影响的行数：

```shell
{"output":[{"affectedrows":3}],"execution_time_ms":11}
```

#### `SELECT` 语句

你还可以使用 HTTP API 执行其他 SQL 语句。例如，从 `monitor` 表中查询数据：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public
```

Response 包含 JSON 格式的查询数据：

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "host",
              "data_type": "String"
            },
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "cpu",
              "data_type": "Float64"
            },
            {
              "name": "memory",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          [
            "127.0.0.1",
            1720728000000,
            0.5,
            0.1
          ]
        ],
        "total_rows": 1
      }
    }
  ],
  "execution_time_ms": 7
}
```

Response 包含以下字段：

- `output`: 执行结果。
  - `records`: 查询结果。
    - `schema`: 结果的 schema，包括每列的 schema。
    - `rows`: 查询结果的行，每行是一个包含 schema 中对应列值的数组。
- `execution_time_ms`: 语句的执行时间（毫秒）。

#### 时区

GreptimeDB 支持 HTTP 请求中的 `X-Greptime-Timezone` header。
它用于为当前 SQL 查询指定时区。

例如，以下请求使用时区 `+1:00` 进行查询：

```bash
curl -X POST \
-H 'Authorization: Basic {{authentication}}' \
-H 'X-Greptime-Timezone: +1:00' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql
```

查询后的结果为：

```json
{
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "TIME_ZONE",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          [
            "+01:00"
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 27
}
```

有关时区如何影响数据的写入和查询，请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md#time-zone)和[查询数据](/user-guide/query-data/sql.md#时区)部分中的 SQL 文档。

#### 使用 `table` 格式输出查询数据

你可以在查询字符串参数中使用 `table` 格式，以 ASCII 表格格式获取输出。

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public&format=table
```

输出

```
┌─host────────┬─ts────────────┬─cpu─┬─memory─┐
│ "127.0.0.1" │ 1667446797450 │ 0.1 │ 0.4    │
│ "127.0.0.1" │ 1667446798450 │ 0.5 │ 0.2    │
│ "127.0.0.2" │ 1667446798450 │ 0.2 │ 0.3    │
└─────────────┴───────────────┴─────┴────────┘
```

#### 使用 `influxdb_v1` 格式输出查询数据

你可以在查询字符串参数中使用 `influxdb_v1` 格式，以 InfluxDB 查询 API 兼容格式获取输出。

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public&format=influxdb_v1&epoch=ms
```

```json
{
  "results": [
    {
      "statement_id": 0,
      "series": [
        {
          "name": "",
          "columns": [
            "host",
            "cpu",
            "memory",
            "ts"
          ],
          "values": [
            [
              ["127.0.0.1", 0.1, 0.4, 1667446797450],
              ["127.0.0.1", 0.5, 0.2, 1667446798450],
              ["127.0.0.2", 0.2, 0.3, 1667446798450]
            ]
          ]
        }
      ]
    }
  ],
  "execution_time_ms": 2
}
```


### 使用 GreptimeDB 的 SQL 方言解析 SQL

为了解析和理解使用 GreptimeDB SQL 方言编写的查询（例如在仪表盘等工具里，为了更好的用户体验，提前解析 SQL 获取表名等），您可以使用 `/v1/sql/parse` 接口来获取 SQL 查询的结构化结果：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql/parse
```

```json
[
  {
    "Query": {
      "inner": {
        "with": null,
        "body": {
          "Select": {
            "distinct": null,
            "top": null,
            "top_before_distinct": false,
            "projection": [
              {
                "Wildcard": {
                  "opt_ilike": null,
                  "opt_exclude": null,
                  "opt_except": null,
                  "opt_replace": null,
                  "opt_rename": null
                }
              }
            ],
            "into": null,
            "from": [
              {
                "relation": {
                  "Table": {
                    "name": [
                      {
                        "value": "monitor",
                        "quote_style": null
                      }
                    ],
                    "alias": null,
                    "args": null,
                    "with_hints": [],
                    "version": null,
                    "with_ordinality": false,
                    "partitions": []
                  }
                },
                "joins": []
              }
            ],
            "lateral_views": [],
            "prewhere": null,
            "selection": null,
            "group_by": {
              "Expressions": [
                [],
                []
              ]
            },
            "cluster_by": [],
            "distribute_by": [],
            "sort_by": [],
            "having": null,
            "named_window": [],
            "qualify": null,
            "window_before_qualify": false,
            "value_table_mode": null,
            "connect_by": null
          }
        },
        "order_by": null,
        "limit": null,
        "limit_by": [],
        "offset": null,
        "fetch": null,
        "locks": [],
        "for_clause": null,
        "settings": null,
        "format_clause": null
      }
    }
  }
]
```

## POST PromQL 查询

### API 返回 Prometheus 查询结果格式

GreptimeDB 兼容 Prometheus 查询语言 (PromQL)，可以用于查询 GreptimeDB 中的数据。
有关所有兼容的 API，请参阅 [Prometheus 查询语言](/user-guide/query-data/promql#prometheus-http-api) 文档。

### API 返回 GreptimeDB JSON 格式

GreptimeDB 同样暴露了一个自己的 HTTP API 用于 PromQL 查询，即在当前的 API 路径 `/v1` 的后方拼接 `/promql`。
该接口的返回值是 GreptimeDB 的 JSON 格式，而不是 Prometheus 的格式。
如下示例：

```shell
curl -X GET \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -G \
  --data-urlencode 'query=avg(system_metrics{idc="idc_a"})' \
  --data-urlencode 'start=1667446797' \
  --data-urlencode 'end=1667446799' \
  --data-urlencode 'step=1s' \
  'http://localhost:4000/v1/promql?db=public'
```

接口中的参数和 Prometheus' HTTP API 的 [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) 接口相似：

- `db=<database>`：在使用 GreptimeDB 进行鉴权操作时必填，如果使用的是 `public` 数据库则可以忽略该参数。注意这个参数需要被设置在 query param 中，或者通过 `--header 'x-greptime-db-name: <database name>'` 设置在 HTTP 请求头中。
- `query=<string>`：必填。Prometheus 表达式查询字符串。
- `start=<rfc3339 | unix_timestamp>`：必填。开始时间戳，包含在内。它用于设置 `TIME INDEX` 列中的时间范围。
- `end=<rfc3339 | unix_timestamp>`：必填。结束时间戳，包含在内。它用于设置 `TIME INDEX` 列中的时间范围。
- `step=<duration | float>`：必填。查询步长，可以使用持续时间格式或秒数的浮点数。

以下是每种参数的类型的示例：

- rfc3339
  - `2015-07-01T20:11:00Z` (default to seconds resolution)
  - `2015-07-01T20:11:00.781Z` (with milliseconds resolution)
  - `2015-07-02T04:11:00+08:00` (with timezone offset)
- unix timestamp
  - `1435781460` (default to seconds resolution)
  - `1435781460.781` (with milliseconds resolution)
- duration
  - `1h` (1 hour)
  - `5d1m` (5 days and 1 minute)
  - `2` (2 seconds)
  - `2s` (also 2 seconds)

结果格式与 [Post SQL 语句](#post-sql-语句)中描述的 `/sql` 接口相同。

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "AVG(system_metrics.cpu_util)",
              "data_type": "Float64"
            },
            {
              "name": "AVG(system_metrics.memory_util)",
              "data_type": "Float64"
            },
            {
              "name": "AVG(system_metrics.disk_util)",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          [
            1667446798000,
            80.1,
            70.3,
            90
          ],
          [
            1667446799000,
            80.1,
            70.3,
            90
          ]
        ]
      }
    }
  ],
  "execution_time_ms": 5
}
```

## Post Influxdb line protocol 数据

<Tabs>

<TabItem value="InfluxDB line protocol V2" label="InfluxDB line protocol V2">

```shell
curl -X POST \
  -H 'Authorization: token {{username:password}}' \
  -d '{{Influxdb-line-protocol-data}}' \
  http://{{API-host}}/v1/influxdb/api/v2/write?precision={{time-precision}}
```

</TabItem>

<TabItem value="InfluxDB line protocol V1" label="InfluxDB line protocol V1">

```shell
curl -X POST \
  -d '{{Influxdb-line-protocol-data}}' \
  http://{{API-host}}/v1/influxdb/api/v1/write?u={{username}}&p={{password}}&precision={{time-precision}}
```

</TabItem>
</Tabs>

### Headers

- `Authorization`: **与其他 API 不同**，InfluxDB 行协议 API 使用 InfluxDB 鉴权格式。对于 V2 协议，Authorization 是 `token {{username:password}}`。

### Query string parameters

- `u`: 用户名。可选。它是 V1 的鉴权用户名。
- `p`: 密码。可选。它是 V1 的鉴权密码。
- `db`: 数据库名称。可选。默认值是 `public`。
- `precision`: 定义请求体中提供的时间戳的精度。请参考用户指南中的 [InfluxDB 行协议](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md)文档。

### Body

InfluxDB 行协议数据点。请参考 [InfluxDB 行协议](https://docs.influxdata.com/influxdb/v1/write_protocols/line_protocol_tutorial/#syntax) 文档。

### 示例

请参考用户指南中的 [InfluxDB 行协议](/user-guide/ingest-data/for-iot/influxdb-line-protocol.md)。

## 管理 Pipeline 的 API

在将日志写入 GreptimeDB 时，你可以使用 HTTP API 来管理 Pipeline。
请参考 [管理 Pipeline](/user-guide/logs/manage-pipelines.md) 文档。
