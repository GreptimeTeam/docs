# HTTP API

GreptimeDB 提供了 HTTP API 用于与数据库进行交互。

## Headers

### 鉴权

GreptimeDB 支持 HTTP API 中内置的 `Basic` 鉴权机制。要设置鉴权，请按照以下步骤操作：

1. 使用 `<username:password>` 格式和 `Base64` 算法对用户名和密码进行编码。
2. 使用 `Authorization : Basic <base64-encoded-credentials>` 格式将编码后的凭据附加到 HTTP 请求头中。

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

### 时区

GreptimeDB 支持 HTTP 请求中的 `X-Greptime-Timezone` 头部。
它用于为当前 SQL 查询指定时区。

例如，以下请求使用时区 `+1:00` 进行查询：

```bash
curl -X POST \
-H 'X-Greptime-Timezone: +1:00' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql
```

结果为：

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

有关时区如何影响数据的写入和查询，请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md#time-zone)和[查询数据](/user-guide/query-data/sql.md#time-zone)部分中的 SQL 文档。

## POST SQL 语句

你可以使用 GreptimeDB 的 HTTP API 发送 SQL 语句与数据库进行交互。
例如，要将数据插入到 `monitor` 表中，可以使用以下命令：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=INSERT INTO monitor VALUES ("127.0.0.1", 1667446797450, 0.1, 0.4), ("127.0.0.2", 1667446798450, 0.2, 0.3), ("127.0.0.1", 1667446798450, 0.5, 0.2)' \
  http://localhost:4000/v1/sql?db=public
```

- API endpoint 为 `/v1/sql`。
- 鉴权 header 可选。有关更多信息，请参考[鉴权](#鉴权)部分。
- SQL 语句应包含在请求的 body 中作为 `sql` 的参数。
- URL 中的 `db` 参数可选，用于指定要使用的数据库。默认值为 `public`。

你还可以使用 HTTP API 执行其他 SQL 语句。
例如，从 `monitor` 表中搜索数据：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public
```

响应 JSON 格式的数据：

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


结果包含以下字段：

- `output`：执行结果。
  - `records`：查询结果。
    - `schema`：结果的 schema，包括每个列的 schema。
    - `rows`：查询结果的行数据，每行是一个数组，包含 schema 中对应列的值。
- `execution_time_ms`：该语句的执行时间，以毫秒为单位。

### 其他输出格式


除了默认的 JSON 格式外，通过指定 `format` 参数，HTTP API 还支持自定义以下输出格
式：

- `influxdb_v1`: [influxdb 查询接
  口](https://docs.influxdata.com/influxdb/v1/tools/api/#query-http-endpoint)兼
  容格式，支持额外参数：
  - `epoch`: `[ns,u,µ,ms,s,m,h]`, 控制输出时间戳精度
- `csv`: CSV 格式
- `arrow`: [Arrow IPC 格式](https://arrow.apache.org/docs/python/feather.html).
  支持额外的参数：
  - `compression`: `zstd` or `lz4`, 默认不设置压缩
- `table`: 用于终端数据的 ASCII 表格格式

以输出 `table` 格式为例：

```shell
curl -X POST \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "sql=SELECT * FROM monitor" \
  http://localhost:4000/v1/sql?db=public&format=table
```

Output

```
┌─host────────┬─ts────────────┬─cpu─┬─memory─┐
│ "127.0.0.1" │ 1667446797450 │ 0.1 │ 0.4    │
│ "127.0.0.1" │ 1667446798450 │ 0.5 │ 0.2    │
│ "127.0.0.2" │ 1667446798450 │ 0.2 │ 0.3    │
└─────────────┴───────────────┴─────┴────────┘
```


## POST PromQL 查询

GreptimeDB 同样暴露了一个自己的 HTTP API 用于 PromQL 查询，即在当前的 API 路径 `/v1` 的后方拼接 `/promql`，如下示例：

```shell
curl -X GET \
  -H 'Authorization: Basic {{authorization if exists}}' \
  -G \
  --data-urlencode 'db=public' \
  --data-urlencode 'query=avg(system_metrics{idc="idc_a"})' \
  --data-urlencode 'start=1667446797' \
  --data-urlencode 'end=1667446799' \
  --data-urlencode 'step=1s' \
  http://localhost:4000/v1/promql
```

接口中的参数和 Prometheus' HTTP API 的 [`range_query`](https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries) 接口相似：

- `db=<database>`：在使用 GreptimeDB 进行鉴权操作时必填。
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
