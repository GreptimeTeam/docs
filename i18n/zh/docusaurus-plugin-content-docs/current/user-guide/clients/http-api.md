# HTTP API

## 鉴权

GreptimeDB 支持 HTTP API 内置的 `Basic` 鉴权机制，接收 **SQL** 语言和 **OpenTSDB** 协议语言。按照下面的步骤来设置鉴权：

1. 使用 `Base64` 算法编码你的用户名和密码。
2. 在 HTTP 请求头中写入编码后的鉴权信息：`Authorization: Basic <base64-encoded-credentials>`

示例如下：

```shell
curl -X POST \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=show tables' \
http://localhost:4000/v1/sql?db=public
```

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "Tables",
              "data_type": "String"
            }
          ]
        },
        "rows": [
          ["numbers"]
        ]
      }
    }
  ],
  "execution_time_ms": 1
}
```

* `Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=` 是 `greptime_user:greptime_pwd` 使用 `Base64` 编码后的结果，请记得替换为你自己的用户名和密码使用 `Base64` 编码后的字符串。
* URL 中的 `public` 是数据库的名称，在鉴权时必须提供。

:::tip 注意
InfluxDB 使用自己的鉴权格式，详情请参考 [InfluxDB](./influxdb-line.md)。
:::

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

有关使用 HTTP API 发送 SQL 请求的更多信息，请参考[API 文档](/reference/sql/http-api.md)。

## 时区

GreptimeDB 支持 HTTP 协议中的 `X-Greptime-Timezone` 字段。
它用于为当前 SQL 查询指定时区。

例如，下方请求使用时区 `+1:00` 进行查询：

```bash
curl -X POST \
-H 'X-Greptime-Timezone: +1:00' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql?db=public
```

SQL 执行结果为：

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

有关时区如何影响数据的插入和查询，请参考 [写入数据](../ingest-data/for-iot/sql.md#时区) 和 [查询数据](../query-data/sql.md#时区) 中的 SQL 文档。

## 写入数据

* [SQL](../ingest-data/for-iot/sql.md)
* [OpenTSDB](../ingest-data/for-iot/opentsdb.md)

## 读取数据

* [SQL](../query-data/sql.md)
